import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import Database from 'better-sqlite3'
import pg from 'pg'
import { memberships, getPricing } from '../src/data/memberships.js'
import { cities } from '../src/data/cities.js'
import { getVoucherPack, voucherPacks } from '../src/data/voucherPacks.js'
import { voucherStats, OPEN_RESERVATION_STATUSES } from '../src/utils/vouchers.js'

const { Pool } = pg

function now() { return new Date().toISOString() }
function stringify(value) { return JSON.stringify(value ?? null) }
function parse(value, fallback = null) { try { return value == null ? fallback : JSON.parse(value) } catch { return fallback } }
function toPg(sql) { let i = 0; return sql.replace(/\?/g, () => `$${++i}`) }
function cryptoId() { return Math.random().toString(36).slice(2, 10) }

class SqliteAdapter {
  constructor(file) {
    mkdirSync(dirname(file), { recursive: true })
    this.db = new Database(file)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
  }
  async exec(sql) { this.db.exec(sql) }
  async run(sql, params = []) { return this.db.prepare(sql).run(params) }
  async get(sql, params = []) { return this.db.prepare(sql).get(params) }
  async all(sql, params = []) { return this.db.prepare(sql).all(params) }
  async tx(fn) {
    this.db.exec('BEGIN IMMEDIATE')
    try { const out = await fn(this); this.db.exec('COMMIT'); return out } catch (err) { this.db.exec('ROLLBACK'); throw err }
  }
}

class PostgresAdapter {
  constructor(connectionString) { this.pool = new Pool({ connectionString }) }
  async exec(sql) { await this.pool.query(sql) }
  async run(sql, params = []) { return this.pool.query(toPg(sql), params) }
  async get(sql, params = []) { const r = await this.pool.query(toPg(sql), params); return r.rows[0] }
  async all(sql, params = []) { const r = await this.pool.query(toPg(sql), params); return r.rows }
  async tx(fn) {
    const client = await this.pool.connect()
    const scoped = {
      run: (sql, params = []) => client.query(toPg(sql), params),
      get: async (sql, params = []) => (await client.query(toPg(sql), params)).rows[0],
      all: async (sql, params = []) => (await client.query(toPg(sql), params)).rows,
    }
    try { await client.query('BEGIN'); const out = await fn(scoped); await client.query('COMMIT'); return out }
    catch (err) { await client.query('ROLLBACK'); throw err }
    finally { client.release() }
  }
}

function membershipFrom(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    country: row.country_id,
    cities: parse(row.cities, []),
    hotels: parse(row.hotels, []),
    annualFee: Number(row.annual_fee) || 0,
    currency: row.currency,
    salePrice: row.sale_price == null ? null : Number(row.sale_price),
    paidAmount: Number(row.paid_amount) || 0,
    commissionRate: Number(row.commission_rate) || 0,
    commissionAmount: Number(row.commission_amount) || 0,
    diningDiscount: row.dining_discount == null ? null : Number(row.dining_discount),
    roomDiscount: row.room_discount == null ? null : Number(row.room_discount),
    freeNight: !!Number(row.free_night),
    spaBenefit: !!Number(row.spa_benefit),
    benefits: parse(row.benefits, []),
    bestFor: parse(row.best_for, []),
    estimatedSavings: Number(row.estimated_savings) || 0,
    scores: parse(row.scores, {}),
    notes: row.notes || '',
    officialUrl: row.official_url || '',
  }
}
function voucherFrom(row, stats = {}) {
  return { membershipId: row.membership_id, templateId: row.template_id, category: row.category, title: row.title, description: row.description || '', quantity: Number(row.quantity) || 0, validUntil: row.valid_until, hotels: parse(row.hotels, []), city: row.city_id || undefined, transferable: !!Number(row.transferable), note: row.note || '', ...stats }
}
function reservationFrom(row) { return { id: row.id, membershipId: row.membership_id, templateId: row.template_id, title: row.title, date: row.date, adults: Number(row.adults) || 0, children: Number(row.children) || 0, childAges: parse(row.child_ages, []), hotel: row.hotel || '', note: row.note || '', status: row.status, createdAt: row.created_at, updatedAt: row.updated_at } }
function orderFrom(row) { return { id: row.id, membershipId: row.membership_id, buyerName: row.buyer_name, buyerEmail: row.buyer_email, buyerPhone: row.buyer_phone || '', city: row.city_id, listPrice: Number(row.list_price) || 0, salePrice: row.sale_price == null ? null : Number(row.sale_price), paidAmount: Number(row.paid_amount) || 0, currency: row.currency, commissionRate: Number(row.commission_rate) || 0, commissionAmount: Number(row.commission_amount) || 0, status: row.status, invoiceUrl: row.invoice_url || null, createdAt: row.created_at, updatedAt: row.updated_at } }
function transferFrom(row) { return { id: row.id, membershipId: row.membership_id, templateId: row.template_id, title: row.title, recipientName: row.recipient_name || '', recipientContact: row.recipient_contact || '', message: row.message || '', createdAt: row.created_at } }
function userFrom(row) { return row && { id: row.id, provider: row.provider, name: row.name, email: row.email, picture: row.picture_url || '', createdAt: row.created_at, updatedAt: row.updated_at } }

export class StayEasyStore {
  constructor(db) { this.db = db; this.tokens = new Map() }
  static async open() {
    const db = (process.env.DATABASE_URL || '').startsWith('postgres') ? new PostgresAdapter(process.env.DATABASE_URL) : new SqliteAdapter(resolve(process.env.SQLITE_PATH || 'backend/.data/stayeasy.sqlite'))
    const store = new StayEasyStore(db)
    await store.migrate(); await store.seed(); return store
  }
  async migrate() {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, provider TEXT NOT NULL, provider_subject TEXT NOT NULL UNIQUE, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, picture_url TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS cities (id TEXT PRIMARY KEY, country_id TEXT NOT NULL, name_en TEXT, sort_order INTEGER DEFAULT 0, active INTEGER DEFAULT 1);
      CREATE TABLE IF NOT EXISTS memberships (id TEXT PRIMARY KEY, name TEXT NOT NULL, brand TEXT NOT NULL, country_id TEXT NOT NULL, cities TEXT NOT NULL, hotels TEXT NOT NULL, annual_fee REAL NOT NULL, currency TEXT NOT NULL, sale_price REAL, paid_amount REAL NOT NULL, commission_rate REAL DEFAULT 0, commission_amount REAL DEFAULT 0, dining_discount INTEGER, room_discount INTEGER, free_night INTEGER DEFAULT 0, spa_benefit INTEGER DEFAULT 0, benefits TEXT NOT NULL, best_for TEXT NOT NULL, estimated_savings REAL DEFAULT 0, scores TEXT NOT NULL, notes TEXT, official_url TEXT, active INTEGER DEFAULT 1);
      CREATE TABLE IF NOT EXISTS membership_cities (membership_id TEXT NOT NULL, city_id TEXT NOT NULL, PRIMARY KEY (membership_id, city_id));
      CREATE TABLE IF NOT EXISTS membership_hotels (id TEXT PRIMARY KEY, membership_id TEXT NOT NULL, city_id TEXT, name TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS membership_tags (membership_id TEXT NOT NULL, tag TEXT NOT NULL, PRIMARY KEY (membership_id, tag));
      CREATE TABLE IF NOT EXISTS membership_scores (membership_id TEXT PRIMARY KEY, family_dining INTEGER, staycation INTEGER, business_travel INTEGER, ease_of_use INTEGER, overall INTEGER);
      CREATE TABLE IF NOT EXISTS voucher_templates (id TEXT PRIMARY KEY, membership_id TEXT NOT NULL, template_id TEXT NOT NULL, category TEXT NOT NULL, title TEXT NOT NULL, description TEXT, quantity INTEGER NOT NULL, valid_until TEXT NOT NULL, city_id TEXT, hotels TEXT NOT NULL, transferable INTEGER DEFAULT 0, note TEXT, UNIQUE (membership_id, template_id));
      CREATE TABLE IF NOT EXISTS voucher_template_hotels (voucher_template_id TEXT NOT NULL, hotel_name TEXT NOT NULL, PRIMARY KEY (voucher_template_id, hotel_name));
      CREATE TABLE IF NOT EXISTS user_memberships (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, membership_id TEXT NOT NULL, source TEXT NOT NULL, status TEXT NOT NULL, activated_at TEXT NOT NULL, removed_at TEXT);
      CREATE UNIQUE INDEX IF NOT EXISTS user_memberships_active_idx ON user_memberships(user_id, membership_id) WHERE status = 'active';
      CREATE TABLE IF NOT EXISTS voucher_usage (user_id TEXT NOT NULL, membership_id TEXT NOT NULL, template_id TEXT NOT NULL, used_count INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY (user_id, membership_id, template_id));
      CREATE TABLE IF NOT EXISTS reservations (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, membership_id TEXT NOT NULL, template_id TEXT NOT NULL, title TEXT NOT NULL, date TEXT, adults INTEGER NOT NULL, children INTEGER NOT NULL, child_ages TEXT NOT NULL, hotel TEXT, note TEXT, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, membership_id TEXT NOT NULL, buyer_name TEXT NOT NULL, buyer_email TEXT NOT NULL, buyer_phone TEXT, city_id TEXT, list_price REAL NOT NULL, sale_price REAL, paid_amount REAL NOT NULL, currency TEXT NOT NULL, commission_rate REAL NOT NULL, commission_amount REAL NOT NULL, status TEXT NOT NULL, invoice_url TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS transfers (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, membership_id TEXT NOT NULL, template_id TEXT NOT NULL, title TEXT NOT NULL, recipient_name TEXT, recipient_contact TEXT, message TEXT, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS assistance_requests (id TEXT PRIMARY KEY, user_id TEXT, name TEXT, contact TEXT, city_id TEXT, membership_id TEXT, preferred_date TEXT, adults INTEGER, children INTEGER, request_type TEXT, message TEXT, status TEXT NOT NULL, created_at TEXT NOT NULL);
    `)
  }
  async seed() {
    let i = 0
    for (const c of cities) await this.db.run(`INSERT INTO cities (id,country_id,name_en,sort_order,active) VALUES (?,?,?,?,1) ON CONFLICT (id) DO UPDATE SET country_id=excluded.country_id, sort_order=excluded.sort_order, active=1`, [c.id, c.country, c.id, i++])
    for (const m of memberships) {
      const p = getPricing(m)
      await this.db.run(`INSERT INTO memberships (id,name,brand,country_id,cities,hotels,annual_fee,currency,sale_price,paid_amount,commission_rate,commission_amount,dining_discount,room_discount,free_night,spa_benefit,benefits,best_for,estimated_savings,scores,notes,official_url,active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1) ON CONFLICT (id) DO UPDATE SET name=excluded.name, brand=excluded.brand, country_id=excluded.country_id, cities=excluded.cities, hotels=excluded.hotels, annual_fee=excluded.annual_fee, currency=excluded.currency, sale_price=excluded.sale_price, paid_amount=excluded.paid_amount, commission_rate=excluded.commission_rate, commission_amount=excluded.commission_amount, dining_discount=excluded.dining_discount, room_discount=excluded.room_discount, free_night=excluded.free_night, spa_benefit=excluded.spa_benefit, benefits=excluded.benefits, best_for=excluded.best_for, estimated_savings=excluded.estimated_savings, scores=excluded.scores, notes=excluded.notes, official_url=excluded.official_url, active=1`, [m.id,m.name,m.brand,m.country,stringify(m.cities),stringify(m.hotels),m.annualFee,m.currency,p.salePrice,p.paidAmount,p.commissionRate,p.commissionAmount,m.diningDiscount,m.roomDiscount,m.freeNight?1:0,m.spaBenefit?1:0,stringify(m.benefits),stringify(m.bestFor),m.estimatedSavings,stringify(m.scores),m.notes,m.officialUrl])
      await this.db.run('DELETE FROM membership_cities WHERE membership_id=?',[m.id]); await this.db.run('DELETE FROM membership_hotels WHERE membership_id=?',[m.id]); await this.db.run('DELETE FROM membership_tags WHERE membership_id=?',[m.id])
      for (const city of m.cities) await this.db.run('INSERT INTO membership_cities (membership_id,city_id) VALUES (?,?)',[m.id,city])
      for (const [idx, hotel] of m.hotels.entries()) await this.db.run('INSERT INTO membership_hotels (id,membership_id,city_id,name) VALUES (?,?,?,?)',[`${m.id}:hotel:${idx}`,m.id,null,hotel])
      for (const tag of m.bestFor) await this.db.run('INSERT INTO membership_tags (membership_id,tag) VALUES (?,?)',[m.id,tag])
      await this.db.run(`INSERT INTO membership_scores (membership_id,family_dining,staycation,business_travel,ease_of_use,overall) VALUES (?,?,?,?,?,?) ON CONFLICT (membership_id) DO UPDATE SET family_dining=excluded.family_dining, staycation=excluded.staycation, business_travel=excluded.business_travel, ease_of_use=excluded.ease_of_use, overall=excluded.overall`, [m.id,m.scores.familyDining,m.scores.staycation,m.scores.businessTravel,m.scores.easeOfUse,m.scores.overall])
    }
    for (const [membershipId, pack] of Object.entries(voucherPacks)) for (const v of pack) {
      const id = `${membershipId}:${v.templateId}`
      await this.db.run(`INSERT INTO voucher_templates (id,membership_id,template_id,category,title,description,quantity,valid_until,city_id,hotels,transferable,note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT (membership_id,template_id) DO UPDATE SET category=excluded.category, title=excluded.title, description=excluded.description, quantity=excluded.quantity, valid_until=excluded.valid_until, city_id=excluded.city_id, hotels=excluded.hotels, transferable=excluded.transferable, note=excluded.note`, [id,membershipId,v.templateId,v.category,v.title,v.description||'',v.quantity,v.validUntil,v.city||null,stringify(v.hotels||[]),v.transferable?1:0,v.note||''])
      await this.db.run('DELETE FROM voucher_template_hotels WHERE voucher_template_id=?',[id]); for (const h of v.hotels||[]) await this.db.run('INSERT INTO voucher_template_hotels (voucher_template_id,hotel_name) VALUES (?,?)',[id,h])
    }
  }
  rememberToken(token, user) { this.tokens.set(token, user.id) }
  async userByToken(token) { const id = this.tokens.get(token); return id ? this.getUserById(id) : null }
  async getUserById(id) { return userFrom(await this.db.get('SELECT * FROM users WHERE id=?',[id])) }
  async upsertDemoUser(credential, makeId) {
    const subject = ['demo-google-user','demo.user@gmail.com'].includes(String(credential)) ? 'demo-google-user' : String(credential || 'demo-google-user')
    const existing = await this.db.get('SELECT * FROM users WHERE provider=? AND provider_subject=?',['google',subject]); if (existing) return userFrom(existing)
    const ts = now(), email = subject === 'demo-google-user' ? 'demo.user@gmail.com' : `demo-${subject.slice(-8)}@stayeasy.local`, id = makeId('usr')
    await this.db.run('INSERT INTO users (id,provider,provider_subject,name,email,picture_url,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)',[id,'google',subject,subject==='demo-google-user'?'Demo User':'StayEasy Demo User',email,'',ts,ts])
    return this.getUserById(id)
  }
  async memberships(params = new URLSearchParams()) {
    let list = (await this.db.all('SELECT * FROM memberships WHERE active=1')).map(membershipFrom)
    const city=params.get('city'), benefit=params.get('benefit')
    if (city) list = list.filter(m=>m.cities.includes(city))
    if (benefit) list = list.filter(m=>m.bestFor.includes(benefit)||(benefit==='dining'&&m.diningDiscount!=null)||(benefit==='room'&&(m.roomDiscount!=null||m.freeNight))||(benefit==='spa'&&m.spaBenefit)||(benefit==='freeNight'&&m.freeNight)||getVoucherPack(m.id).some(v=>v.category===benefit))
    return list.sort((a,b)=>(b.scores.overall||0)-(a.scores.overall||0))
  }
  async membership(id) { return membershipFrom(await this.db.get('SELECT * FROM memberships WHERE id=? AND active=1',[id])) }
  async compare(ids) { const out=[]; for (const id of ids.slice(0,3)) { const m=await this.membership(id); if (m) out.push(m) } return out }
  async voucherTemplates(membershipId) { return (await this.db.all('SELECT * FROM voucher_templates WHERE membership_id=? ORDER BY id',[membershipId])).map(r=>voucherFrom(r)) }
  async rawVoucher(membershipId, templateId, db=this.db) { return db.get('SELECT * FROM voucher_templates WHERE membership_id=? AND template_id=?',[membershipId,templateId]) }
  async voucherView(userId, row, db=this.db) {
    const u=await db.get('SELECT used_count FROM voucher_usage WHERE user_id=? AND membership_id=? AND template_id=?',[userId,row.membership_id,row.template_id])
    const h=await db.get("SELECT COUNT(*) AS count FROM reservations WHERE user_id=? AND membership_id=? AND template_id=? AND status IN ('requested','confirmed')",[userId,row.membership_id,row.template_id])
    const t=await db.get('SELECT COUNT(*) AS count FROM transfers WHERE user_id=? AND membership_id=? AND template_id=?',[userId,row.membership_id,row.template_id])
    return voucherFrom(row, voucherStats(row.quantity, u?.used_count||0, h?.count||0, t?.count||0))
  }
  async wallet(userId) {
    const memberships=(await this.db.all("SELECT m.* FROM user_memberships um JOIN memberships m ON m.id=um.membership_id WHERE um.user_id=? AND um.status='active' ORDER BY um.activated_at DESC",[userId])).map(membershipFrom)
    const vouchers=[]; for (const m of memberships) for (const row of await this.db.all('SELECT * FROM voucher_templates WHERE membership_id=? ORDER BY id',[m.id])) vouchers.push(await this.voucherView(userId,row))
    const reservations=(await this.db.all('SELECT * FROM reservations WHERE user_id=? ORDER BY created_at DESC',[userId])).map(reservationFrom)
    const orders=(await this.db.all('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC',[userId])).map(orderFrom)
    const transfers=(await this.db.all('SELECT * FROM transfers WHERE user_id=? ORDER BY created_at DESC',[userId])).map(transferFrom)
    return { summary:{ membershipCount:memberships.length, availableVoucherCount:vouchers.reduce((s,v)=>s+v.available,0), expiringSoonCount:vouchers.filter(v=>v.available>0&&Math.ceil((new Date(`${v.validUntil}T00:00:00Z`).getTime()-Date.now())/86400000)<=30).length, openReservationCount:reservations.filter(r=>OPEN_RESERVATION_STATUSES.includes(r.status)).length }, memberships, vouchers, reservations, orders, transfers }
  }
  async addMembership(userId, membershipId, source='free_join', db=this.db) {
    if (!(await db.get('SELECT id FROM memberships WHERE id=? AND active=1',[membershipId]))) return false
    if (await db.get("SELECT id FROM user_memberships WHERE user_id=? AND membership_id=? AND status='active'",[userId,membershipId])) return true
    await db.run("INSERT INTO user_memberships (id,user_id,membership_id,source,status,activated_at,removed_at) VALUES (?,?,?,?, 'active', ?, NULL)",[`um_${cryptoId()}`,userId,membershipId,source,now()]); return true
  }
  async removeMembership(userId,membershipId){await this.db.tx(async tx=>{await tx.run("UPDATE user_memberships SET status='removed', removed_at=? WHERE user_id=? AND membership_id=? AND status='active'",[now(),userId,membershipId]); await tx.run('DELETE FROM voucher_usage WHERE user_id=? AND membership_id=?',[userId,membershipId]); await tx.run('DELETE FROM reservations WHERE user_id=? AND membership_id=?',[userId,membershipId]); await tx.run('DELETE FROM transfers WHERE user_id=? AND membership_id=?',[userId,membershipId])})}
  async ownsMembership(userId,membershipId,db=this.db){return !!(await db.get("SELECT id FROM user_memberships WHERE user_id=? AND membership_id=? AND status='active'",[userId,membershipId]))}
  async availableVoucher(userId,membershipId,templateId,db=this.db){const row=await this.rawVoucher(membershipId,templateId,db); return row?this.voucherView(userId,row,db):null}
  async createReservation(userId,input,makeId){return this.db.tx(async tx=>{if(!(await this.ownsMembership(userId,input.membershipId,tx))){const e=new Error('Membership is not in wallet.'); e.code='FORBIDDEN'; throw e} const v=await this.availableVoucher(userId,input.membershipId,input.templateId,tx); if(!v){const e=new Error('Voucher was not found.'); e.code='VOUCHER_NOT_FOUND'; throw e} if(v.available<=0){const e=new Error('No available voucher remains.'); e.code='VOUCHER_NOT_AVAILABLE'; throw e} const id=makeId('res'), ts=now(); await tx.run('INSERT INTO reservations (id,user_id,membership_id,template_id,title,date,adults,children,child_ages,hotel,note,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,userId,input.membershipId,input.templateId,v.title,input.date,Number(input.adults||1),Number(input.children||0),stringify(Array.isArray(input.childAges)?input.childAges:[]),input.hotel||'',input.note||'','requested',ts,ts]); return reservationFrom(await tx.get('SELECT * FROM reservations WHERE id=?',[id]))})}
  async updateReservationStatus(userId,id,status){return this.db.tx(async tx=>{const r=await tx.get('SELECT * FROM reservations WHERE id=? AND user_id=?',[id,userId]); if(!r)return null; const valid={requested:['confirmed','cancelled','completed'],confirmed:['completed','cancelled'],completed:[],cancelled:[]}; if(!valid[r.status]?.includes(status)){const e=new Error('Reservation status transition is invalid.'); e.code='INVALID_STATUS_TRANSITION'; throw e} await tx.run('UPDATE reservations SET status=?, updated_at=? WHERE id=? AND user_id=?',[status,now(),id,userId]); if(status==='completed') await this.incrementUsage(userId,r.membership_id,r.template_id,tx); return reservationFrom(await tx.get('SELECT * FROM reservations WHERE id=? AND user_id=?',[id,userId]))})}
  async incrementUsage(userId,membershipId,templateId,db){const row=await db.get('SELECT used_count FROM voucher_usage WHERE user_id=? AND membership_id=? AND template_id=?',[userId,membershipId,templateId]); if(row) await db.run('UPDATE voucher_usage SET used_count=used_count+1, updated_at=? WHERE user_id=? AND membership_id=? AND template_id=?',[now(),userId,membershipId,templateId]); else await db.run('INSERT INTO voucher_usage (user_id,membership_id,template_id,used_count,updated_at) VALUES (?,?,?,1,?)',[userId,membershipId,templateId,now()])}
  async deleteReservation(userId,id){await this.db.run('DELETE FROM reservations WHERE id=? AND user_id=?',[id,userId])}
  async reservations(userId){return (await this.db.all('SELECT * FROM reservations WHERE user_id=? ORDER BY created_at DESC',[userId])).map(reservationFrom)}
  async createOrder(userId,input,user,makeId){const m=await this.membership(input.membershipId); if(!m)return null; const id=makeId('ord'), ts=now(); await this.db.run('INSERT INTO orders (id,user_id,membership_id,buyer_name,buyer_email,buyer_phone,city_id,list_price,sale_price,paid_amount,currency,commission_rate,commission_amount,status,invoice_url,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,?,?)',[id,userId,m.id,input.buyerName||user.name,input.buyerEmail||user.email,input.buyerPhone||'',input.city||m.cities[0],m.annualFee,m.salePrice,m.paidAmount,m.currency,m.commissionRate,m.commissionAmount,'requested',ts,ts]); return orderFrom(await this.db.get('SELECT * FROM orders WHERE id=? AND user_id=?',[id,userId]))}
  async orders(userId){return (await this.db.all('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC',[userId])).map(orderFrom)}
  async updateOrderStatus(userId,id,status){return this.db.tx(async tx=>{const o=await tx.get('SELECT * FROM orders WHERE id=? AND user_id=?',[id,userId]); if(!o)return null; const valid={requested:['invoiced','cancelled'],invoiced:['paid','cancelled'],paid:['activated','cancelled'],activated:[],cancelled:[]}; if(!valid[o.status]?.includes(status)){const e=new Error('Order status transition is invalid.'); e.code='INVALID_STATUS_TRANSITION'; throw e} await tx.run('UPDATE orders SET status=?, updated_at=? WHERE id=? AND user_id=?',[status,now(),id,userId]); if(status==='activated') await this.addMembership(userId,o.membership_id,'order_activation',tx); return orderFrom(await tx.get('SELECT * FROM orders WHERE id=? AND user_id=?',[id,userId]))})}
  async createTransfer(userId,input,makeId){return this.db.tx(async tx=>{const v=await this.availableVoucher(userId,input.membershipId,input.templateId,tx); if(!v){const e=new Error('Voucher was not found.'); e.code='VOUCHER_NOT_FOUND'; throw e} if(!v.transferable){const e=new Error('Voucher is not transferable.'); e.code='VOUCHER_NOT_TRANSFERABLE'; throw e} if(v.available<=0){const e=new Error('No available voucher remains.'); e.code='VOUCHER_NOT_AVAILABLE'; throw e} const id=makeId('trn'); await tx.run('INSERT INTO transfers (id,user_id,membership_id,template_id,title,recipient_name,recipient_contact,message,created_at) VALUES (?,?,?,?,?,?,?,?,?)',[id,userId,input.membershipId,input.templateId,v.title,input.recipientName||'',input.recipientContact||'',input.message||'',now()]); return transferFrom(await tx.get('SELECT * FROM transfers WHERE id=? AND user_id=?',[id,userId]))})}
  async transfers(userId){return (await this.db.all('SELECT * FROM transfers WHERE user_id=? ORDER BY created_at DESC',[userId])).map(transferFrom)}
  async settlement(){const orders=(await this.db.all("SELECT * FROM orders WHERE status='activated'")).map(orderFrom); return {gmv:orders.reduce((s,o)=>s+o.paidAmount,0),commission:orders.reduce((s,o)=>s+o.commissionAmount,0),activatedOrderCount:orders.length,currency:'VND'}}
  async createAssistance(input,makeId,userId=null){const entry={id:makeId('ast'),...input,status:'new',createdAt:now()}; await this.db.run('INSERT INTO assistance_requests (id,user_id,name,contact,city_id,membership_id,preferred_date,adults,children,request_type,message,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',[entry.id,userId,input.name||'',input.contact||'',input.city||input.cityId||'',input.membershipId||null,input.preferredDate||null,input.adults||0,input.children||0,input.requestType||'',input.message||'',entry.status,entry.createdAt]); return entry}
}
