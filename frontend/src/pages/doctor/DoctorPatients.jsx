import { useEffect, useState } from 'react'
import { appointmentsAPI } from '../../api'
import { PageHeader, EmptyState, Avatar, StatusBadge } from '../../components/Spinner.jsx'
import Spinner from '../../components/Spinner.jsx'
import { Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DoctorPatients() {
  const [appts,setAppts]=useState([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{ appointmentsAPI.list({per_page:200}).then(r=>setAppts(r.data.appointments||[])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false)) },[])

  const pMap={}
  appts.forEach(a=>{ if (!pMap[a.patient_id]) pMap[a.patient_id]={id:a.patient_id,name:a.patient_name,visits:0,last:a.appt_date,lastStatus:a.status}; pMap[a.patient_id].visits++; if(a.appt_date>pMap[a.patient_id].last){pMap[a.patient_id].last=a.appt_date;pMap[a.patient_id].lastStatus=a.status} })
  const patients=Object.values(pMap).sort((a,b)=>b.last.localeCompare(a.last))

  if (loading) return <div className="flex justify-center py-40"><Spinner size="lg"/></div>
  return (
    <div className="space-y-4 stagger">
      <PageHeader title="My Patients" subtitle={`${patients.length} unique patients`}/>
      {patients.length===0
        ? <EmptyState icon={Users} title="No patients yet"/>
        : (
          <div className="card overflow-hidden">
            <table className="tbl w-full">
              <thead><tr>{['Patient','Total Visits','Last Visit','Last Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {patients.map(p=>(
                  <tr key={p.id}>
                    <td><div className="flex items-center gap-3"><Avatar name={p.name}/><div><p className="primary text-sm">{p.name}</p><p className="text-xs font-mono" style={{color:'var(--text-muted)'}}>#{p.id}</p></div></div></td>
                    <td><span className="badge badge-blue">{p.visits} visit{p.visits>1?'s':''}</span></td>
                    <td className="text-xs font-mono" style={{color:'var(--text-muted)'}}>{new Date(p.last+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                    <td><StatusBadge status={p.lastStatus}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  )
}
