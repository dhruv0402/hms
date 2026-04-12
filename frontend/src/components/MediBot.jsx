import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { appointmentsAPI, billingAPI, patientsAPI, adminAPI, pharmacyAPI } from '../api/index.js'
import clsx from 'clsx'
import { Sparkles, X, Send, Minimize2, Maximize2, ChevronDown, Loader2, AlertTriangle, User, RotateCcw, Calendar, ClipboardList, IndianRupee, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ── Groq API call ─────────────────────────────────────────────
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'   // Fast, free, excellent

// Groq API key is now loaded from environment variables (.env)
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY

async function callGroq(messages, system) {
  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 800,
      temperature: 0.65,
      messages: [{ role: 'system', content: system }, ...messages.map(m=>({ role: m.role, content: m.content }))],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(()=>({}))
    throw new Error(err.error?.message || `Groq API error ${res.status}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || 'No response received.'
}

// ── System prompts ─────────────────────────────────────────────
const buildSystem = (role, ctx) => {
  const today = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
  const base = `You are MediBot, an intelligent AI assistant embedded in MediSync Hospital Management System. Today is ${today}. Be concise, warm, and helpful. Use bullet points for lists. Never diagnose — always say "consult your doctor". For emergencies say "call 108 immediately".`

  if (role === 'patient') {
    const p = ctx.profile || {}
    const upcoming = (ctx.appointments||[]).filter(a=>a.status==='Scheduled').slice(0,5)
    const meds = (ctx.appointments||[]).filter(a=>a.status==='Completed').slice(0,3)
    const pending = (ctx.bills||[]).filter(b=>b.payment_status==='Pending')
    return `${base}

PATIENT: ${p.full_name||p.first_name+' '+p.last_name} | DOB: ${p.dob} | Blood: ${p.blood_group} | Gender: ${p.gender}
ALLERGIES: ${p.allergies || 'None known'} ← Always check before discussing medicines
PHONE: ${p.phone} | Address: ${p.address}

UPCOMING APPOINTMENTS (${upcoming.length}):
${upcoming.map(a=>`• ${a.appt_date} ${a.appt_time?.slice(0,5)} with ${a.doctor_name} (${a.department}) — ${a.reason||'No reason given'}`).join('\n') || 'None scheduled'}

MEDICAL CONDITIONS:
${(ctx.history||[]).map(h=>`• ${h.condition_name}${h.is_chronic?' [CHRONIC]':''} — ${h.treatment||'No treatment noted'}`).join('\n') || 'No history on record'}

PENDING BILLS (${pending.length}): Total due ₹${pending.reduce((s,b)=>s+b.total_amount,0).toLocaleString('en-IN')}

RULES: Explain medical terms simply. Cross-check allergies when discussing medicines. Never prescribe or change medications.`
  }

  if (role === 'doctor') {
    const p = ctx.profile || {}
    const today_appts = ctx.todayAppts || []
    const upcoming = (ctx.appointments||[]).filter(a=>a.status==='Scheduled').slice(0,10)
    const inv = ctx.inventory || {}
    return `${base}

DOCTOR: Dr. ${p.first_name} ${p.last_name} | ${p.specialization} | ${p.department}
CONSULTATION FEE: ₹${p.consultation_fee}

TODAY'S SCHEDULE (${today_appts.length} patients):
${today_appts.map((a,i)=>`${i+1}. ${a.appt_time?.slice(0,5)} — ${a.patient_name} — ${a.reason||'No reason'} [${a.status}]`).join('\n') || 'No appointments today'}

UPCOMING (next 10): ${upcoming.map(a=>`${a.appt_date} ${a.patient_name}`).join(', ') || 'None'}

INVENTORY AWARENESS:
• Total Stock: ${inv.total || 0} medicines
• Low Stock Alert: ${inv.lowStockList || 'All critical items in stock'}

RULES: Be clinical and concise. Provide drug dosages and reference info when asked. Help draft clinical notes. Mention medication availability if low.`
  }

  if (role === 'admin') {
    const k = ctx.kpis || {}
    const depts = (ctx.deptStats || []).map(d=>`${d.department}:${d.appointments}`).join(', ')
    const inv = ctx.inventory || {}
    return `${base}

HOSPITAL KPIs:
• Patients: ${k.total_patients} | Doctors: ${k.total_doctors}
• Today's appointments: ${k.todays_appointments} | Pending: ${k.pending_appointments}
• Monthly revenue: ₹${(k.monthly_revenue||0).toLocaleString('en-IN')} | Pending bills: ${k.pending_bills}

DEPARTMENT DISTRIBUTION: ${depts || 'No data'}

INVENTORY SUMMARY:
• Total Medicines: ${inv.total || 0}
• Low Stock Items (${inv.lowStockCount || 0}): ${inv.lowStockList || 'None'}

RULES: Be analytical. Provide operational insights. Help draft reports.`
  }

  const actions = `
  INTENT DETECTION:
  If the user wants to book an appointment, include [ACTION:BOOK] at the end.
  If they want to see their reports or history, include [ACTION:REPORTS] at the end.
  If they want to check bills or pricing, include [ACTION:BILLING] at the end.
  If they want to check inventory or manage medicines, include [ACTION:PHARMACY] at the end.
  `
  return base + (['patient', 'admin', 'doctor'].includes(role) ? actions : '')
}

// ── Quick prompts ──────────────────────────────────────────────
const QUICK = {
  patient: ['When is my next appointment?','What medicines am I on?','Any pending bills?','Explain my diagnosis','Which doctor for back pain?'],
  doctor:  ["Today's patient list","Brief my next patient","Standard Metformin dose?","Draft prescription note","How many appointments this week?"],
  admin:   ["Today's hospital summary","Revenue this month","Which dept is busiest?","Pending bills overview","Operational bottlenecks?"],
}

// ── Context fetcher ────────────────────────────────────────────
async function fetchCtx(role, user) {
  try {
    if (role === 'patient') {
      const pid = user?.profile?.patient_id
      const [a,b,h] = await Promise.all([
        appointmentsAPI.list({per_page:50}).then(r=>r.data.appointments).catch(()=>[]),
        billingAPI.list().then(r=>r.data).catch(()=>[]),
        pid ? patientsAPI.getHistory(pid).then(r=>r.data).catch(()=>[]) : [],
      ])
      return {profile:user?.profile, appointments:a, bills:b, history:h}
    }
    if (role === 'doctor') {
      const [t, a, m] = await Promise.all([
        appointmentsAPI.todaySchedule().then(r=>r.data.appointments).catch(()=>[]),
        appointmentsAPI.list({per_page:100}).then(r=>r.data.appointments).catch(()=>[]),
        pharmacyAPI.listMedicines().then(r=>r.data).catch(()=>[]),
      ])
      const lowStock = m.filter(item => item.stock_quantity <= item.min_stock_level)
      return {
        profile:user?.profile, 
        todayAppts:t, 
        appointments:a,
        inventory: {
          total: m.length,
          lowStockList: lowStock.slice(0, 5).map(i => i.name).join(', ') + (lowStock.length > 5 ? '...' : '')
        }
      }
    }
    if (role === 'admin') {
      const [d, m] = await Promise.all([
        adminAPI.dashboard().then(r=>r.data).catch(()=>({})),
        pharmacyAPI.listMedicines().then(r=>r.data).catch(()=>[]),
      ])
      
      const lowStock = m.filter(item => item.stock_quantity <= item.min_stock_level)
      return {
        kpis: d.kpis || {},
        deptStats: d.dept_stats || [],
        recentAppts: d.recent_appointments || [],
        inventory: {
          total: m.length,
          lowStockCount: lowStock.length,
          lowStockList: lowStock.slice(0, 10).map(i => `${i.name} (${i.stock_quantity})`).join(', ') + (lowStock.length > 10 ? '...' : '')
        }
      }
    }
  } catch {}
  return {}
}

// ── Markdown renderer ──────────────────────────────────────────
function Md({ text }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        if (line.startsWith('### ')) return <p key={i} className="font-bold text-xs mt-1.5" style={{color:'var(--text-primary)'}}>{line.slice(4)}</p>
        if (line.startsWith('## '))  return <p key={i} className="font-bold text-xs mt-1.5" style={{color:'var(--text-primary)'}}>{line.slice(3)}</p>
        if (line.match(/^[-•*]\s/)) return (
          <div key={i} className="flex gap-2 text-sm leading-relaxed">
            <span className="text-teal-400 flex-shrink-0 mt-0.5 font-bold">·</span>
            <span style={{color:'var(--text-secondary)'}}>{inlineMd(line.replace(/^[-•*]\s/,''))}</span>
          </div>
        )
        if (/^\d+\.\s/.test(line)) {
          const [num,...rest] = line.split('. ')
          return (
            <div key={i} className="flex gap-2 text-sm leading-relaxed">
              <span className="text-teal-400 font-bold flex-shrink-0">{num}.</span>
              <span style={{color:'var(--text-secondary)'}}>{inlineMd(rest.join('. '))}</span>
            </div>
          )
        }
        return <p key={i} className="text-sm leading-relaxed" style={{color:'var(--text-secondary)'}}>{inlineMd(line)}</p>
      })}
    </div>
  )
}

function ActionButtons({ content, accent }) {
  const navigate = useNavigate()
  const map = {
    BOOK:    { label: 'Book Appointment', to: '/patient/book',    icon: Calendar },
    REPORTS: { label: 'View Reports',     to: '/patient/history', icon: ClipboardList },
    BILLING: { label: 'Check Bills',      to: '/patient/billing', icon: IndianRupee },
    PHARMACY: { label: 'Open Pharmacy Unit', to: '/admin/pharmacy', icon: ClipboardList },
  }

  const match = content.match(/\[ACTION:(\w+)\]/)
  if (!match) return null

  const act = map[match[1]]
  if (!act) return null

  return (
    <div className="mt-4 pt-3 border-t border-white border-opacity-5">
      <button onClick={() => navigate(act.to)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full justify-between"
        style={{background:`${accent}15`, border:`1px solid ${accent}30`, color:accent}}>
        <div className="flex items-center gap-2">
          <act.icon className="w-3.5 h-3.5" />
          {act.label}
        </div>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function inlineMd(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} style={{color:'var(--text-primary)',fontWeight:600}}>{p.slice(2,-2)}</strong>
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1,-1)}</em>
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="px-1.5 py-0.5 rounded text-teal-400" style={{background:'rgba(0,212,170,0.1)',fontFamily:'Geist Mono',fontSize:'13px'}}>{p.slice(1,-1)}</code>
    return p
  })
}

// ── MAIN COMPONENT ─────────────────────────────────────────────
export default function MediBot() {
  const { user } = useAuth()
  const role = user?.role || 'patient'

  const [open,       setOpen]       = useState(false)
  const [minimized,  setMinimized]  = useState(false)
  const [messages,   setMessages]   = useState([])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [ctxLoading, setCtxLoading] = useState(false)
  const [error,      setError]      = useState(null)
  const [context,    setContext]    = useState(null)

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const msgsRef   = useRef(messages)
  msgsRef.current = messages

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages, loading])
  useEffect(()=>{ if (open&&!minimized) setTimeout(()=>inputRef.current?.focus(),150) }, [open,minimized])

  const openChat = useCallback(async () => {
    setOpen(true); setMinimized(false)
    if (context) return
    setCtxLoading(true)
    const ctx = await fetchCtx(role, user)
    setContext(ctx)
    setCtxLoading(false)
    const n = user?.profile?.first_name || user?.email?.split('@')[0] || 'there'
    const hr = new Date().getHours()
    const greet = hr<12?'Good morning':hr<17?'Good afternoon':'Good evening'
    const welcomes = {
      patient: `Hi ${n} 👋 I'm **MediBot**, your personal health assistant.\n\nI have your appointments, prescriptions, medical history and bills loaded. Ask me anything — I'm here to make your healthcare experience smoother.\n\n*What would you like to know?*`,
      doctor:  `${greet}, Dr. ${n} 👋 I'm **MediBot**.\n\nYour schedule and patient data are loaded. Ask me to brief you on patients, help with clinical notes, or answer drug reference questions.`,
      admin:   `${greet}, ${n} 👋 I'm **MediBot**, your operations assistant.\n\nHospital KPIs and operational data are loaded. Ask for summaries, revenue analysis, or department insights.`,
    }
    setMessages([{role:'assistant',content:welcomes[role]||welcomes.patient,ts:Date.now()}])
  }, [context, role, user])

  const send = async (txt) => {
    if (!GROQ_KEY) {
      setError('Groq API key not found. Please add VITE_GROQ_API_KEY to your frontend/.env file.')
      return
    }
    const msg = (txt || input).trim()
    if (!msg || loading) return
    setInput(''); setError(null)
    const newMsgs = [...msgsRef.current, {role:'user',content:msg,ts:Date.now()}]
    setMessages(newMsgs)
    setLoading(true)
    try {
      const system = buildSystem(role, context || {})
      const reply = await callGroq(newMsgs, system)
      setMessages(prev=>[...prev,{role:'assistant',content:reply,ts:Date.now()}])
    } catch(err) {
      setError(err.message || 'Failed to connect to Groq. Check your API key.')
    } finally { setLoading(false) }
  }

  const clearChat = () => {
    setMessages([])
    setContext(null)
    openChat()
  }

  const quick = QUICK[role] || QUICK.patient
  const showQuick = messages.length <= 1 && !loading && !ctxLoading

  const ROLE_GRAD = {
    patient:'linear-gradient(135deg,#1e3a5f,#1a2e4a)',
    doctor:'linear-gradient(135deg,#0a2a22,#0d3028)',
    admin:'linear-gradient(135deg,#1e1a3a,#18162e)',
  }
  const ROLE_ACCENT = { patient:'#60a5fa', doctor:'#00d4aa', admin:'#a78bfa' }
  const accent = ROLE_ACCENT[role] || '#00d4aa'

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button onClick={openChat}
          className="fixed bottom-6 right-6 z-50 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{width:68,height:68,background:`linear-gradient(135deg,${accent},${accent}cc)`,boxShadow:`0 0 32px ${accent}66, 0 8px 24px rgba(0,0,0,0.5)`}}>
          <Sparkles className="w-8 h-8" style={{color:'#fff'}} />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border-2 animate-pulse" style={{background:'#4ade80',borderColor:'var(--bg-base)'}} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className={clsx('fixed right-6 z-50 flex flex-col rounded-2xl overflow-hidden transition-all duration-300',
          minimized ? 'bottom-6 w-80 h-14' : 'bottom-6 w-[440px] h-[720px]')}
          style={{background:'var(--bg-card)',border:'1px solid var(--glass-border)',boxShadow:`0 0 0 1px ${accent}33, 0 40px 100px rgba(0,0,0,0.8)`}}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{background:ROLE_GRAD[role],borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${accent}25`,border:`1px solid ${accent}40`}}>
                <Sparkles className="w-5 h-5" style={{color:accent}} />
              </div>
              <div>
                <p className="text-sm font-bold leading-none" style={{color:'var(--text-primary)'}}>MediBot</p>
                <p className="text-xs mt-1 text-white/50">
                  {ctxLoading ? 'Loading context…' : `● Live · Groq LLaMA 3.3`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!minimized && (
                <button onClick={clearChat} className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors" style={{color:'rgba(255,255,255,0.4)'}}
                  title="Reset chat" onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.8)'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.4)'}>
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
              <button onClick={()=>setMinimized(m=>!m)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors" style={{color:'rgba(255,255,255,0.4)'}}>
                {minimized?<Maximize2 className="w-3 h-3"/>:<Minimize2 className="w-3 h-3"/>}
              </button>
              <button onClick={()=>setOpen(false)} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{color:'rgba(255,255,255,0.4)'}}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {minimized && (
            <button onClick={()=>setMinimized(false)} className="flex-1 flex items-center justify-between px-5 text-sm font-medium" style={{color:'var(--text-secondary)'}}>
              <span>MediBot — AI Health Assistant</span>
              <ChevronDown className="w-4 h-4 rotate-180" />
            </button>
          )}

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-y">
                {ctxLoading && (
                  <div className="flex flex-col items-center gap-2 py-10" style={{color:'var(--text-muted)'}}>
                    <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                    <p className="text-[11px]">Loading your health data…</p>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div key={i} className={clsx('flex gap-2', m.role==='user'?'justify-end':'justify-start')}>
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{background:`${accent}20`,border:`1px solid ${accent}30`}}>
                        <Sparkles className="w-4 h-4" style={{color:accent}} />
                      </div>
                    )}
                    <div className={clsx('max-w-[84%] rounded-[18px] px-4 py-3',
                      m.role==='user'
                        ? 'rounded-tr-sm text-sm text-white'
                        : 'rounded-tl-sm')}
                      style={m.role==='user'
                        ? {background:`linear-gradient(135deg,${accent},${accent}cc)`}
                        : {background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
                      {m.role==='user'
                        ? <p className="text-sm leading-relaxed">{m.content}</p>
                        : (
                          <>
                            <Md text={m.content.replace(/\[ACTION:\w+\]/g, '')} />
                            <ActionButtons content={m.content} accent={accent} />
                          </>
                        )
                      }
                    </div>
                    {m.role==='user' && (
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{background:'rgba(255,255,255,0.06)'}}>
                        <User className="w-4 h-4" style={{color:'var(--text-muted)'}} />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing */}
                {loading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:`${accent}20`,border:`1px solid ${accent}30`}}>
                      <Sparkles className="w-3 h-3" style={{color:accent}} />
                    </div>
                    <div className="rounded-xl rounded-tl-sm px-3 py-2.5" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
                      <div className="flex gap-1 items-center h-4">
                        {[0,1,2].map(d=>(
                          <div key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{background:accent,animationDelay:`${d*150}ms`,opacity:0.7}} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex gap-2 items-start text-[11px] px-3 py-2.5 rounded-xl" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171'}}>
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Quick prompts */}
              {showQuick && !ctxLoading && (
                <div className="px-5 pb-3 flex-shrink-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{color:'var(--text-muted)'}}>Try asking</p>
                  <div className="flex flex-wrap gap-2">
                    {quick.map((q,i)=>(
                      <button key={i} onClick={()=>send(q)}
                        className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150"
                        style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'var(--text-secondary)'}}
                        onMouseEnter={e=>{e.target.style.borderColor=accent+'44';e.target.style.color=accent;e.target.style.background=accent+'12'}}
                        onMouseLeave={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)';e.target.style.color='var(--text-secondary)';e.target.style.background='rgba(255,255,255,0.04)'}}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="px-4 pb-4 flex-shrink-0" style={{borderTop:'1px solid rgba(255,255,255,0.04)',paddingTop:'16px'}}>
                <div className="flex items-end gap-3 px-4 py-3 rounded-2xl transition-all" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
                    placeholder="Ask anything…"
                    rows={1}
                    disabled={loading||ctxLoading}
                    className="flex-1 bg-transparent text-sm resize-none outline-none py-1 max-h-32"
                    style={{color:'var(--text-primary)',fontFamily:'Geist',minHeight:'24px'}}
                  />
                  <button onClick={()=>send()} disabled={!input.trim()||loading||ctxLoading}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                    style={{background:input.trim()&&!loading?accent:'rgba(255,255,255,0.08)',color:input.trim()&&!loading?'#001a14':'var(--text-muted)',boxShadow:input.trim()&&!loading?`0 0 16px ${accent}44`:'none'}}>
                    {loading?<Loader2 className="w-5 h-5 animate-spin"/>:<Send className="w-5 h-5"/>}
                  </button>
                </div>
                <p className="text-xs text-center mt-3 font-medium" style={{color:'var(--text-muted)'}}>
                  Powered by Groq LLaMA · Not a substitute for medical advice
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
