import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { appointmentsAPI, billingAPI, patientsAPI } from '../../api'
import { useAuth } from '../../hooks/useAuth.jsx'
import { KpiCard, StatusBadge, PageHeader, EmptyState, Avatar } from '../../components/Spinner.jsx'
import Spinner from '../../components/Spinner.jsx'
import { Calendar, Receipt, Clock, CheckCircle2, Plus, Activity, ArrowRight, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const fmtDate = d => d ? new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '—'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appts,   setAppts]   = useState([])
  const [bills,   setBills]   = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const profile = user?.profile || {}
  const name    = `${profile.first_name||''} ${profile.last_name||''}`.trim() || 'Patient'
  const hr      = new Date().getHours()
  const greet   = hr<12?'Good morning':hr<17?'Good afternoon':'Good evening'

  useEffect(() => {
    if (!user) return
    const pid = user?.profile?.patient_id
    if (!pid) { setLoading(false); return }
    Promise.all([
      appointmentsAPI.list({per_page:100}),
      billingAPI.list(),
      patientsAPI.getHistory(pid),
    ])
    .then(([a,b,h]) => { setAppts(a.data.appointments||[]); setBills(b.data||[]); setHistory(h.data||[]) })
    .catch(() => toast.error('Failed to load dashboard'))
    .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div style={{display:'flex',justifyContent:'center',paddingTop:120}}><Spinner size="lg"/></div>

  const upcoming  = appts.filter(a=>a.status==='Scheduled').sort((a,b)=>a.appt_date.localeCompare(b.appt_date))
  const completed = appts.filter(a=>a.status==='Completed')
  const pending$  = bills.filter(b=>b.payment_status==='Pending')

  return (
    <div style={{display:'flex',flexDirection:'column',gap:28}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
        <div>
          <p style={{fontSize:14,color:'var(--text-3)',fontWeight:500}}>{greet} 👋</p>
          <h1 style={{fontSize:32,fontWeight:800,letterSpacing:'-0.02em',color:'var(--text-1)',marginTop:4}}>{name}</h1>
          <div style={{display:'flex',alignItems:'center',gap:10,marginTop:10,flexWrap:'wrap'}}>
            {profile.blood_group && <span className="badge badge-red" style={{fontSize:13,padding:'5px 12px'}}>🩸 {profile.blood_group}</span>}
            {profile.gender      && <span className="badge badge-gray" style={{fontSize:13,padding:'5px 12px'}}>{profile.gender}</span>}
            {profile.allergies && profile.allergies!=='None' && (
              <span className="badge badge-amber" style={{fontSize:13,padding:'5px 12px'}}>
                <AlertTriangle style={{width:12,height:12}} />Allergy: {profile.allergies}
              </span>
            )}
          </div>
        </div>
        <Link to="/patient/book" className="btn-primary" style={{fontSize:15,padding:'14px 24px'}}>
          <Plus style={{width:18,height:18}} />Book Appointment
        </Link>
      </div>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
        <KpiCard label="Upcoming"      value={upcoming.length}  icon={Clock}        color="blue"  sub="Scheduled visits" />
        <KpiCard label="Visits Done"   value={completed.length} icon={CheckCircle2} color="teal"  sub="Completed" />
        <KpiCard label="Pending Bills" value={pending$.length}  icon={Receipt}      color="amber" sub={pending$.length?`₹${pending$.reduce((s,b)=>s+Number(b.total_amount),0).toLocaleString('en-IN')} due`:'All clear ✓'} />
        <KpiCard label="Conditions"    value={history.length}   icon={Activity}     color="purple"sub="On record" />
      </div>

      {/* Main content */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:20}}>
        {/* Upcoming appointments */}
        <div className="card" style={{padding:'28px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
            <div>
              <p style={{fontSize:17,fontWeight:700,color:'var(--text-1)'}}>Upcoming Appointments</p>
              <p style={{fontSize:13,color:'var(--text-3)',marginTop:3}}>{upcoming.length} scheduled</p>
            </div>
            <Link to="/patient/appointments" style={{fontSize:14,color:'var(--teal)',fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:5}}>
              View all <ArrowRight style={{width:14,height:14}} />
            </Link>
          </div>

          {upcoming.length===0
            ? <EmptyState icon={Calendar} title="No upcoming appointments"
                description="Book your next visit with one of our specialists"
                action={<Link to="/patient/book" className="btn-primary" style={{fontSize:14,padding:'12px 20px'}}>Book now</Link>} />
            : (
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {upcoming.slice(0,4).map((a,i)=>(
                  <div key={a.appt_id} style={{
                    display:'flex', alignItems:'center', gap:16,
                    padding:'18px 20px', borderRadius:14,
                    background: i===0 ? 'var(--teal-dim)' : 'var(--bg-raised)',
                    border: `1px solid ${i===0 ? 'var(--teal-bd)' : 'var(--border)'}`,
                    transition:'all 0.15s',
                  }}>
                    <div style={{
                      width:56, height:56, borderRadius:14, flexShrink:0,
                      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                      background: i===0 ? 'var(--teal)' : 'var(--bg-card)',
                      color: i===0 ? '#011a14' : 'var(--text-2)',
                    }}>
                      <p style={{fontSize:14,fontWeight:800,lineHeight:1}}>{a.appt_time?.slice(0,5)}</p>
                      <p style={{fontSize:11,opacity:0.8,marginTop:2}}>{fmtDate(a.appt_date)}</p>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:15,fontWeight:700,color:'var(--text-1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.doctor_name}</p>
                      <p style={{fontSize:13,color:'var(--text-3)',marginTop:2}}>{a.department}</p>
                      {a.reason && <p style={{fontSize:12,color:'var(--text-3)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.reason}</p>}
                    </div>
                    {i===0 && <span className="badge badge-teal" style={{fontSize:12,padding:'5px 12px',flexShrink:0}}>Next up</span>}
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Right column */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {/* Medical History */}
          <div className="card" style={{padding:'24px', flex:1}}>
            <p style={{fontSize:16,fontWeight:700,color:'var(--text-1)',marginBottom:18}}>Medical History</p>
            {history.length===0
              ? <p style={{fontSize:14,color:'var(--text-3)'}}>No conditions recorded</p>
              : (
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {history.slice(0,5).map(h=>(
                    <div key={h.history_id} style={{display:'flex',alignItems:'flex-start',gap:12}}>
                      <div style={{width:8,height:8,borderRadius:'50%',marginTop:5,flexShrink:0,background:h.is_chronic?'#f87171':'#34d399'}} />
                      <div style={{minWidth:0}}>
                        <p style={{fontSize:14,fontWeight:600,color:'var(--text-2)',lineHeight:1.3}}>{h.condition_name}</p>
                        {h.is_chronic && <span style={{fontSize:11,fontWeight:700,color:'#f87171'}}>Chronic</span>}
                      </div>
                    </div>
                  ))}
                  {history.length>5 && <p style={{fontSize:13,color:'var(--text-3)',paddingLeft:20}}>+{history.length-5} more conditions</p>}
                </div>
              )
            }
          </div>

          {/* Bills */}
          {pending$.length>0 ? (
            <div className="card" style={{padding:'22px',borderColor:'rgba(245,158,11,0.25)',background:'rgba(245,158,11,0.04)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <Receipt style={{width:18,height:18,color:'#fbbf24'}} />
                <p style={{fontSize:15,fontWeight:700,color:'#fbbf24'}}>{pending$.length} Pending Bill{pending$.length>1?'s':''}</p>
              </div>
              <p style={{fontSize:26,fontWeight:800,color:'#fbbf24',marginBottom:14}}>
                ₹{pending$.reduce((s,b)=>s+Number(b.total_amount),0).toLocaleString('en-IN')}
              </p>
              <Link to="/patient/billing" style={{fontSize:13,fontWeight:700,color:'#fbbf24',textDecoration:'none',display:'flex',alignItems:'center',gap:5}}>
                View & Pay <ArrowRight style={{width:13,height:13}} />
              </Link>
            </div>
          ) : bills.length>0 && (
            <div className="card" style={{padding:'22px',borderColor:'rgba(0,212,170,0.2)',background:'rgba(0,212,170,0.04)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <CheckCircle2 style={{width:18,height:18,color:'var(--teal)'}} />
                <p style={{fontSize:15,fontWeight:700,color:'var(--teal)'}}>All bills settled</p>
              </div>
              <p style={{fontSize:13,color:'var(--text-3)',marginTop:6}}>No outstanding payments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
