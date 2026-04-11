import { useEffect, useState } from 'react'
import { adminAPI } from '../../api'
import { PageHeader, EmptyState, Avatar } from '../../components/Spinner.jsx'
import Spinner from '../../components/Spinner.jsx'
import { UserCog, ShieldCheck, ShieldOff } from 'lucide-react'
import Skeleton from '../../components/Skeleton.jsx'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const ROLE_BADGE = { admin: 'badge-purple', doctor: 'badge-teal', patient: 'badge-blue' }

export default function AdminUsers() {
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [toggling, setToggling] = useState(null)

  const load = () =>
    adminAPI.users()
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const toggle = async uid => {
    setToggling(uid)
    try {
      const { data } = await adminAPI.toggleUser(uid)
      toast.success(data.message)
      setUsers(prev => prev.map(u => u.user_id === uid ? { ...u, is_active: data.user.is_active } : u))
    } catch { toast.error('Action failed') }
    finally { setToggling(null) }
  }


  const active   = users.filter(u => u.is_active).length
  const inactive = users.filter(u => !u.is_active).length

  return (
    <div className="space-y-4 stagger">
      <PageHeader title="User Management"
        subtitle={`${(users || []).length} total · ${active} active · ${inactive} inactive`} />

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Admins',   count: users.filter(u => u.role === 'admin').length,   cls: 'badge-purple' },
          { label: 'Doctors',  count: users.filter(u => u.role === 'doctor').length,  cls: 'badge-teal'   },
          { label: 'Patients', count: users.filter(u => u.role === 'patient').length, cls: 'badge-blue'   },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <span className={clsx('badge text-lg px-3 py-1', s.cls)}>{s.count}</span>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="card overflow-hidden"><Skeleton style={{ height: 400 }} /></div>
      ) : (users || []).length === 0
        ? <EmptyState icon={UserCog} title="No users found" />
        : (
          <div className="card overflow-hidden">
            <table className="tbl">
              <thead>
                <tr>
                  {['User', 'Role', 'Status', 'Last Login', 'Action'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {(users || []).map(u => {
                  const displayName = u.email.split('@')[0].replace('.', ' ')
                  return (
                    <tr key={u.user_id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={displayName} />
                          <div>
                            <p className="bold text-sm capitalize">{displayName}</p>
                            <p className="text-xs" style={{ color: 'var(--text-3)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className={clsx('badge', ROLE_BADGE[u.role] || 'badge-gray')}>{u.role}</span></td>
                      <td>
                        <span className={clsx('badge', u.is_active ? 'badge-teal' : 'badge-red')}>
                          {u.is_active ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
                        {u.last_login
                          ? new Date(u.last_login).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                          : 'Never'}
                      </td>
                      <td>
                        <button onClick={() => toggle(u.user_id)} disabled={toggling === u.user_id}
                          className={clsx(
                            'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all',
                            u.is_active
                              ? 'btn-danger'
                              : 'btn-success'
                          )}>
                          {toggling === u.user_id
                            ? '…'
                            : u.is_active
                              ? <><ShieldOff className="w-3 h-3" />Deactivate</>
                              : <><ShieldCheck className="w-3 h-3" />Activate</>
                          }
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  )
}
