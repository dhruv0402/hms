import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { appointmentsAPI, prescriptionsAPI } from '../../api'
import { PageHeader, StatusBadge, Modal, EmptyState, Avatar } from '../../components/Spinner.jsx'
import Spinner from '../../components/Spinner.jsx'
import { Calendar, Plus, FileText, X } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const fmtDate = d => d?new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—'

export default function PatientAppointments() {
  const [appts,setAppts]=useState([])
  const [loading,setLoading]=useState(true)
  const [filter,setFilter]=useState('')
  const [pres,setPres]=useState(null)
  const [presLoading,setPresLoading]=useState(false)
  const [cancelling,setCancelling]=useState(null)

  const load = () => { setLoading(true); appointmentsAPI.list(filter?{status:filter}:{}).then(r=>setAppts(r.data.appointments||[])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false)) }
  useEffect(load,[filter])

  const cancel = async id => {
    if (!window.confirm('Cancel this appointment?')) return
    setCancelling(id)
    try { await appointmentsAPI.update(id,{status:'Cancelled'}); toast.success('Cancelled'); setAppts(p=>p.map(a=>a.appt_id===id?{...a,status:'Cancelled'}:a)) }
    catch { toast.error('Failed') } finally { setCancelling(null) }
  }

  const viewPres = async id => {
    setPresLoading(true)
    try { const {data}=await prescriptionsAPI.getByAppt(id); setPres(data) }
    catch { toast.error('No prescription found') } finally { setPresLoading(false) }
  }

  if (loading) return <div className="flex justify-center py-40"><Spinner size="lg"/></div>

  return (
    <div className="space-y-4 stagger">
      <PageHeader title="My Appointments" subtitle={`${appts.length} appointments`}
        action={<Link to="/patient/book" className="btn-teal"><Plus className="w-4 h-4"/>Book New</Link>}/>

      <div className="flex gap-2 flex-wrap">
        {['','Scheduled','Completed','Cancelled','No-Show'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',filter===s?'bg-teal-500 text-dark-900':'btn-outline')}>
            {s||'All'}
          </button>
        ))}
      </div>

      {appts.length===0
        ? <EmptyState icon={Calendar} title="No appointments" description="Book your first appointment" action={<Link to="/patient/book" className="btn-teal btn-sm">Book now</Link>}/>
        : (
          <div className="space-y-2">
            {appts.map(a=>(
              <div key={a.appt_id} className="card flex items-center gap-3 p-4"
                style={a.status==='Scheduled'?{borderColor:'rgba(0,212,170,0.2)',background:'rgba(0,212,170,0.04)'}:{}}>
                <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={a.status==='Scheduled'?{background:'var(--teal)',color:'#001a14'}:{background:'rgba(255,255,255,0.06)',color:'var(--text-muted)'}}>
                  <p className="text-xs font-bold font-mono leading-none">{a.appt_time?.slice(0,5)}</p>
                  <p className="text-[10px] mt-0.5 opacity-75">{a.appt_date?.slice(5).replace('-','/')}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>{a.doctor_name}</p>
                    <StatusBadge status={a.status}/>
                  </div>
                  <p className="text-xs" style={{color:'var(--text-muted)'}}>{a.department} · {fmtDate(a.appt_date)}</p>
                  {a.reason && <p className="text-[11px] truncate mt-0.5" style={{color:'var(--text-muted)'}}>{a.reason}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {a.status==='Completed' && (
                    <button onClick={()=>viewPres(a.appt_id)} disabled={presLoading} className="btn-success btn-sm flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5"/>Rx
                    </button>
                  )}
                  {a.status==='Scheduled' && (
                    <button onClick={()=>cancel(a.appt_id)} disabled={cancelling===a.appt_id} className="btn-danger btn-sm flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5"/>Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }

      <Modal open={!!pres} onClose={()=>setPres(null)} title="Prescription" subtitle={`Appointment #${pres?.appt_id}`}>
        {pres && (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-xl" style={{background:'rgba(0,212,170,0.06)',border:'1px solid rgba(0,212,170,0.2)'}}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-1">Diagnosis</p>
              <p className="text-sm font-medium" style={{color:'var(--text-primary)'}}>{pres.diagnosis}</p>
            </div>
            {pres.notes && (
              <div className="px-4 py-3 rounded-xl" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{color:'var(--text-muted)'}}>Doctor's Notes</p>
                <p className="text-sm leading-relaxed" style={{color:'var(--text-secondary)'}}>{pres.notes}</p>
              </div>
            )}
            {pres.medicines?.length>0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{color:'var(--text-muted)'}}>Medicines ({pres.medicines.length})</p>
                <div className="space-y-2">
                  {pres.medicines.map((m,i)=>(
                    <div key={i} className="px-3 py-2.5 rounded-xl" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>{m.medicine_name}</p>
                        <span className="badge badge-teal">{m.dosage}</span>
                      </div>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>{m.frequency} · {m.duration_days} days</p>
                      {m.instructions && <p className="text-xs italic mt-0.5" style={{color:'var(--text-muted)'}}>{m.instructions}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pres.follow_up_date && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-teal-400" style={{background:'rgba(0,212,170,0.06)',border:'1px solid rgba(0,212,170,0.2)'}}>
                <Calendar className="w-4 h-4"/>Follow-up on {fmtDate(pres.follow_up_date)}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
