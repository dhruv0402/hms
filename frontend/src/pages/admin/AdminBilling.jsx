import { useEffect, useState } from 'react'
import { billingAPI } from '../../api'
import { PageHeader, StatusBadge, Modal, Field, EmptyState, TabFilter } from '../../components/Spinner.jsx'
import Spinner from '../../components/Spinner.jsx'
import { Receipt, Pencil, CheckCircle2, TrendingUp, Clock } from 'lucide-react'
import Skeleton from '../../components/Skeleton.jsx'
import toast from 'react-hot-toast'

export default function AdminBilling() {
  const [bills,   setBills]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('')
  const [modal,   setModal]   = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({})

  const load = () => {
    setLoading(true)
    billingAPI.list(filter ? { status: filter } : {})
      .then(r => setBills(r.data))
      .catch(() => toast.error('Failed to load bills'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filter])

  const openEdit = b => {
    setModal(b)
    setForm({
      consultation_fee: b.consultation_fee, medicine_cost: b.medicine_cost,
      test_cost: b.test_cost, other_charges: b.other_charges,
      discount: b.discount, payment_status: b.payment_status,
      payment_method: b.payment_method, notes: b.notes || ''
    })
  }

  const handleUpdate = async e => {
    e.preventDefault(); setSaving(true)
    try { await billingAPI.update(modal.bill_id, form); toast.success('Bill updated'); setModal(null); load() }
    catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const totalBilled  = (bills || []).reduce((s, b) => s + Number(b.total_amount || 0), 0)
  const totalPaid    = (bills || []).filter(b => b.payment_status === 'Paid').reduce((s, b) => s + Number(b.total_amount || 0), 0)
  const totalPending = (bills || []).filter(b => b.payment_status === 'Pending').reduce((s, b) => s + Number(b.total_amount || 0), 0)

  const updatedTotal = (
    (Number(form.consultation_fee) || 0) +
    (Number(form.medicine_cost) || 0) +
    (Number(form.test_cost) || 0) +
    (Number(form.other_charges) || 0) -
    (Number(form.discount) || 0)
  )


  return (
    <div className="space-y-4 stagger">
      <PageHeader title="Billing" subtitle="Manage all hospital bills and payments" />

      {/* Revenue summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Billed',   value: totalBilled,  icon: TrendingUp,  color: 'var(--text-1)',   bg: 'var(--bg-card)'                    },
          { label: 'Collected',      value: totalPaid,    icon: CheckCircle2,color: '#00d4aa', bg: 'rgba(0,212,170,0.04)', bd: 'rgba(0,212,170,0.15)' },
          { label: 'Outstanding',    value: totalPending, icon: Clock,       color: '#fbbf24', bg: 'rgba(245,158,11,0.04)', bd: 'rgba(245,158,11,0.15)' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3"
            style={{ background: s.bg, ...(s.bd ? { borderColor: s.bd } : {}) }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--bg-raised)' }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-3)' }}>{s.label}</p>
              <p className="text-xl font-bold" style={{ color: s.color }}>₹{s.value.toLocaleString('en-IN')}</p>
            </div>
          </div>
        ))}
      </div>

      <TabFilter tabs={['', 'Pending', 'Paid', 'Refunded', 'Waived']} active={filter} onChange={setFilter} />

      {loading ? (
        <div className="card overflow-hidden"><Skeleton style={{ height: 400 }} /></div>
      ) : bills.length === 0
        ? <EmptyState icon={Receipt} title="No bills found" />
        : (
          <div className="card overflow-hidden">
            <table className="tbl">
              <thead>
                <tr>
                  {['Bill #', 'Appt #', 'Consult', 'Meds', 'Tests', 'Discount', 'Total', 'Status', 'Method', 'Edit'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(bills || []).map(b => (
                  <tr key={b.bill_id}>
                    <td className="bold">#{b.bill_id}</td>
                    <td className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>#{b.appt_id}</td>
                    <td>₹{Number(b.consultation_fee).toLocaleString('en-IN')}</td>
                    <td>₹{Number(b.medicine_cost).toLocaleString('en-IN')}</td>
                    <td>₹{Number(b.test_cost).toLocaleString('en-IN')}</td>
                    <td style={{ color: '#34d399' }}>-₹{Number(b.discount).toLocaleString('en-IN')}</td>
                    <td className="bold">₹{Number(b.total_amount).toLocaleString('en-IN')}</td>
                    <td><StatusBadge status={b.payment_status} /></td>
                    <td className="text-xs">{b.payment_method}</td>
                    <td>
                      <button onClick={() => openEdit(b)}
                        className="flex items-center gap-1 text-xs font-semibold transition-colors"
                        style={{ color: 'var(--teal)' }}>
                        <Pencil className="w-3 h-3" />Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      <Modal open={!!modal} onClose={() => setModal(null)} title={`Edit Bill #${modal?.bill_id}`}
        subtitle={`Appointment #${modal?.appt_id}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Consultation Fee (₹)"><input type="number" value={form.consultation_fee} onChange={set('consultation_fee')} className="input" /></Field>
            <Field label="Medicine Cost (₹)">   <input type="number" value={form.medicine_cost}    onChange={set('medicine_cost')}    className="input" /></Field>
            <Field label="Test Cost (₹)">       <input type="number" value={form.test_cost}        onChange={set('test_cost')}        className="input" /></Field>
            <Field label="Other Charges (₹)">   <input type="number" value={form.other_charges}    onChange={set('other_charges')}    className="input" /></Field>
            <Field label="Discount (₹)">        <input type="number" value={form.discount}         onChange={set('discount')}         className="input" /></Field>
            <Field label="Payment Status">
              <select value={form.payment_status} onChange={set('payment_status')} className="input">
                {['Pending', 'Paid', 'Refunded', 'Waived'].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Payment Method" >
              <select value={form.payment_method} onChange={set('payment_method')} className="input">
                {['Cash', 'Card', 'UPI', 'Insurance', 'Online'].map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={form.notes} onChange={set('notes')} rows={2} className="input resize-none" />
          </Field>
          {/* Live total preview */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm"
            style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-bd)' }}>
            <span style={{ color: 'var(--text-2)' }}>Updated Total</span>
            <span className="font-bold" style={{ color: 'var(--teal)' }}>₹{updatedTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
