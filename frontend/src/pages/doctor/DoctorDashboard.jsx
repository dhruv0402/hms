import { useEffect, useState } from 'react'
import { appointmentsAPI } from '../../api'
import { useAuth } from '../../hooks/useAuth.jsx'
import { KpiCard, StatusBadge, EmptyState, Avatar } from '../../components/Spinner.jsx'
import Spinner from '../../components/Spinner.jsx'
import { Calendar, Users, Clock, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [today, setToday]     = useState([])
  const [all,   setAll]       = useState([])
  const [loading, setLoading] = useState(true)

  const profile = user?.profile || {}
  const name    = `Dr. ${profile.first_name||''} ${profile.last_name||''}`.trim()
  const hr      = new Date().getHours()

  useEffect(() => {
    Promise.all([appointmentsAPI.todaySchedule(), appointmentsAPI.list({per_page:200})])
      .then(([t,a]) => { setToday(t.data.appointments||[]); setAll(a.data.appointments||[]) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{display:'flex',justifyContent:'center',paddingTop:120}}><Spinner size="lg"/></div>

  const scheduled = all.filter(a=>a.status==='Scheduled').length
  const completed = all.filter(a=>a.status==='Completed').length
  const patients  = new Set(all.map(a=>a.patient_id)).size

  return (
    <div style={{display:'flex',flexDirection:'column',gap:28}}>
      <div>
        <p style={{fontSize:14,color:'var(--text-3)',fontWeight:500}}>{hr<12?'Good morning':hr<17?'Good afternoon':'Good evening'} 👋</p>
        <h1 style={{fontSize:32,fontWeight:800,letterSpacing:'-0.02em',color:'var(--text-1)',marginTop:4}}>{name}</h1>
        {profile.specialization && <p style={{fontSize:15,color:'var(--teal)',fontWeight:600,marginTop:5}}>{profile.specialization}</p>}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
        <KpiCard label="Today's Patients" value={today.length}  icon={Calendar}     color="teal"   sub="Scheduled today"/>
        <KpiCard label="Total Patients"   value={patients}      icon={Users}        color="blue"   sub="Unique patients"/>
        <KpiCard label="Upcoming"         value={scheduled}     icon={Clock}        color="amber"/>
        <KpiCard label="Completed"        value={completed}     icon={CheckCircle2} color="teal"/>
      </div>

      <div className="card" style={{padding:'28px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <div>
            <p style={{fontSize:17,fontWeight:700,color:'var(--text-1)'}}>Today's Schedule</p>
            <p style={{fontSize:13,color:'var(--text-3)',marginTop:3}}>
              {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
            </p>
          </div>
          {today.length>0 && (
            <span className="badge badge-blue" style={{fontSize:12,padding:'6px 14px'}}>{today.filter(a=>a.status==='Scheduled').length} remaining</span>
          )}
        </div>

        {today.length===0
          ? <EmptyState icon={Calendar} title="No appointments today" description="Your schedule is clear for today."/>
          : (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {today.map((a,i) => {
                const colors = {Scheduled:{bg:'rgba(96,165,250,0.08)',bd:'rgba(96,165,250,0.18)',tc:'#60a5fa'},Completed:{bg:'rgba(0,212,170,0.07)',bd:'rgba(0,212,170,0.18)',tc:'#00d4aa'},'No-Show':{bg:'rgba(245,158,11,0.07)',bd:'rgba(245,158,11,0.18)',tc:'#fbbf24'},Cancelled:{bg:'rgba(239,68,68,0.07)',bd:'rgba(239,68,68,0.18)',tc:'#f87171'}}[a.status]||{bg:'var(--bg-raised)',bd:'var(--border)',tc:'var(--text-2)'}
                return (
                  <div key={a.appt_id} style={{display:'flex',alignItems:'center',gap:18,padding:'18px 20px',borderRadius:14,background:colors.bg,border:`1px solid ${colors.bd}`}}>
                    <div style={{textAlign:'center',width:64,flexShrink:0}}>
                      <p style={{fontSize:17,fontWeight:800,fontFamily:'monospace',color:'var(--text-1)',lineHeight:1}}>{a.appt_time?.slice(0,5)}</p>
                      <p style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>#{String(i+1).padStart(2,'0')}</p>
                    </div>
                    <div style={{width:1,height:40,background:'var(--border)',flexShrink:0}}/>
                    <Avatar name={a.patient_name}/>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:15,fontWeight:700,color:'var(--text-1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.patient_name}</p>
                      <p style={{fontSize:13,color:'var(--text-3)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.reason||'No reason specified'}</p>
                    </div>
                    <StatusBadge status={a.status}/>
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    </div>
  )
}
