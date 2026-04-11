import { useEffect, useState } from 'react'
import { patientsAPI } from '../../api'
import { PageHeader, SearchInput, EmptyState, Avatar } from '../../components/Spinner.jsx'
import Spinner from '../../components/Spinner.jsx'
import { Users } from 'lucide-react'
import Skeleton from '../../components/Skeleton.jsx'
import toast from 'react-hot-toast'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')

  const load = q =>
    patientsAPI.list({ search: q })
      .then(r => setPatients(r.data))
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false))

  useEffect(() => { load('') }, [])


  return (
    <div className="space-y-4 stagger">
      <PageHeader title="Patients" subtitle={`${(patients || []).length} registered patients`} />

      <SearchInput value={search} onChange={v => { setSearch(v); load(v) }}
        placeholder="Search by name or phone…" className="w-80" />

      {loading ? (
        <div className="card-outer overflow-hidden"><Skeleton style={{ height: 400 }} /></div>
      ) : (patients || []).length === 0
        ? <EmptyState icon={Users} title="No patients found" description="Patients appear here after registration" />
        : (
          <div className="card overflow-hidden">
            <table className="tbl">
              <thead>
                <tr>
                  {['Patient', 'Contact', 'Blood Group', 'Gender', 'Allergies', 'Date of Birth'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(patients || []).map(p => (
                  <tr key={p.patient_id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={p.full_name} />
                        <div>
                          <p className="bold text-sm">{p.full_name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-3)' }}>{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{p.phone || '—'}</td>
                    <td>
                      {p.blood_group
                        ? <span className="badge badge-red">{p.blood_group}</span>
                        : <span style={{ color: 'var(--text-3)' }}>—</span>
                      }
                    </td>
                    <td className="text-xs">{p.gender || '—'}</td>
                    <td>
                      {p.allergies && p.allergies !== 'None'
                        ? <span className="badge badge-amber">{p.allergies}</span>
                        : <span className="text-xs" style={{ color: 'var(--text-3)' }}>None</span>
                      }
                    </td>
                    <td className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{p.dob || '—'}</td>
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
