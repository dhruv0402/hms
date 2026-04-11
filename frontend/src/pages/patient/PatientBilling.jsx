import { useEffect, useState } from 'react'
import { billingAPI } from '../../api'
import { PageHeader, StatusBadge, Modal, Field, EmptyState, TabFilter, Alert } from '../../components/Spinner.jsx'
import Spinner from '../../components/Spinner.jsx'
import { Receipt, CheckCircle2, Clock, IndianRupee, CreditCard, Smartphone, Banknote, X, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const METHODS = [
  { id: 'UPI',      label: 'UPI',           icon: Smartphone, desc: 'Pay via UPI ID or QR code'   },
  { id: 'Card',     label: 'Debit / Credit', icon: CreditCard, desc: 'Visa, Mastercard, RuPay'     },
  { id: 'Cash',     label: 'Cash',           icon: Banknote,   desc: 'Pay at the hospital counter'  },
  { id: 'Insurance',label: 'Insurance',      icon: ShieldCheck, desc: 'Claim via health insurance'  },
]

const fmtDate = d => d
  ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—'

export default function PatientBilling() {
  const [bills,    setBills]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('')
  const [payModal, setPayModal] = useState(null)   // bill to pay
  const [method,   setMethod]   = useState('UPI')
  const [paying,   setPaying]   = useState(false)
  const [success,  setSuccess]  = useState(null)   // paid bill

  const load = () => {
    billingAPI.list()
      .then(r => setBills(r.data || []))
      .catch(() => toast.error('Failed to load bills'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handlePay = async () => {
    setPaying(true)
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1800))
    try {
      await billingAPI.update(payModal.bill_id, { payment_status: 'Paid', payment_method: method })
      setSuccess(payModal)
      setPayModal(null)
      toast.success('Payment successful! 🎉')
      load()
    } catch {
      toast.error('Payment failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <div className="flex justify-center py-40"><Spinner size="lg" /></div>

  const paid    = bills.filter(b => b.payment_status === 'Paid')
  const pending = bills.filter(b => b.payment_status === 'Pending')
  const shown   = filter ? bills.filter(b => b.payment_status === filter) : bills

  return (
    <div className="space-y-4 stagger">
      <PageHeader title="My Billing" subtitle="Your complete payment history and pending dues" />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Bills',   value: bills.length,  icon: Receipt,      col: 'var(--text-1)', bg: 'var(--bg-card)' },
          { label: 'Amount Paid',   value: `₹${paid.reduce((s, b) => s + Number(b.total_amount), 0).toLocaleString('en-IN')}`,    icon: CheckCircle2, col: '#00d4aa', bg: 'rgba(0,212,170,0.04)',   bd: 'rgba(0,212,170,0.15)'  },
          { label: 'Amount Due',    value: `₹${pending.reduce((s, b) => s + Number(b.total_amount), 0).toLocaleString('en-IN')}`,  icon: Clock,        col: '#fbbf24', bg: 'rgba(245,158,11,0.04)', bd: 'rgba(245,158,11,0.15)' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3"
            style={{ background: s.bg, ...(s.bd ? { borderColor: s.bd } : {}) }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--bg-raised)' }}>
              <s.icon className="w-4 h-4" style={{ color: s.col }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-3)' }}>{s.label}</p>
              <p className="text-xl font-bold" style={{ color: s.col }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending notice */}
      {pending.length > 0 && (
        <div className="card p-4 flex items-center justify-between gap-4"
          style={{ borderColor: 'rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)' }}>
              <Clock className="w-4 h-4" style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#fbbf24' }}>
                {pending.length} payment{pending.length > 1 ? 's' : ''} pending
              </p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                Total due: ₹{pending.reduce((s, b) => s + Number(b.total_amount), 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <button onClick={() => setFilter('Pending')}
            className="btn-sm text-xs px-3 py-1.5 rounded-lg font-semibold"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
            View all
          </button>
        </div>
      )}

      <TabFilter tabs={['', 'Pending', 'Paid', 'Refunded']} active={filter} onChange={setFilter} />

      {bills.length === 0
        ? <EmptyState icon={Receipt} title="No bills yet"
            description="Bills are generated automatically after your doctor completes your appointment" />
        : shown.length === 0
          ? <EmptyState icon={Receipt} title={`No ${filter.toLowerCase()} bills`} />
          : (
            <div className="space-y-3">
              {shown.map(b => (
                <div key={b.bill_id} className="card p-4 transition-all"
                  style={b.payment_status === 'Pending'
                    ? { borderColor: 'rgba(245,158,11,0.20)', background: 'rgba(245,158,11,0.03)' }
                    : {}}>
                  {/* Bill header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: b.payment_status === 'Paid' ? 'rgba(0,212,170,0.12)' : 'rgba(245,158,11,0.12)' }}>
                        <IndianRupee className="w-5 h-5"
                          style={{ color: b.payment_status === 'Paid' ? '#00d4aa' : '#fbbf24' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>Bill #{b.bill_id}</p>
                          <StatusBadge status={b.payment_status} />
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                          Appointment #{b.appt_id} · Generated {fmtDate(b.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>
                        ₹{Number(b.total_amount).toLocaleString('en-IN')}
                      </p>
                      {b.payment_status === 'Pending' && (
                        <button onClick={() => { setPayModal(b); setMethod('UPI') }}
                          className="btn-primary btn-sm mt-1.5 flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />Pay Now
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-4 gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    {[
                      { l: 'Consultation', v: b.consultation_fee },
                      { l: 'Medicines',    v: b.medicine_cost    },
                      { l: 'Tests',        v: b.test_cost        },
                      { l: 'Discount',     v: b.discount,  neg: true },
                    ].map(item => (
                      <div key={item.l} className="text-center">
                        <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{item.l}</p>
                        <p className="text-xs font-semibold mt-0.5"
                          style={{ color: item.neg ? '#34d399' : 'var(--text-2)' }}>
                          {item.neg ? '-' : ''}₹{Number(item.v).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Payment info */}
                  {b.payment_status === 'Paid' && b.paid_at && (
                    <p className="text-[11px] font-medium mt-2 flex items-center gap-1" style={{ color: '#00d4aa' }}>
                      <CheckCircle2 className="w-3 h-3" />
                      Paid via {b.payment_method} on {fmtDate(b.paid_at)}
                    </p>
                  )}
                  {b.notes && (
                    <p className="text-xs italic mt-1.5" style={{ color: 'var(--text-3)' }}>{b.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )
      }

      {/* ── Payment Modal ── */}
      <Modal open={!!payModal} onClose={() => { if (!paying) setPayModal(null) }}
        title="Complete Payment" subtitle={`Bill #${payModal?.bill_id} · ₹${Number(payModal?.total_amount || 0).toLocaleString('en-IN')}`}>
        {payModal && (
          <div className="space-y-4">
            {/* Amount */}
            <div className="px-5 py-4 rounded-2xl text-center"
              style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-bd)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-3)' }}>Amount to Pay</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--teal)' }}>
                ₹{Number(payModal.total_amount).toLocaleString('en-IN')}
              </p>
            </div>

            {/* Method selector */}
            <div>
              <label className="label">Choose Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map(m => (
                  <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all"
                    style={method === m.id
                      ? { background: 'var(--teal-dim)', border: '1px solid var(--teal-bd)' }
                      : { background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                    <m.icon className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: method === m.id ? 'var(--teal)' : 'var(--text-3)' }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: method === m.id ? 'var(--teal)' : 'var(--text-1)' }}>
                        {m.label}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* UPI ID field */}
            {method === 'UPI' && (
              <div>
                <label className="label">UPI ID</label>
                <input className="input" placeholder="yourname@upi" defaultValue="" />
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>
                  e.g. 9876543210@ybl or name@okicici
                </p>
              </div>
            )}

            {method === 'Card' && (
              <div className="space-y-3">
                <Field label="Card Number">
                  <input className="input font-mono" placeholder="1234 5678 9012 3456" maxLength={19} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry"><input className="input" placeholder="MM/YY" /></Field>
                  <Field label="CVV"><input className="input" placeholder="•••" maxLength={3} /></Field>
                </div>
              </div>
            )}

            {method === 'Cash' && (
              <Alert type="info" message="Please visit the billing counter on Ground Floor with this bill number to complete your payment." />
            )}

            {method === 'Insurance' && (
              <Alert type="info" message="Submit your insurance card and policy number at the billing desk. Our team will process the claim within 3-5 business days." />
            )}

            <div className="flex gap-3">
              <button onClick={() => setPayModal(null)} disabled={paying} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handlePay} disabled={paying} className="btn-primary flex-1 relative overflow-hidden">
                {paying
                  ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                      Processing…
                    </span>
                  )
                  : <>
                    <CreditCard className="w-4 h-4" />
                    {method === 'Cash' || method === 'Insurance' ? 'Mark as Processing' : `Pay ₹${Number(payModal.total_amount).toLocaleString('en-IN')}`}
                  </>
                }
              </button>
            </div>

            <p className="text-center text-[10px]" style={{ color: 'var(--text-3)' }}>
              🔒 Secured by MediSync · Your payment data is encrypted
            </p>
          </div>
        )}
      </Modal>

      {/* ── Success Modal ── */}
      <Modal open={!!success} onClose={() => setSuccess(null)} title="Payment Successful">
        {success && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
              style={{ background: 'rgba(0,212,170,0.15)', border: '2px solid var(--teal)' }}>
              <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--teal)' }} />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>Payment Confirmed!</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
                ₹{Number(success.total_amount).toLocaleString('en-IN')} paid for Bill #{success.bill_id}
              </p>
            </div>
            <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--text-3)' }}>Transaction ID</p>
              <p className="font-mono font-semibold mt-0.5" style={{ color: 'var(--text-1)' }}>
                TXN{Date.now().toString().slice(-10).toUpperCase()}
              </p>
            </div>
            <button onClick={() => setSuccess(null)} className="btn-primary w-full">Done</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
