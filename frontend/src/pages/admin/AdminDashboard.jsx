import { useEffect, useState } from 'react'
import { adminAPI } from '../../api'
import { KpiCard, PageHeader, StatusBadge, Avatar, EmptyState } from '../../components/Spinner.jsx'
import { Users, Stethoscope, Calendar, Receipt, TrendingUp, Clock, CheckCircle, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import Skeleton from '../../components/Skeleton.jsx'
import toast from 'react-hot-toast'

const COLORS = ['#00d4aa','#60a5fa','#a78bfa','#fbbf24','#f87171','#34d399','#f472b6','#38bdf8']

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card" style={{padding:'12px 16px',fontSize:13}}>
      <p style={{fontWeight:700,marginBottom:2,color:'var(--text-1)'}}>{label}</p>
      <p style={{color:'var(--teal)'}}>{payload[0].value} appointments</p>
    </div>
  )
}

function daysAgo(d) {
  if (!d) return '—'
  const diff = Math.round((Date.now()-new Date(d+'T12:00:00').getTime())/86400000)
  if (diff===0) return 'Today'; if (diff===1) return 'Yesterday'
  if (diff<0) return `In ${Math.abs(diff)}d`; return `${diff}d ago`
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.dashboard().then(r=>setData(r.data)).catch(()=>toast.error('Failed to load')).finally(()=>setLoading(false))
  }, [])

  const { kpis={}, dept_stats=[], recent_appointments=[] } = data || {}

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } }
      }}
      style={{display:'flex',flexDirection:'column',gap:28}}
    >
      <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
        <PageHeader
          title="Admin Dashboard"
          subtitle={new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
        />
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
        {loading ? [1,2,3,4].map(i => <Skeleton key={i} style={{ height: 110 }} />) : (
          <>
            <KpiCard label="Total Patients"  value={kpis.total_patients}       icon={Users}       color="blue"   trend="+3 this week" />
            <KpiCard label="Total Doctors"   value={kpis.total_doctors}         icon={Stethoscope} color="teal"   sub="Active specialists" />
            <KpiCard label="Today's Appts"   value={kpis.todays_appointments}   icon={Calendar}    color="purple" />
            <KpiCard label="Monthly Revenue" value={`₹${((kpis.monthly_revenue||0)/1000).toFixed(1)}k`} icon={TrendingUp} color="amber" />
          </>
        )}
      </motion.div>
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
        {loading ? [1,2,3,4].map(i => <Skeleton key={i} style={{ height: 110 }} />) : (
          <>
            <KpiCard label="Pending Appts"   value={kpis.pending_appointments}   icon={Clock}       color="blue"  />
            <KpiCard label="Completed"       value={kpis.completed_appointments} icon={CheckCircle} color="teal"  />
            <KpiCard label="Pending Bills"   value={kpis.pending_bills}          icon={Receipt}     color="amber" />
            <KpiCard label="Departments"     value={dept_stats.length}           icon={Activity}    color="purple"/>
          </>
        )}
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:20}}>
        {/* Chart */}
        <div className="card" style={{padding:'28px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
            <div>
              <p style={{fontSize:17,fontWeight:700,color:'var(--text-1)'}}>Appointments by Department</p>
              <p style={{fontSize:13,color:'var(--text-3)',marginTop:3}}>All-time distribution across specialities</p>
            </div>
            {!loading && <span className="badge badge-teal" style={{fontSize:12,padding:'5px 12px'}}>{dept_stats.length} depts</span>}
          </div>
          {loading ? <Skeleton style={{ height: 220 }} /> : dept_stats.length===0
            ? <div style={{height:220,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'var(--text-3)'}}>No data yet</div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dept_stats} barSize={26} margin={{left:-10,right:8}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="department" tick={{fill:'var(--text-3)',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>v.split(' ')[0]}/>
                  <YAxis tick={{fill:'var(--text-3)',fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<ChartTip/>} cursor={{fill:'var(--bg-hover)'}}/>
                  <Bar dataKey="appointments" radius={[6,6,0,0]}>
                    {dept_stats.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Recent activity */}
        <div className="card" style={{padding:'28px'}}>
          <p style={{fontSize:17,fontWeight:700,color:'var(--text-1)',marginBottom:22}}>Recent Activity</p>
          {loading ? [1,2,3,4,5].map(i => <Skeleton key={i} style={{ height: 60, marginBottom: 10 }} />) : recent_appointments.length===0
            ? <EmptyState icon={Calendar} title="No recent activity"/>
            : (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {recent_appointments.slice(0,8).map(a=>(
                  <div key={a.appt_id} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,background:'var(--bg-raised)'}}>
                    <Avatar name={a.patient_name} size="sm"/>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:14,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text-1)'}}>{a.patient_name}</p>
                      <p style={{fontSize:12,color:'var(--text-3)',marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.doctor_name}</p>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <StatusBadge status={a.status}/>
                      <p style={{fontSize:11,color:'var(--text-3)',marginTop:3}}>{daysAgo(a.appt_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </motion.div>
    </motion.div>
  )
}
