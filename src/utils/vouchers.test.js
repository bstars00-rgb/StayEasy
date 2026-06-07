import { describe, it, expect } from 'vitest'
import { voucherStats, countOpenReservations, countTransfers } from './vouchers.js'

describe('voucherStats', () => {
  it('computes available = quantity - used - held - transferred', () => {
    expect(voucherStats(3, 1, 1)).toEqual({ quantity: 3, used: 1, held: 1, transferred: 0, available: 1 })
  })

  it('subtracts transferred (gifted) vouchers', () => {
    expect(voucherStats(4, 1, 0, 2).available).toBe(1)
  })

  it('never goes below zero', () => {
    expect(voucherStats(2, 3, 1).available).toBe(0)
  })

  it('treats missing args as zero', () => {
    expect(voucherStats(5)).toEqual({ quantity: 5, used: 0, held: 0, transferred: 0, available: 5 })
  })

  it('clamps negative inputs', () => {
    expect(voucherStats(4, -2, -1, -1).available).toBe(4)
  })
})

describe('countTransfers', () => {
  const transfers = [
    { membershipId: 'm1', templateId: 't1' },
    { membershipId: 'm1', templateId: 't1' },
    { membershipId: 'm1', templateId: 't2' },
  ]
  it('counts transfers for the matching voucher', () => {
    expect(countTransfers(transfers, 'm1', 't1')).toBe(2)
    expect(countTransfers(transfers, 'm1', 't2')).toBe(1)
    expect(countTransfers(transfers, 'mX', 'tX')).toBe(0)
  })
})

describe('countOpenReservations', () => {
  const reservations = [
    { membershipId: 'm1', templateId: 't1', status: 'requested' },
    { membershipId: 'm1', templateId: 't1', status: 'confirmed' },
    { membershipId: 'm1', templateId: 't1', status: 'completed' }, // not open
    { membershipId: 'm1', templateId: 't1', status: 'cancelled' }, // not open
    { membershipId: 'm1', templateId: 't2', status: 'requested' }, // other voucher
    { membershipId: 'm2', templateId: 't1', status: 'requested' }, // other membership
  ]

  it('counts only requested/confirmed for the matching voucher', () => {
    expect(countOpenReservations(reservations, 'm1', 't1')).toBe(2)
  })

  it('returns 0 when nothing matches', () => {
    expect(countOpenReservations(reservations, 'mX', 'tX')).toBe(0)
  })
})
