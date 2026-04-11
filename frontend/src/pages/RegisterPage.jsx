import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import toast from 'react-hot-toast'
import { HeartPulse, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Field } from '../components/Spinner.jsx'
import Spinner from '../components/Spinner.jsx'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [show, setShow]       = useState(false)
  const [form, setForm]       = useState({ email:'',password:'',first_name:'',last_name:'',dob:'',gender:'',blood_group:'',phone:'',address:'',allergies:'' })
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try { await register(form); toast.success('Account created!'); navigate('/patient',{replace:true}) }
    catch(err) { toast.error(err.response?.data?.error||'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{background:'var(--bg-base)'}}>
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'var(--teal)',boxShadow:'0 0 16px rgba(0,212,170,0.35)'}}>
            <HeartPulse className="w-4 h-4" style={{color:'#001a14'}}/>
          </div>
          <span className="font-bold" style={{color:'var(--text-primary)'}}>MediSync</span>
        </div>

        <div className="card p-7">
          <h1 className="text-xl font-bold mb-1" style={{color:'var(--text-primary)'}}>Create your account</h1>
          <p className="text-xs mb-6" style={{color:'var(--text-muted)'}}>Register as a new patient</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account section */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-teal-400">Account Details</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" required><input required value={form.first_name} onChange={set('first_name')} placeholder="Aryan" className="input"/></Field>
                <Field label="Last Name"  required><input required value={form.last_name}  onChange={set('last_name')}  placeholder="Kapoor" className="input"/></Field>
                <Field label="Email" required><input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" className="input"/></Field>
                <Field label="Password" required>
                  <div className="relative">
                    <input type={show?'text':'password'} required value={form.password} onChange={set('password')} placeholder="Min 8 characters" className="input pr-9"/>
                    <button type="button" onClick={()=>setShow(!show)} className="btn-ghost absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded">
                      {show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            {/* Medical section */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-teal-400">Medical Profile</p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Date of Birth"><input type="date" value={form.dob} onChange={set('dob')} className="input"/></Field>
                <Field label="Gender">
                  <select value={form.gender} onChange={set('gender')} className="input">
                    <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </Field>
                <Field label="Blood Group">
                  <select value={form.blood_group} onChange={set('blood_group')} className="input">
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g=><option key={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Phone"><input value={form.phone} onChange={set('phone')} placeholder="9876543210" className="input"/></Field>
                <Field label="Known Allergies"><input value={form.allergies} onChange={set('allergies')} placeholder="Penicillin, None…" className="input"/></Field>
              </div>
              <div className="mt-3">
                <Field label="Address"><textarea value={form.address} onChange={set('address')} rows={2} className="input resize-none"/></Field>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-teal w-full h-10">
              {loading?<><Spinner size="sm" color="white"/>Creating account…</>:<><span>Create Account</span><ArrowRight className="w-4 h-4"/></>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{color:'var(--text-muted)'}}>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-teal-400 hover:text-teal-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
