import { useEffect, useState } from 'react'
import { pharmacyAPI } from '../../api'
import { PageHeader, KpiCard, EmptyState, Modal, Field, SearchInput, Alert } from '../../components/Spinner.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import { Pill, Package, AlertTriangle, Search, Plus, Trash2, Edit3, ArrowUpRight, ArrowDownLeft, RotateCcw, Boxes, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function AdminPharmacy() {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedMed, setSelectedMed] = useState(null)
  const [showTrxModal, setShowTrxModal] = useState(false)

  // Form State
  const [form, setForm] = useState({ name: '', category: 'Tablet', unit_price: 0, stock_quantity: 0, min_stock_level: 10, manufacturer: '', expiry_date: '' })
  const [trxForm, setTrxForm] = useState({ type: 'Purchase', quantity: 1, description: '' })
  const [saving, setSaving] = useState(false)

  const fetchMedicines = async () => {
    try {
      const { data } = await pharmacyAPI.listMedicines({ search: search || undefined })
      setMedicines(data)
    } catch {
      toast.error('Failed to load medicines')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(fetchMedicines, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [search])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (selectedMed) {
        await pharmacyAPI.updateMedicine(selectedMed.medicine_id, form)
        toast.success('Medicine updated')
      } else {
        await pharmacyAPI.addMedicine(form)
        toast.success('Medicine added')
      }
      setShowModal(false)
      fetchMedicines()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleTransaction = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await pharmacyAPI.recordTransaction({ ...trxForm, medicine_id: selectedMed.medicine_id })
      toast.success('Inventory updated')
      setShowTrxModal(false)
      fetchMedicines()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transaction failed')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (med) => {
    setSelectedMed(med)
    setForm({ ...med })
    setShowModal(true)
  }

  const openTrx = (med) => {
    setSelectedMed(med)
    setTrxForm({ type: 'Purchase', quantity: 1, description: 'Batch restocking' })
    setShowTrxModal(true)
  }

  // KPIs
  const meds = medicines || []
  const totalItems = meds.length
  const lowStock = meds.filter(m => m.stock_quantity <= m.min_stock_level).length
  const totalStock = meds.reduce((s, m) => s + (Number(m.stock_quantity) || 0), 0)


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Pharmacy & Inventory"
        subtitle="Manage hospital medicine stock and procurement"
        action={
          <button onClick={() => { setSelectedMed(null); setForm({ name: '', category: 'Tablet', unit_price: 0, stock_quantity: 0, min_stock_level: 10, manufacturer: '', expiry_date: '' }); setShowModal(true) }}
            className="btn-teal h-10 px-6 font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Medicine
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? [1,2,3].map(i => <Skeleton key={i} style={{ height: 110 }} />) : (
          <>
            <KpiCard label="Medicines Listed" value={totalItems} icon={Pill} color="teal" />
            <KpiCard label="Low Stock Items" value={lowStock} icon={AlertTriangle} color={lowStock > 0 ? 'amber' : 'green'} sub={lowStock > 0 ? 'Requires attention' : 'All good'} />
            <KpiCard label="Total Units" value={totalStock} icon={Boxes} color="blue" />
          </>
        )}
      </div>

      <div className="card-outer overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-white border-opacity-5">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by medicine name…" className="max-w-md w-full" />
          <div className="text-xs font-semibold text-muted">{(medicines || []).length} items found</div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Medicine Detail</th>
                <th>Category</th>
                <th>In Stock</th>
                <th>Unit Price</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [1,2,3,4,5].map(i => (
                <tr key={i}>
                  <td colSpan="6" className="py-4"><Skeleton style={{ height: 30 }} /></td>
                </tr>
              )) : (medicines || []).map((m, i) => (
                <motion.tr key={m.medicine_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <td className="py-4">
                    <div>
                      <p className="font-bold text-sm text-primary">{m.name}</p>
                      <p className="text-[11px] text-muted">{m.manufacturer || 'General Medicine'}</p>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white bg-opacity-5 border border-white border-opacity-10 text-secondary">
                      {m.category}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className={clsx('text-sm font-bold', m.stock_quantity <= m.min_stock_level ? 'text-amber-400' : 'text-primary')}>
                        {m.stock_quantity} units
                      </span>
                      <span className="text-[10px] text-muted">Min: {m.min_stock_level}</span>
                    </div>
                  </td>
                  <td><span className="text-sm font-semibold text-teal-400">₹{parseFloat(m.unit_price).toFixed(2)}</span></td>
                  <td>
                    {m.stock_quantity <= 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                        <Trash2 className="w-3 h-3" /> Out of Stock
                      </span>
                    ) : m.stock_quantity <= m.min_stock_level ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-400">
                        <Package className="w-3 h-3" /> Available
                      </span>
                    )}
                  </td>
                  <td className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openTrx(m)} className="btn-ghost p-2" title="Inventory Transaction">
                        <Boxes className="w-4 h-4 text-secondary hover:text-teal-400" />
                      </button>
                      <button onClick={() => openEdit(m)} className="btn-ghost p-2" title="Edit Detail">
                        <Edit3 className="w-4 h-4 text-secondary hover:text-teal-400" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {medicines.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="py-20">
                    <EmptyState icon={Pill} title="No medicines found" description={search ? "Try searching for a different name" : "Start by adding medicines to the hospital inventory."} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={selectedMed ? 'Edit Medicine' : 'Add New Medicine'} subtitle="Fill in pharmaceutical details">
        <form onSubmit={handleSave} className="space-y-5">
          <Field label="Medicine Name" required>
            <input required className="input h-11" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Paracetamol 500mg" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select className="input h-11" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {['Tablet', 'Syrup', 'Injection', 'Capsule', 'Ointment', 'Vaccine', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Unit Price (₹)" required>
              <input type="number" step="0.01" required className="input h-11" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: parseFloat(e.target.value) })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="In Stock (Units)">
              <input type="number" className="input h-11" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: parseInt(e.target.value) })} />
            </Field>
            <Field label="Min Stock Alert">
              <input type="number" className="input h-11" value={form.min_stock_level} onChange={e => setForm({ ...form, min_stock_level: parseInt(e.target.value) })} />
            </Field>
          </div>
          <Field label="Manufacturer">
            <input className="input h-11" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} placeholder="e.g. Sun Pharma" />
          </Field>
          <Field label="Expiry Date">
            <input type="date" className="input h-11" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} />
          </Field>
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-outline h-11 flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-teal h-11 flex-1 font-bold">
              {saving ? 'Saving…' : selectedMed ? 'Update Medicine' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Transaction Modal */}
      <Modal open={showTrxModal} onClose={() => setShowTrxModal(false)} title="Inventory Transaction" subtitle={`Update stock level for ${selectedMed?.name}`}>
        <form onSubmit={handleTransaction} className="space-y-5">
          <div className="p-4 rounded-xl border border-teal-500 border-opacity-20 bg-teal-500 bg-opacity-5 flex items-center justify-between">
            <span className="text-sm font-semibold">Current Level</span>
            <span className="text-lg font-black text-teal-400">{selectedMed?.stock_quantity} Units</span>
          </div>
          <Field label="Transaction Type" required>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'Purchase', icon: ArrowUpRight, label: 'Procurement (+)', color: '#34d399' },
                { type: 'Adjustment', icon: RotateCcw, label: 'Adjustment (+/-)', color: '#60a5fa' },
                { type: 'Sale', icon: ArrowDownLeft, label: 'Internal Issue (-)', color: '#fbbf24' },
                { type: 'Expired', icon: Trash2, label: 'Disposal (-)', color: '#f87171' }
              ].map(t => (
                <button key={t.type} type="button" onClick={() => setTrxForm({ ...trxForm, type: t.type })}
                  className={clsx('flex flex-col items-center gap-2 p-3 rounded-xl border text-[11px] font-bold uppercase transition-all', trxForm.type === t.type ? 'bg-white bg-opacity-10 border-white border-opacity-20' : 'bg-transparent border-white border-opacity-5' )}>
                  <t.icon style={{ color: t.color }} className="w-5 h-5" />
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Quantity (Units)" required>
            <input type="number" required className="input h-11" value={trxForm.quantity} onChange={e => setTrxForm({ ...trxForm, quantity: parseInt(e.target.value) })} />
          </Field>
          <Field label="Reason / Notes">
            <textarea className="input py-3 h-24 resize-none" value={trxForm.description} onChange={e => setTrxForm({ ...trxForm, description: e.target.value })} placeholder="e.g. Monthly restocking, Batch #X102" />
          </Field>
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={() => setShowTrxModal(false)} className="btn-outline h-11 flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-teal h-11 flex-1 font-bold">
              {saving ? 'Recording…' : 'Finalize Update'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
