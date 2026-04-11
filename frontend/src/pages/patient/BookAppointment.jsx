import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doctorsAPI, departmentsAPI, appointmentsAPI, aiAPI } from '../../api'
import { PageHeader, Field, EmptyState, Avatar, Alert } from '../../components/Spinner.jsx'
import Spinner from '../../components/Spinner.jsx'
import { Stethoscope, CheckCircle2, ChevronRight, Clock, Award, IndianRupee, Zap, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STEPS=['Choose Doctor','Date & Slot','Confirm']
const DAY_NAMES=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export default function BookAppointment() {
  const navigate=useNavigate()
  const [step,setStep]=useState(0)
  const [depts,setDepts]=useState([])
  const [doctors,setDoctors]=useState([])
  const [slots,setSlots]=useState([])
  const [loading,setLoading]=useState(true)
  const [booking,setBooking]=useState(false)
  const [slotsLoading,setSlotsLoading]=useState(false)
  const [deptF,setDeptF]=useState('')
  const [doc,setDoc]=useState(null)
  const [date,setDate]=useState('')
  const [slot,setSlot]=useState(null)
  const [reason,setReason]=useState('')
  const [symptomInput,setSymptomInput]=useState('')
  const [aiLoading,setAiLoading]=useState(false)
  const [aiResult,setAiResult]=useState(null)

  useEffect(()=>{ Promise.all([departmentsAPI.list(),doctorsAPI.list()]).then(([d,doc])=>{setDepts(d.data);setDoctors(doc.data)}).catch(()=>toast.error('Failed')).finally(()=>setLoading(false)) },[])

  const handleDate = async d => {
    setDate(d); setSlot(null)
    if (!doc||!d) return
    setSlotsLoading(true)
    try { const {data}=await appointmentsAPI.availableSlots({doctor_id:doc.doctor_id,date:d}); setSlots(data.slots||[]) }
    catch { toast.error('Failed to fetch slots') } finally { setSlotsLoading(false) }
  }

  const handleBook = async () => {
    setBooking(true)
    try { await appointmentsAPI.book({doctor_id:doc.doctor_id,slot_id:slot.slot_id,appt_date:date,appt_time:slot.start_time,reason}); toast.success('Appointment booked!'); navigate('/patient/appointments') }
    catch(err) { toast.error(err.response?.data?.error||'Booking failed') } finally { setBooking(false) }
  }

  const handleAiSuggest = async () => {
    if (!symptomInput.trim()) return toast.error('Please describe symptoms first')
    setAiLoading(true)
    try {
      const { data } = await aiAPI.predictDepartment(symptomInput)
      setAiResult(data)
      const matched = depts.find(d => d.name.toLowerCase().includes(data.department.toLowerCase()))
      if (matched) {
        setDeptF(String(matched.dept_id))
        toast.success(`Suggested: ${matched.name}`, { icon: '✨' })
      }
    } catch {
      toast.error('AI Suggestion unavailable')
    } finally {
      setAiLoading(false)
    }
  }

  const minDate=new Date().toISOString().split('T')[0]
  const filtered=deptF?doctors.filter(d=>String(d.dept_id)===deptF):doctors
  const selDay=date?DAY_NAMES[new Date(date+'T00:00:00').getDay()]:''

  if (loading) return <div className="flex justify-center py-40"><Spinner size="lg"/></div>

  return (
    <div className="space-y-5 stagger">
      <PageHeader title="Book Appointment" subtitle="Schedule a visit with our specialists"/>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s,i)=>(
          <div key={s} className="flex items-center gap-2">
            <div className={clsx('flex items-center gap-2')}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={i<step?{background:'#00d4aa',color:'#001a14'}:i===step?{background:'rgba(0,212,170,0.2)',border:'1px solid #00d4aa',color:'#00d4aa'}:{background:'rgba(255,255,255,0.06)',color:'var(--text-muted)'}}>
                {i<step?<CheckCircle2 className="w-4 h-4"/>:i+1}
              </div>
              <span className="text-xs font-medium hidden sm:block" style={{color:i===step?'var(--text-primary)':i<step?'#00d4aa':'var(--text-muted)'}}>{s}</span>
            </div>
            {i<STEPS.length-1 && <ChevronRight className="w-3.5 h-3.5 mx-1" style={{color:'var(--text-muted)'}}/>}
          </div>
        ))}
      </div>

      {/* Step 0 */}
      {step===0 && (
        <div className="space-y-6">
          <div className="card p-5 border-dashed border-teal-500 border-opacity-30 bg-teal-500 bg-opacity-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">AI Smart Assistant</p>
                <p className="text-[11px] text-muted">Describe symptoms to find the right department</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input value={symptomInput} onChange={e=>setSymptomInput(e.target.value)} 
                placeholder="e.g. I have a persistent cough and fever…" className="input flex-1 h-10 text-xs" />
              <button onClick={handleAiSuggest} disabled={aiLoading} className="btn-teal h-10 px-4 text-xs font-bold gap-2">
                {aiLoading ? <Spinner size="sm" /> : <><Zap className="w-3.5 h-3.5" /> Predict</>}
              </button>
            </div>
            {aiResult && (
              <div className="mt-4 p-3 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-5">
                <p className="text-[10px] font-black uppercase text-teal-400 mb-1">AI Recommendation</p>
                <p className="text-xs text-primary font-bold">{aiResult.department}</p>
                <p className="text-[11px] text-muted mt-1 leading-relaxed">{aiResult.reasoning}</p>
              </div>
            )}
          </div>

          <div className="max-w-xs">
            <Field label="Filter by Department">
              <select value={deptF} onChange={e=>{setDeptF(e.target.value); setAiResult(null)}} className="input h-9 text-xs">
                <option value="">All Departments</option>
                {depts.map(d=><option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
              </select>
            </Field>
          </div>
          {filtered.length===0
            ? <EmptyState icon={Stethoscope} title="No doctors found"/>
            : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.map(d=>(
                  <button key={d.doctor_id} onClick={()=>{setDoc(d);setStep(1);setDate('');setSlot(null)}}
                    className={clsx('text-left card-hover p-5 transition-all')}
                    style={doc?.doctor_id===d.doctor_id?{borderColor:'rgba(0,212,170,0.4)',background:'rgba(0,212,170,0.05)'}:{}}>
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar name={d.full_name} size="lg"/>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm" style={{color:'var(--text-primary)'}}>{d.full_name}</p>
                        <p className="text-xs font-semibold text-teal-400 mt-0.5">{d.specialization}</p>
                        <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{background:'rgba(255,255,255,0.06)',color:'var(--text-muted)'}}>{d.department}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-3" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                      <span className="flex items-center gap-1" style={{color:'var(--text-muted)'}}><Award className="w-3 h-3"/>{d.experience_yrs}y</span>
                      <span className="font-semibold text-teal-400">₹{d.consultation_fee}</span>
                    </div>
                  </button>
                ))}
              </div>
            )
          }
        </div>
      )}

      {/* Step 1 */}
      {step===1 && (
        <div className="max-w-lg space-y-4">
          <div className="card p-4 flex items-center gap-3" style={{borderColor:'rgba(0,212,170,0.2)',background:'rgba(0,212,170,0.04)'}}>
            <Avatar name={doc?.full_name} size="lg"/>
            <div>
              <p className="font-bold text-sm" style={{color:'var(--text-primary)'}}>{doc?.full_name}</p>
              <p className="text-xs text-teal-400">{doc?.specialization} · ₹{doc?.consultation_fee}</p>
            </div>
          </div>

          <Field label="Appointment Date" required>
            <input type="date" min={minDate} value={date} onChange={e=>handleDate(e.target.value)} className="input h-10"/>
          </Field>

          {date && (
            <div>
              <label className="label">Available Slots · {selDay}</label>
              {slotsLoading
                ? <div className="flex items-center gap-2 text-xs py-3" style={{color:'var(--text-muted)'}}><Spinner size="sm"/>Loading…</div>
                : slots.length===0
                  ? <p className="text-xs py-3 px-4 rounded-xl" style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)',color:'#fbbf24'}}>No slots on this day. Try another date.</p>
                  : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                      {slots.map(s=>(
                        <button key={`${s.slot_id}-${s.start_time}`} disabled={s.is_booked} onClick={()=>setSlot(s)}
                          className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium transition-all"
                          style={s.is_booked
                            ? {background:'rgba(255,255,255,0.02)',color:'var(--text-muted)',cursor:'not-allowed',border:'1px solid rgba(255,255,255,0.04)'}
                            : slot?.slot_id===s.slot_id && slot?.start_time===s.start_time
                              ? {background:'rgba(0,212,170,0.12)',border:'1px solid rgba(0,212,170,0.4)',color:'#00d4aa'}
                              : {background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'var(--text-secondary)'}
                          }>
                          <Clock className="w-3.5 h-3.5"/>
                          {s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}
                          {s.is_booked && <span className="ml-auto text-[10px]">Full</span>}
                        </button>
                      ))}
                    </div>
                  )
              }
            </div>
          )}

          <Field label="Reason for Visit">
            <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} placeholder="Describe your symptoms or reason…" className="input resize-none"/>
          </Field>

          <div className="flex gap-3">
            <button onClick={()=>setStep(0)} className="btn-outline flex-1">← Back</button>
            <button disabled={!slot} onClick={()=>setStep(2)} className="btn-teal flex-1">Continue →</button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step===2 && (
        <div className="max-w-md space-y-4">
          <div className="card p-5" style={{borderColor:'rgba(0,212,170,0.2)'}}>
            <p className="font-bold text-sm mb-4" style={{color:'var(--text-primary)'}}>Confirm Appointment</p>
            {[
              ['Doctor',      doc?.full_name],
              ['Specialization', doc?.specialization],
              ['Department',  doc?.department],
              ['Date',        new Date(date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})],
              ['Time',        `${slot?.start_time?.slice(0,5)} – ${slot?.end_time?.slice(0,5)}`],
              ['Consultation',`₹${doc?.consultation_fee}`],
            ].map(([l,v])=>(
              <div key={l} className="flex items-center justify-between py-2.5" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <span className="text-xs" style={{color:'var(--text-muted)'}}>{l}</span>
                <span className="text-xs font-semibold text-right max-w-[55%]" style={{color:'var(--text-primary)'}}>{v}</span>
              </div>
            ))}
            {reason && <div className="pt-3"><p className="text-[10px] uppercase tracking-wider mb-1" style={{color:'var(--text-muted)'}}>Reason</p><p className="text-xs" style={{color:'var(--text-secondary)'}}>{reason}</p></div>}
          </div>
          <div className="px-4 py-3 rounded-xl text-xs text-amber-400" style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)'}}>
            ⏰ Please arrive 10 minutes early. Bring previous medical records.
          </div>
          <div className="flex gap-3">
            <button onClick={()=>setStep(1)} className="btn-outline flex-1">← Back</button>
            <button onClick={handleBook} disabled={booking} className="btn-teal flex-1">
              {booking?<><Spinner size="sm" color="white"/>Booking…</>:'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
