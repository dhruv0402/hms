import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useTheme } from '../hooks/useTheme.jsx'
import MediBot from './MediBot.jsx'
import { useSocket } from '../hooks/useSocket.js'
import clsx from 'clsx'
import {
  LayoutDashboard, Calendar, Users, Receipt, UserCog,
  Stethoscope, LogOut, ClipboardList, User, HeartPulse,
  Activity, Sun, Moon, Zap, Pill
} from 'lucide-react'

const NAV = {
  admin: [
    { to:'/admin',          icon:LayoutDashboard, label:'Dashboard', exact:true },
    { to:'/admin/doctors',  icon:Stethoscope,     label:'Doctors'  },
    { to:'/admin/patients', icon:Users,           label:'Patients' },
    { to:'/admin/billing',  icon:Receipt,         label:'Billing'  },
    { to:'/admin/users',    icon:UserCog,         label:'Users'    },
    { to:'/admin/pharmacy', icon:Pill,            label:'Pharmacy' },
  ],
  doctor: [
    { to:'/doctor',              icon:LayoutDashboard, label:'Dashboard',   exact:true },
    { to:'/doctor/appointments', icon:Calendar,        label:'Appointments' },
    { to:'/doctor/patients',     icon:Users,           label:'My Patients'  },
  ],
  patient: [
    { to:'/patient',              icon:LayoutDashboard, label:'Dashboard',   exact:true },
    { to:'/patient/appointments', icon:Calendar,        label:'Appointments' },
    { to:'/patient/book',         icon:ClipboardList,   label:'Book Visit'   },
    { to:'/patient/billing',      icon:Receipt,         label:'Billing'      },
    { to:'/patient/profile',      icon:User,            label:'Profile'      },
  ],
}

const ROLE = {
  admin:   { label:'Administrator', color:'#a78bfa' },
  doctor:  { label:'Physician',     color:'#00d4aa' },
  patient: { label:'Patient',       color:'#60a5fa' },
}

export default function AppLayout({ role }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  useSocket() // Initialize socket connection
  const nav  = NAV[role] || []
  const meta = ROLE[role] || ROLE.patient

  const name = user?.profile
    ? `${user.profile.first_name} ${user.profile.last_name}`
    : user?.email?.split('@')[0] || 'User'
  const initials = name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()

  return (
    <div style={{display:'flex', minHeight:'100vh'}}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{padding:'32px 24px 24px', borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
            <div style={{width:48, height:48, borderRadius:16, background:'var(--teal)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 24px rgba(0,212,170,0.3)'}}>
              <HeartPulse style={{width:24, height:24, color:'#011a14'}} />
            </div>
            <div style={{flex:1, minWidth:0}}>
              <p style={{fontWeight:800, fontSize:20, color:'var(--text-1)', lineHeight:1}}>MediSync</p>
              <p style={{fontSize:13, color:'var(--text-3)', marginTop:4, fontWeight:500}}>Hospital Management</p>
            </div>
            <button onClick={toggle} className="btn-ghost" style={{padding:'10px', borderRadius:12, flexShrink:0}} title="Toggle theme">
              {dark
                ? <Sun style={{width:20, height:20, color:'#fbbf24'}} />
                : <Moon style={{width:20, height:20, color:'var(--text-2)'}} />
              }
            </button>
          </div>
        </div>

        {/* Role */}
        <div style={{padding:'20px 24px 12px'}}>
          <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, background:'var(--bg-hover)'}}>
            <div style={{width:10, height:10, borderRadius:'50%', background:meta.color, boxShadow:`0 0 10px ${meta.color}80`, flexShrink:0}} />
            <span style={{fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:meta.color}}>{meta.label}</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{flex:1, padding:'12px 16px', display:'flex', flexDirection:'column', gap:6, overflowY:'auto'}}>
          {nav.map(({to, icon:Icon, label, exact}) => (
            <NavLink key={to} to={to} end={exact}
              className={({isActive}) => clsx('nav-link', isActive && 'active')}>
              <Icon style={{width:20, height:20, flexShrink:0}} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* MediBot promo */}
        <div style={{margin:'0 16px 16px', padding:'18px 20px', borderRadius:16, background:'var(--teal-dim)', border:'1px solid var(--teal-bd)', cursor:'pointer'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <Zap style={{width:18, height:18, color:'var(--teal)', flexShrink:0}} />
            <span style={{fontSize:15, fontWeight:700, color:'var(--teal)'}}>MediBot AI</span>
            <span style={{marginLeft:'auto', fontSize:11, fontWeight:800, padding:'4px 8px', borderRadius:8, background:'var(--teal)', color:'#011a14'}}>LIVE</span>
          </div>
          <p style={{fontSize:13, color:'var(--text-3)', marginTop:8}}>AI health assistant · Click ✦ bottom right</p>
        </div>

        {/* User */}
        <div style={{padding:'16px', borderTop:'1px solid var(--border)'}}>
          <div style={{display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:16, background:'var(--bg-raised)', marginBottom:8}}>
            <div style={{width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, flexShrink:0, background:meta.color+'25', color:meta.color}}>
              {initials}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <p style={{fontSize:15, fontWeight:700, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{name}</p>
              <p style={{fontSize:13, color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{user?.email}</p>
            </div>
          </div>
          <button onClick={() => {logout(); navigate('/login')}}
            className="nav-link" style={{color:'#f87171', fontSize:15}}>
            <LogOut style={{width:20, height:20}} />Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-wrap" style={{flex:1, display:'flex', flexDirection:'column'}}>
        {/* Topbar */}
        <div style={{
          position:'sticky', top:0, zIndex:20,
          padding:'18px 48px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background: dark ? 'rgba(12,12,20,0.88)' : 'rgba(240,240,245,0.88)',
          backdropFilter:'blur(14px)',
          borderBottom:'1px solid var(--border)',
        }}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{width:10, height:10, borderRadius:'50%', background:'#34d399', animation:'pulseAni 2s ease-in-out infinite'}} />
            <span style={{fontSize:15, fontWeight:600, color:'#34d399'}}>All systems operational</span>
          </div>
          <span style={{fontSize:15, color:'var(--text-3)', fontFamily:'monospace', fontWeight:500}}>
            {new Date().toLocaleDateString('en-IN', {weekday:'short', day:'numeric', month:'short', year:'numeric'})}
          </span>
        </div>

        <div className="page-inner" style={{flex:1, padding: '48px 56px'}}>
          <Outlet />
        </div>
      </div>

      <MediBot />
    </div>
  )
}
