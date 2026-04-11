import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useTheme } from '../hooks/useTheme.jsx'
import toast from 'react-hot-toast'
import { HeartPulse, Eye, EyeOff, ArrowRight, Zap, Shield, Activity, Sun, Moon } from 'lucide-react'

const DEMOS = [
  { role:'Admin',   email:'admin@medisync.com',         color:'#a78bfa', desc:'Full system access & analytics' },
  { role:'Doctor',  email:'rajesh.sharma@medisync.com', color:'#00d4aa', desc:'Dr. Rajesh Sharma · Cardiology' },
  { role:'Patient', email:'aryan.kapoor@gmail.com',      color:'#60a5fa', desc:'Aryan Kapoor · Patient portal' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({email:'', password:''})
  const [show, setShow]     = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const user = await login(form)
      toast.success('Welcome back!')
      navigate({admin:'/admin',doctor:'/doctor',patient:'/patient'}[user.role]||'/', {replace:true})
    } catch(err) { toast.error(err.response?.data?.error||'Invalid credentials') }
    finally { setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh', display:'flex', background:'var(--bg)', fontFamily:'Geist, system-ui, sans-serif'}}>
      
      {/* Theme Toggle - Now accessible straight from Login! */}
      <button onClick={toggle} className="btn-ghost" style={{position: 'absolute', top: 32, right: 32, zIndex: 50, padding: 14, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)'}} title="Toggle theme">
        {dark
          ? <Sun style={{width:24, height:24, color:'#fbbf24'}} />
          : <Moon style={{width:24, height:24, color:'var(--text-2)'}} />
        }
      </button>

      {/* Left panel - Ultra Premium Hero */}
      <div style={{width:'50%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'64px 80px', background:'var(--bg-card)', borderRight:'1px solid var(--border)', position:'relative', overflow:'hidden'}}>
        {/* Dynamic Background Elements */}
        <div style={{position:'absolute', top:'-10%', right:'-10%', width:'60%', height:'60%', borderRadius:'50%', background:'radial-gradient(circle, rgba(0,212,170,0.15), transparent)', pointerEvents:'none', filter:'blur(60px)'}} />
        <div style={{position:'absolute', bottom:'-10%', left:'-10%', width:'70%', height:'70%', borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.1), transparent)', pointerEvents:'none', filter:'blur(80px)'}} />

        {/* Logo */}
        <div style={{position:'relative', display:'flex', alignItems:'center', gap:20}}>
          <div style={{width:64, height:64, borderRadius:20, background:'var(--teal)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 40px rgba(0,212,170,0.5)'}}>
            <HeartPulse style={{width:32, height:32, color:'#011a14'}} />
          </div>
          <div>
            <p style={{fontWeight:800, fontSize:32, color:'var(--text-1)', lineHeight:1.1, letterSpacing:'-0.02em'}}>MediSync</p>
            <p style={{fontSize:16, color:'var(--text-3)', marginTop:6, fontWeight:500, letterSpacing:'0.05em'}}>HOSPITAL MANAGEMENT OS</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div style={{position:'relative', zIndex: 10, marginTop: '-40px'}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:10, padding:'8px 16px', background:'var(--teal-dim)', border:'1px solid var(--teal-bd)', borderRadius:99, marginBottom:32}}>
            <Zap style={{width:16, height:16, color:'var(--teal)'}} />
            <span style={{fontSize:14, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--teal)'}}>System Version 3.0</span>
          </div>
          
          <h1 style={{fontSize:64, fontWeight:900, lineHeight:1.05, letterSpacing:'-0.04em', color:'var(--text-1)', marginBottom:24}}>
            Manage care with <br/>
            <span style={{background: 'linear-gradient(135deg, var(--teal), #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>precision.</span>
          </h1>
          <p style={{fontSize:20, color:'var(--text-2)', lineHeight:1.6, maxWidth:480, fontWeight:400}}>
            An ultra-modern, lightning-fast platform to manage appointments, billing, and AI-driven patient insights without the friction.
          </p>

          <div style={{display:'flex', gap:16, marginTop:48, flexWrap:'wrap'}}>
            {[{Icon:Zap,l:'AI Assistant'},{Icon:Shield,l:'Role Security'},{Icon:Activity,l:'Real-time Analytics'}].map(({Icon,l})=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 20px',borderRadius:16,fontSize:15,fontWeight:600,background:'var(--bg-raised)',border:'1px solid var(--border)',color:'var(--text-1)',boxShadow:'0 4px 12px rgba(0,0,0,0.05)'}}>
                <Icon style={{width:20,height:20,color:'var(--teal)'}} />{l}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{position:'relative', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, padding:'32px', background:'var(--bg-raised)', borderRadius:24, border:'1px solid var(--border)', backdropFilter:'blur(10px)'}}>
          {[{n:'30k+',l:'Patients Served'},{n:'200+',l:'Active Doctors'},{n:'99.9%',l:'System Uptime'}].map(s=>(
            <div key={s.l}>
              <p style={{fontSize:36,fontWeight:800,color:'var(--teal)',lineHeight:1}}>{s.n}</p>
              <p style={{fontSize:14,fontWeight:500,color:'var(--text-3)',marginTop:8, textTransform:'uppercase', letterSpacing:'0.05em'}}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Login Box */}
      <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 10%'}}>
        <div style={{maxWidth:480, width:'100%', margin:'0 auto'}}>
          <h2 style={{fontSize:40, fontWeight:800, letterSpacing:'-0.03em', color:'var(--text-1)', marginBottom:12}}>Welcome back</h2>
          <p style={{fontSize:18, color:'var(--text-3)', marginBottom:48}}>Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:28}}>
            <div>
              <label className="label" style={{fontSize:14, marginBottom:10}}>Email Address</label>
              <input type="email" required value={form.email} autoComplete="email"
                onChange={e=>setForm(p=>({...p,email:e.target.value}))}
                placeholder="doctor@medisync.com" className="input" style={{padding:'18px 24px', fontSize:16, borderRadius:16}} />
            </div>
            <div>
              <label className="label" style={{fontSize:14, marginBottom:10}}>Password</label>
              <div style={{position:'relative'}}>
                <input type={show?'text':'password'} required value={form.password} autoComplete="current-password"
                  onChange={e=>setForm(p=>({...p,password:e.target.value}))}
                  placeholder="••••••••" className="input" style={{padding:'18px 24px', paddingRight:60, fontSize:16, borderRadius:16}} />
                <button type="button" onClick={()=>setShow(!show)} className="btn-ghost"
                  style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',padding:'8px',borderRadius:12}}>
                  {show?<EyeOff style={{width:20,height:20}}/>:<Eye style={{width:20,height:20}}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%',justifyContent:'center',marginTop:12,padding:'20px 24px',fontSize:18, borderRadius:16, boxShadow:'0 8px 24px rgba(0,212,170,0.3)'}}>
              {loading
                ? <><div style={{width:20,height:20,borderRadius:'50%',border:'3px solid rgba(1,26,20,0.3)',borderTopColor:'#011a14',animation:'spinAni 0.8s linear infinite'}}/>Authenticating…</>
                : <><span>Enter Workspace</span><ArrowRight style={{width:20,height:20}}/></>
              }
            </button>
          </form>

          {/* Quick Demo Boxes */}
          <div style={{marginTop:56}}>
            <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:24}}>
              <div style={{flex:1,height:1,background:'var(--border-md)'}} />
              <span style={{fontSize:14,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-3)'}}>1-Click Demo Environments</span>
              <div style={{flex:1,height:1,background:'var(--border-md)'}} />
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {DEMOS.map(d=>(
                <button key={d.role} onClick={()=>setForm({email:d.email,password:'Password@123'})}
                  style={{display:'flex',alignItems:'center',gap:20,padding:'20px 24px',borderRadius:20,textAlign:'left',background:'var(--bg-raised)',border:'1px solid var(--border)',cursor:'pointer',transition:'all 0.2s',width:'100%',fontFamily:'Geist,system-ui,sans-serif'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=d.color+'66';e.currentTarget.style.background=d.color+'15';e.currentTarget.style.transform='scale(1.02)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)';e.currentTarget.style.transform='scale(1)'}}>
                  <div style={{width:48,height:48,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,flexShrink:0,background:d.color+'25',color:d.color, boxShadow:`0 0 20px ${d.color}30`}}>
                    {d.role[0]}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:18,fontWeight:800,color:'var(--text-1)', marginBottom:4}}>{d.role} Portal</p>
                    <p style={{fontSize:14,fontWeight:500,color:'var(--text-3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.desc}</p>
                  </div>
                  <ArrowRight style={{width:20,height:20,color:'var(--text-2)',flexShrink:0}} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
