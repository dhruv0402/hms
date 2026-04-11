import clsx from 'clsx'
import { X, Info, CheckCircle2, AlertCircle, Search } from 'lucide-react'

export default function Spinner({ fullscreen, size = 'md' }) {
  const sz = { sm:'w-4 h-4', md:'w-9 h-9', lg:'w-12 h-12' }[size]
  const el = (
    <div className={clsx(sz, 'rounded-full animate-spin')}
      style={{borderWidth: size==='sm'?'2px':'3px', borderStyle:'solid', borderColor:'var(--border-md)', borderTopColor:'var(--teal)'}} />
  )
  if (fullscreen) return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
      style={{background:'var(--bg)'}}>
      <div style={{width:48,height:48,borderRadius:'50%',border:'3px solid var(--border)',borderTopColor:'var(--teal)',animation:'spinAni 0.8s linear infinite'}} />
      <p style={{fontSize:15, color:'var(--text-3)', animation:'pulseAni 2s ease-in-out infinite'}}>Loading MediSync…</p>
    </div>
  )
  return el
}

export function StatusBadge({ status }) {
  const map = {
    Scheduled:'s-Scheduled', Completed:'s-Completed', Cancelled:'s-Cancelled',
    'No-Show':'s-No-Show', Paid:'s-Paid', Pending:'s-Pending', Refunded:'s-Refunded', Waived:'s-Waived',
  }
  const dot = {
    Scheduled:'#60a5fa', Completed:'#00d4aa', Cancelled:'#f87171',
    'No-Show':'#fbbf24', Paid:'#00d4aa', Pending:'#fbbf24', Refunded:'#a78bfa', Waived:'#9494b0',
  }
  return (
    <span className={clsx('badge', map[status] || 'badge-gray')}>
      <span style={{width:6,height:6,borderRadius:'50%',background:dot[status]||'#9494b0',flexShrink:0}} />
      {status}
    </span>
  )
}

export function KpiCard({ label, value, icon:Icon, color='teal', sub, trend }) {
  const c = {
    teal:  {bg:'rgba(0,212,170,0.11)',  ic:'#00d4aa'},
    blue:  {bg:'rgba(96,165,250,0.11)', ic:'#60a5fa'},
    amber: {bg:'rgba(245,158,11,0.11)', ic:'#fbbf24'},
    red:   {bg:'rgba(239,68,68,0.11)',  ic:'#f87171'},
    purple:{bg:'rgba(167,139,250,0.11)',ic:'#a78bfa'},
    green: {bg:'rgba(52,211,153,0.11)', ic:'#34d399'},
  }[color] || {bg:'rgba(0,212,170,0.11)',ic:'#00d4aa'}
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{background:c.bg}}>
        <Icon style={{width:22,height:22,color:c.ic}} />
      </div>
      <div style={{minWidth:0,flex:1}}>
        <p style={{fontSize:12,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--text-3)'}}>{label}</p>
        <p style={{fontSize:28,fontWeight:700,marginTop:4,color:'var(--text-1)',fontVariantNumeric:'tabular-nums',lineHeight:1.1}}>{value}</p>
        <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
          {sub   && <p style={{fontSize:12,color:'var(--text-3)'}}>{sub}</p>}
          {trend && <span style={{fontSize:12,fontWeight:600,color:'#34d399'}}>{trend}</span>}
        </div>
      </div>
    </div>
  )
}

export const StatCard = KpiCard

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:28}}>
      <div>
        <h1 style={{fontSize:26,fontWeight:700,letterSpacing:'-0.02em',color:'var(--text-1)'}}>{title}</h1>
        {subtitle && <p style={{fontSize:14,marginTop:4,color:'var(--text-3)'}}>{subtitle}</p>}
      </div>
      {action && <div style={{flexShrink:0}}>{action}</div>}
    </div>
  )
}

export function Modal({ open, onClose, title, subtitle, children, width='max-w-lg' }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className={clsx('modal-box', width)}>
        <div className="modal-header">
          <div>
            <h2 style={{fontSize:18,fontWeight:700,color:'var(--text-1)'}}>{title}</h2>
            {subtitle && <p style={{fontSize:13,marginTop:3,color:'var(--text-3)'}}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="btn-ghost" style={{padding:'8px',borderRadius:10}}>
            <X style={{width:18,height:18}} />
          </button>
        </div>
        <div style={{padding:'24px 28px'}}>{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ icon:Icon, title, description, action }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'64px 24px',textAlign:'center'}}>
      <div style={{width:60,height:60,borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:18,background:'var(--bg-raised)',border:'1px solid var(--border)'}}>
        <Icon style={{width:26,height:26,color:'var(--text-3)'}} />
      </div>
      <p style={{fontSize:16,fontWeight:600,color:'var(--text-2)'}}>{title}</p>
      {description && <p style={{fontSize:14,marginTop:6,maxWidth:320,color:'var(--text-3)'}}>{description}</p>}
      {action && <div style={{marginTop:20}}>{action}</div>}
    </div>
  )
}

export function Field({ label, children, required, hint }) {
  return (
    <div>
      <label className="label">{label}{required && <span style={{color:'#f87171',marginLeft:3}}>*</span>}</label>
      {children}
      {hint && <p style={{fontSize:12,marginTop:5,color:'var(--text-3)'}}>{hint}</p>}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder='Search…', className }) {
  return (
    <div className={clsx('relative', className)} style={{position:'relative'}}>
      <Search style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',width:15,height:15,color:'var(--text-3)',pointerEvents:'none'}} />
      <input type="search" value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        style={{paddingLeft:40}}
        className="input" />
    </div>
  )
}

export function Avatar({ name, size='md' }) {
  const initials = (name||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
  const pal = [
    {bg:'rgba(0,212,170,0.16)',c:'#00d4aa'}, {bg:'rgba(96,165,250,0.16)',c:'#60a5fa'},
    {bg:'rgba(167,139,250,0.16)',c:'#a78bfa'},{bg:'rgba(245,158,11,0.16)',c:'#fbbf24'},
    {bg:'rgba(248,113,113,0.16)',c:'#f87171'},{bg:'rgba(52,211,153,0.16)',c:'#34d399'},
  ]
  const p = pal[(name?.charCodeAt(0)||0)%pal.length]
  const sz = {sm:'32px',md:'36px',lg:'44px'}[size]
  return (
    <div style={{width:sz,height:sz,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:size==='lg'?15:13,flexShrink:0,background:p.bg,color:p.c}}>
      {initials}
    </div>
  )
}

export function TabFilter({ tabs, active, onChange }) {
  return (
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={active===t ? 'tab-active' : 'tab-inactive'}>
          {t||'All'}
        </button>
      ))}
    </div>
  )
}

export function Alert({ type='info', message }) {
  const s = {
    info:    {bg:'rgba(96,165,250,0.09)',  bd:'rgba(96,165,250,0.22)',  c:'#60a5fa', Icon:Info},
    success: {bg:'rgba(0,212,170,0.09)',   bd:'rgba(0,212,170,0.22)',   c:'#00d4aa', Icon:CheckCircle2},
    error:   {bg:'rgba(239,68,68,0.09)',   bd:'rgba(239,68,68,0.22)',   c:'#f87171', Icon:AlertCircle},
    warning: {bg:'rgba(245,158,11,0.09)',  bd:'rgba(245,158,11,0.22)',  c:'#fbbf24', Icon:AlertCircle},
  }[type]||{bg:'rgba(96,165,250,0.09)',bd:'rgba(96,165,250,0.22)',c:'#60a5fa',Icon:Info}
  return (
    <div style={{display:'flex',alignItems:'flex-start',gap:12,padding:'14px 18px',borderRadius:12,fontSize:14,fontWeight:500,background:s.bg,border:`1px solid ${s.bd}`,color:s.c}}>
      <s.Icon style={{width:17,height:17,flexShrink:0,marginTop:1}} />{message}
    </div>
  )
}
