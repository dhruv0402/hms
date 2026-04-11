import { useEffect, useState } from 'react'
import { appointmentsAPI, prescriptionsAPI } from '../../api'
import { PageHeader, StatusBadge, Modal, Field, EmptyState, Avatar } from '../../components/Spinner.jsx'
import Spinner from '../../components/Spinner.jsx'
import { Calendar, ClipboardList, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const EMPTY = { diagnosis:'', notes:'', follow_up_date:'', medicines:[] }

export default function DoctorAppointments() {
  const [appts,setAppts]=useState([])
  const [loading,setLoading]=useState(true)
  const [filter,setFilter]=useState('')
  const [presModal,setPresModal]=useState(null)
  const [saving,setSaving]=useState(false)
  const [pres,setPres]=useState(EMPTY)

  const load = () => { setLoading(true); appointmentsAPI.list(filter?{status:filter}:{}).then(r=>setAppts(r.data.appointments||[])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false)) }
  useEffect(load,[filter])

  const updateStatus = async (id,status) => { try { await appointmentsAPI.update(id,{status}); toast.success(`Marked ${status}`); load() } catch { toast.error('Failed') } }
  const addMed = () => setPres(p=>({...p,medicines:[...p.medicines,{medicine_name:'',dosage:'',frequency:'',duration_days:'',instructions:''}]}))
  const removeMed = i => setPres(p=>({...p,medicines:p.medicines.filter((_,idx)=>idx!==i)}))
  const setMed = (i,k) => e => setPres(p=>{ const m=[...p.medicines]; m[i]={...m[i],[k]:e.target.value}; return {...p,medicines:m} })

  const handlePrescription = async e => {
    e.preventDefault()
    if (!pres.diagnosis.trim()) { toast.error('Diagnosis required'); return }
    setSaving(true)
    try {
      await prescriptionsAPI.create({appt_id:presModal.appt_id,...pres})
      await appointmentsAPI.update(presModal.appt_id,{status:'Completed'})
      toast.success('Prescription saved!')
      setPresModal(null)
      load()
    } catch(err) { toast.error(err.response?.data?.error||'Failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-40"><Spinner size="lg"/></div>

  return (
    <div className="space-y-4 stagger">
      <PageHeader title="Appointments" subtitle={`${appts.length} total`}/>
      <div className="flex gap-2 flex-wrap">
        {['','Scheduled','Completed','Cancelled','No-Show'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',filter===s?'bg-teal-500 text-dark-900':'btn-outline')}>
            {s||'All'}
          </button>
        ))}
      </div>

      {appts.length===0
        ? <EmptyState icon={Calendar} title="No appointments"/>
        : (
          <div className="space-y-2">
            {appts.map(a=>(
              <div key={a.appt_id} className="card flex items-center gap-3 p-4"
                style={a.status==='Scheduled'?{borderColor:'rgba(96,165,250,0.2)',background:'rgba(96,165,250,0.04)'}:{}}>
                <div className={clsx('w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0')}
                  style={a.status==='Scheduled'?{background:'rgba(96,165,250,0.15)',color:'#60a5fa'}:{background:'rgba(255,255,255,0.05)',color:'var(--text-muted)'}}>
                  <p className="text-xs font-bold font-mono leading-none">{a.appt_date?.slice(5).replace('-','/')}</p>
                  <p className="text-[10px] mt-0.5 font-mono">{a.appt_time?.slice(0,5)}</p>
                </div>
                <Avatar name={a.patient_name}/>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{color:'var(--text-primary)'}}>{a.patient_name}</p>
                  <p className="text-xs truncate" style={{color:'var(--text-muted)'}}>{a.reason||'No reason'}</p>
                </div>
                <StatusBadge status={a.status}/>
                {a.status==='Scheduled' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={()=>{setPresModal(a);setPres(EMPTY)}} className="btn-success btn-sm flex items-center gap-1.5">
                      <ClipboardList className="w-3.5 h-3.5"/>Prescribe
                    </button>
                    <button onClick={()=>updateStatus(a.appt_id,'No-Show')} className="btn-danger btn-sm flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5"/>No-Show
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }

      <Modal open={!!presModal} onClose={()=>setPresModal(null)} title="Write Prescription" subtitle={`Patient: ${presModal?.patient_name}`} width="max-w-2xl">
        <form onSubmit={handlePrescription} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="px-3 py-2.5 rounded-xl text-xs font-medium" style={{background:'rgba(96,165,250,0.08)',border:'1px solid rgba(96,165,250,0.2)',color:'#60a5fa'}}>
            {presModal?.patient_name} · {presModal?.appt_date} at {presModal?.appt_time?.slice(0,5)}
          </div>
          <Field label="Diagnosis" required>
            <textarea required value={pres.diagnosis} onChange={e=>setPres(p=>({...p,diagnosis:e.target.value}))} rows={2} className="input resize-none" placeholder="Primary diagnosis and findings…"/>
          </Field>
          <Field label="Notes & Instructions">
            <textarea value={pres.notes} onChange={e=>setPres(p=>({...p,notes:e.target.value}))} rows={2} className="input resize-none" placeholder="Instructions for patient…"/>
          </Field>
          <Field label="Follow-up Date">
            <input type="date" value={pres.follow_up_date} onChange={e=>setPres(p=>({...p,follow_up_date:e.target.value}))} className="input" min={new Date().toISOString().split('T')[0]}/>
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Medicines</label>
              <button type="button" onClick={addMed} className="btn-ghost btn-sm flex items-center gap-1 text-teal-400"><Plus className="w-3.5 h-3.5"/>Add</button>
            </div>
            {pres.medicines.length===0 && <div className="text-xs text-center py-4 rounded-xl" style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',color:'var(--text-muted)'}}>No medicines yet. Click Add.</div>}
            <div className="space-y-2">
              {pres.medicines.map((m,i)=>(
                <div key={i} className="p-3 rounded-xl space-y-2" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{color:'var(--text-muted)'}}>Medicine {i+1}</span>
                    <button type="button" onClick={()=>removeMed(i)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Medicine name *" value={m.medicine_name} onChange={setMed(i,'medicine_name')} className="input text-xs py-2"/>
                    <input placeholder="Dosage (e.g. 500mg)" value={m.dosage} onChange={setMed(i,'dosage')} className="input text-xs py-2"/>
                    <input placeholder="Frequency" value={m.frequency} onChange={setMed(i,'frequency')} className="input text-xs py-2"/>
                    <input type="number" placeholder="Duration (days)" value={m.duration_days} onChange={setMed(i,'duration_days')} className="input text-xs py-2"/>
                    <input placeholder="Instructions for patient" value={m.instructions} onChange={setMed(i,'instructions')} className="input text-xs py-2 col-span-2"/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1 sticky bottom-0 pb-1" style={{background:'var(--bg-card)'}}>
            <button type="button" onClick={()=>setPresModal(null)} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-teal flex-1 flex items-center gap-2">
              {saving?<><Spinner size="sm" color="white"/>Saving…</>:<><CheckCircle2 className="w-4 h-4"/>Save & Complete</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
