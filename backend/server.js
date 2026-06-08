import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { URL } from 'node:url'
import { OhmySelectStore } from './db.js'

const PORT = Number(process.env.PORT || 8787)
const API_PREFIX = '/api/v1'
const store = await OhmySelectStore.open()

function now() { return new Date().toISOString() }
function makeId(prefix) { return `${prefix}_${randomUUID().slice(0, 8)}` }
function headers() { return { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS' } }
function json(res, status, payload) { res.writeHead(status, headers()); res.end(JSON.stringify(payload)) }
function noContent(res) { res.writeHead(204, headers()); res.end() }
function error(res, status, code, message, details = {}) { json(res, status, { code, message, details }) }
function statusFor(code) { return { AUTH_REQUIRED:401, ADMIN_REQUIRED:403, FORBIDDEN:403, MEMBERSHIP_NOT_FOUND:404, VOUCHER_NOT_FOUND:404, ORDER_NOT_FOUND:404, RESERVATION_NOT_FOUND:404, ASSISTANCE_REQUEST_NOT_FOUND:404, VOUCHER_NOT_AVAILABLE:409, VOUCHER_NOT_TRANSFERABLE:409, INVALID_STATUS_TRANSITION:409 }[code] || 500 }
async function readBody(req) { const chunks=[]; for await (const c of req) chunks.push(c); if(!chunks.length)return {}; try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{return {}} }
async function currentUser(req) { const h=req.headers.authorization||''; const token=h.startsWith('Bearer ')?h.slice(7):''; return token ? store.userByToken(token) : null }
async function requireUser(req,res){const user=await currentUser(req); if(!user){error(res,401,'AUTH_REQUIRED','Sign in is required.'); return null} return user}
function adminEmails(){return new Set(String(process.env.ADMIN_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean))}
async function requireAdmin(req,res){const user=await requireUser(req,res); if(!user)return null; if(!adminEmails().has(String(user.email||'').toLowerCase())){error(res,403,'ADMIN_REQUIRED','Admin access is required.'); return null} return user}
function normalizePath(pathname){const raw=pathname.replace(/\/+$/,'')||'/'; return raw.startsWith(API_PREFIX)?raw.slice(API_PREFIX.length)||'/':raw}

async function route(req,res){
  if(req.method==='OPTIONS') return noContent(res)
  const url=new URL(req.url,`http://${req.headers.host}`)
  const path=normalizePath(url.pathname)
  const body=['POST','PATCH','PUT'].includes(req.method)?await readBody(req):{}

  if(req.method==='GET'&&path==='/') return json(res,200,{ok:true,service:'ohmyselect-backend',docs:'/api/v1/health'})
  if(req.method==='GET'&&path==='/health') return json(res,200,{ok:true,service:'ohmyselect-backend',time:now()})
  if(req.method==='GET'&&path==='/cities') return json(res,200,await store.db.all('SELECT id, country_id AS country FROM cities WHERE active = 1 ORDER BY sort_order'))
  if(req.method==='POST'&&path==='/auth/google'){const user=await store.upsertDemoUser(body.credential||body.idToken,makeId); const token=`demo_${randomUUID()}`; store.rememberToken(token,user); return json(res,200,{accessToken:token,refreshToken:token,token,user})}
  if(req.method==='GET'&&(path==='/auth/me'||path==='/me')){const user=await requireUser(req,res); if(!user)return; return json(res,200,user)}
  if(req.method==='POST'&&path==='/auth/logout') return noContent(res)
  if(req.method==='GET'&&path==='/memberships') return json(res,200,await store.memberships(url.searchParams))
  if(req.method==='GET'&&path==='/memberships/compare'){const ids=(url.searchParams.get('ids')||'').split(',').filter(Boolean); return json(res,200,await store.compare(ids))}
  const membershipVoucherMatch=path.match(/^\/memberships\/([^/]+)\/vouchers$/)
  if(req.method==='GET'&&membershipVoucherMatch) return json(res,200,await store.voucherTemplates(membershipVoucherMatch[1]))
  const membershipMatch=path.match(/^\/memberships\/([^/]+)$/)
  if(req.method==='GET'&&membershipMatch){const membership=await store.membership(membershipMatch[1]); if(!membership)return error(res,404,'MEMBERSHIP_NOT_FOUND','Membership was not found.'); return json(res,200,{...membership,vouchers:await store.voucherTemplates(membership.id)})}

  if(path.startsWith('/admin/')){
    const admin=await requireAdmin(req,res); if(!admin)return
    if(req.method==='GET'&&path==='/admin/orders') return json(res,200,await store.adminOrders())
    const adminOrderMatch=path.match(/^\/admin\/orders\/([^/]+)\/status$/)
    if(req.method==='PATCH'&&adminOrderMatch){try{const order=await store.adminUpdateOrderStatus(adminOrderMatch[1],body.status); if(!order)return error(res,404,'ORDER_NOT_FOUND','Order was not found.'); return json(res,200,order)}catch(err){return error(res,statusFor(err.code),err.code||'INTERNAL_ERROR',err.message)}}
    if(req.method==='GET'&&path==='/admin/reservations') return json(res,200,await store.adminReservations())
    const adminReservationMatch=path.match(/^\/admin\/reservations\/([^/]+)\/status$/)
    if(req.method==='PATCH'&&adminReservationMatch){try{const reservation=await store.adminUpdateReservationStatus(adminReservationMatch[1],body.status); if(!reservation)return error(res,404,'RESERVATION_NOT_FOUND','Reservation was not found.'); return json(res,200,reservation)}catch(err){return error(res,statusFor(err.code),err.code||'INTERNAL_ERROR',err.message)}}
    if(req.method==='GET'&&path==='/admin/assistance-requests') return json(res,200,await store.adminAssistanceRequests())
    const adminAssistanceMatch=path.match(/^\/admin\/assistance-requests\/([^/]+)$/)
    if(req.method==='PATCH'&&adminAssistanceMatch){const request=await store.adminUpdateAssistanceRequest(adminAssistanceMatch[1],body); if(!request)return error(res,404,'ASSISTANCE_REQUEST_NOT_FOUND','Assistance request was not found.'); return json(res,200,request)}
    if(req.method==='GET'&&path==='/admin/settlements/summary') return json(res,200,await store.settlement())
    return error(res,404,'NOT_FOUND','Endpoint was not found.')
  }

  if(req.method==='GET'&&(path==='/me/wallet'||path==='/wallet')){const user=await requireUser(req,res); if(!user)return; return json(res,200,await store.wallet(user.id))}
  if(req.method==='POST'&&(path==='/me/memberships'||path==='/wallet/memberships')){const user=await requireUser(req,res); if(!user)return; if(!(await store.addMembership(user.id,body.membershipId,body.source||'free_join')))return error(res,404,'MEMBERSHIP_NOT_FOUND','Membership was not found.'); return json(res,201,await store.wallet(user.id))}
  const ownedMembershipMatch=path.match(/^\/me\/memberships\/([^/]+)$/)||path.match(/^\/wallet\/memberships\/([^/]+)$/)
  if(req.method==='DELETE'&&ownedMembershipMatch){const user=await requireUser(req,res); if(!user)return; await store.removeMembership(user.id,ownedMembershipMatch[1]); return noContent(res)}
  if(req.method==='GET'&&path==='/wallet/vouchers'){const user=await requireUser(req,res); if(!user)return; const category=url.searchParams.get('category'), membershipId=url.searchParams.get('membershipId'); let vouchers=(await store.wallet(user.id)).vouchers; if(membershipId)vouchers=vouchers.filter(v=>v.membershipId===membershipId); if(category&&category!=='all')vouchers=vouchers.filter(v=>v.category===category); return json(res,200,vouchers)}

  if(req.method==='GET'&&(path==='/me/reservations'||path==='/reservations')){const user=await requireUser(req,res); if(!user)return; return json(res,200,await store.reservations(user.id))}
  if(req.method==='POST'&&(path==='/me/reservations'||path==='/reservations')){const user=await requireUser(req,res); if(!user)return; try{return json(res,201,await store.createReservation(user.id,body,makeId))}catch(err){return error(res,statusFor(err.code),err.code||'INTERNAL_ERROR',err.message)}}
  const reservationMatch=path.match(/^\/me\/reservations\/([^/]+)$/)||path.match(/^\/reservations\/([^/]+)$/)||path.match(/^\/reservations\/([^/]+)\/status$/)
  if(reservationMatch){const user=await requireUser(req,res); if(!user)return; const id=reservationMatch[1]; if(req.method==='PATCH'){try{const reservation=await store.updateReservationStatus(user.id,id,body.status); if(!reservation)return error(res,404,'RESERVATION_NOT_FOUND','Reservation was not found.'); return json(res,200,reservation)}catch(err){return error(res,statusFor(err.code),err.code||'INTERNAL_ERROR',err.message)}} if(req.method==='DELETE'){await store.deleteReservation(user.id,id); return noContent(res)}}

  if(req.method==='GET'&&(path==='/me/orders'||path==='/orders')){const user=await requireUser(req,res); if(!user)return; return json(res,200,await store.orders(user.id))}
  if(req.method==='POST'&&(path==='/me/orders'||path==='/orders')){const user=await requireUser(req,res); if(!user)return; const order=await store.createOrder(user.id,body,user,makeId); if(!order)return error(res,404,'MEMBERSHIP_NOT_FOUND','Membership was not found.'); return json(res,201,order)}
  const orderMatch=path.match(/^\/me\/orders\/([^/]+)$/)||path.match(/^\/orders\/([^/]+)$/)||path.match(/^\/orders\/([^/]+)\/status$/)
  if(req.method==='PATCH'&&orderMatch){const user=await requireUser(req,res); if(!user)return; try{const order=await store.updateOrderStatus(user.id,orderMatch[1],body.status); if(!order)return error(res,404,'ORDER_NOT_FOUND','Order was not found.'); return json(res,200,order)}catch(err){return error(res,statusFor(err.code),err.code||'INTERNAL_ERROR',err.message)}}

  if(req.method==='GET'&&(path==='/me/transfers'||path==='/transfers')){const user=await requireUser(req,res); if(!user)return; return json(res,200,await store.transfers(user.id))}
  if(req.method==='POST'&&(path==='/me/transfers'||path==='/transfers')){const user=await requireUser(req,res); if(!user)return; try{return json(res,201,await store.createTransfer(user.id,body,makeId))}catch(err){return error(res,statusFor(err.code),err.code||'INTERNAL_ERROR',err.message)}}
  if(req.method==='GET'&&(path==='/partner/settlement'||path==='/settlements/summary')) return json(res,200,await store.settlement())
  if(req.method==='POST'&&(path==='/assistance'||path==='/assistance-requests')){const user=await currentUser(req); return json(res,201,await store.createAssistance(body,makeId,user?.id||null))}
  if(req.method==='POST'&&path==='/recommendations/quiz'){const city=body.city, benefits=Array.isArray(body.benefits)?body.benefits:[]; const ranked=(await store.memberships(new URLSearchParams())).map(m=>{let score=m.scores.overall||0; if(city&&m.cities.includes(city))score+=15; for(const b of benefits)if(m.bestFor.includes(b))score+=10; if(body.budget==='free_only'&&m.annualFee>0)score-=25; return {membership:m,score,reasons:[...(city&&m.cities.includes(city)?['city_match']:[]),...benefits.filter(b=>m.bestFor.includes(b)).map(b=>`benefit_${b}`)]}}).sort((a,b)=>b.score-a.score).slice(0,3); return json(res,200,ranked)}
  return error(res,404,'NOT_FOUND','Endpoint was not found.')
}

const server=http.createServer((req,res)=>{route(req,res).catch(err=>{console.error(err); error(res,500,'INTERNAL_ERROR','Unexpected server error.')})})
server.listen(PORT,'0.0.0.0',()=>{console.log(`OhmySelect backend listening on http://0.0.0.0:${PORT}`)})
