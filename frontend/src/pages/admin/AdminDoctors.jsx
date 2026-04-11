import { useEffect, useState } from 'react'
import { doctorsAPI, departmentsAPI } from '../../api'
import { PageHeader, Modal, Field, EmptyState, SearchInput, Avatar } from '../../components/Spinner.jsx'
import Spinner from '../../components/Spinner.jsx'
import { Stethoscope, Plus, Award, IndianRupee, Phone, Star } from 'lucide-react'
import Skeleton from '../../components/Skeleton.jsx'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [depts,   setDepts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [deptF,   setDeptF]   = useState('')
  const [modal,   setModal]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form, setForm] = useState({
    email: '', password: 'Password@123', first_name: '', last_name: '',
    dept_id: '', specialization: '', qualification: '', experience_yrs: 0,
    phone: '', consultation_fee: 500, bio: ''
  })

  const load = () =>
    Promise.all([doctorsAPI.list(), departmentsAPI.list()])
      .then(([d, dep]) => { setDoctors(d.data); setDepts(dep.data) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true)
    try { await doctorsAPI.create(form); toast.success('Doctor added!'); setModal(false); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to add doctor') }
    finally { setSaving(false) }
  }

  const filtered = (doctors || []).filter(d => {
    const s = search?.toLowerCase() || ''
    return (!s || d.full_name?.toLowerCase()?.includes(s) || d.specialization?.toLowerCase()?.includes(s) || d.department?.name?.toLowerCase()?.includes(s))
      && (!deptF || String(d.dept_id) === deptF)
  })


  return (
    <div className="space-y-4 stagger">
      <PageHeader title="Doctors" subtitle={`${doctors.length} registered specialists`}
        action={<button onClick={() => setModal(true)} className="btn-primary"><Plus className="w-4 h-4" />Add Doctor</button>} />

      <div className="flex gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, specialization…" className="w-72" />
        <select value={deptF} onChange={e => setDeptF(e.target.value)} className="input h-9 w-48 text-xs">
          <option value="">All Departments</option>
          {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card p-5"><Skeleton style={{ height: 180 }} /></div>)}
        </div>
      ) : (filtered || []).length === 0 ? (
        <EmptyState icon={Stethoscope} title="No doctors found" description="Try adjusting filters or add a new doctor" />
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {(filtered || []).map(doc => (
              <div key={doc.doctor_id} className="card-hover p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={doc.full_name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>{doc.full_name}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--teal)' }}>{doc.specialization}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--bg-raised)', color: 'var(--text-3)' }}>
                      {doc.department?.name || '—'}
                    </span>
                  </div>
                </div>
                {doc.bio && (
                  <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--text-3)' }}>{doc.bio}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs pt-3"
                  style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
                    <Award className="w-3 h-3" />{doc.experience_yrs} yrs exp
                  </span>
                  <span className="flex items-center gap-1 font-semibold justify-end" style={{ color: 'var(--text-2)' }}>
                    ₹{doc.consultation_fee}/visit
                  </span>
                  {doc.phone && (
                    <span className="flex items-center gap-1 col-span-2 font-mono text-[10px]"
                      style={{ color: 'var(--text-3)' }}>
                      <Phone className="w-3 h-3" />{doc.phone}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }

      <Modal open={modal} onClose={() => setModal(false)} title="Add New Doctor"
        subtitle="Create login credentials and doctor profile" width="max-w-2xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" required><input required value={form.first_name} onChange={set('first_name')} className="input" placeholder="Priya" /></Field>
            <Field label="Last Name"  required><input required value={form.last_name}  onChange={set('last_name')}  className="input" placeholder="Sharma" /></Field>
            <Field label="Email Address" required><input type="email" required value={form.email} onChange={set('email')} className="input" placeholder="doctor@medisync.com" /></Field>
            <Field label="Temp Password"><input value={form.password} onChange={set('password')} className="input" /></Field>
            <Field label="Department" required>
              <select required value={form.dept_id} onChange={set('dept_id')} className="input">
                <option value="">Select department…</option>
                {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
              </select>
            </Field>
            <Field label="Specialization"><input value={form.specialization} onChange={set('specialization')} className="input" placeholder="Interventional Cardiology" /></Field>
            <Field label="Qualification"><input value={form.qualification} onChange={set('qualification')} className="input" placeholder="MBBS, MD, DM" /></Field>
            <Field label="Experience (years)"><input type="number" min="0" value={form.experience_yrs} onChange={set('experience_yrs')} className="input" /></Field>
            <Field label="Phone"><input value={form.phone} onChange={set('phone')} className="input" placeholder="9876543210" /></Field>
            <Field label="Consultation Fee (₹)"><input type="number" value={form.consultation_fee} onChange={set('consultation_fee')} className="input" /></Field>
          </div>
          <Field label="Professional Bio">
            <textarea value={form.bio} onChange={set('bio')} rows={2} className="input resize-none" placeholder="Brief professional background…" />
          </Field>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Adding…' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
