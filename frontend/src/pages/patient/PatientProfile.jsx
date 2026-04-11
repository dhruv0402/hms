import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { patientsAPI, authAPI } from '../../api'
import { PageHeader, Field, Avatar } from '../../components/Spinner.jsx'
import Spinner from '../../components/Spinner.jsx'
import { Save, Lock, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PatientProfile() {
  const { user, loadUser } = useAuth()
  const p = user?.profile || {}
  const [saving,setSaving]=useState(false)
  const [pwSaving,setPwSaving]=useState(false)
  const [pwForm,setPwForm]=useState({old_password:'',new_password:'',confirm:''})
  const [form,setForm]=useState({first_name:p.first_name||'',last_name:p.last_name||'',phone:p.phone||'',address:p.address||'',emergency_contact:p.emergency_contact||'',allergies:p.allergies||'',blood_group:p.blood_group||'',gender:p.gender||'',dob:p.dob||''})
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}))
  const setPw=k=>e=>setPwForm(f=>({...f,[k]:e.target.value}))
  const fullName=`${form.first_name} ${form.last_name}`.trim()||'Patient'

  const handleSave=async e=>{ e.preventDefault(); setSaving(true); try { await patientsAPI.update(p.patient_id,form); await loadUser(); toast.success('Profile updated') } catch { toast.error('Failed') } finally { setSaving(false) } }
  const handlePw=async e=>{ e.preventDefault(); if(pwForm.new_password.length<8){toast.error('Min 8 characters');return} if(pwForm.new_password!==pwForm.confirm){toast.error("Passwords don't match");return}; setPwSaving(true); try { await authAPI.changePassword({old_password:pwForm.old_password,new_password:pwForm.new_password}); toast.success('Password changed'); setPwForm({old_password:'',new_password:'',confirm:''}) } catch(err) { toast.error(err.response?.data?.error||'Failed') } finally { setPwSaving(false) } }

  return (
    <div className="space-y-5 stagger max-w-2xl">
      <PageHeader title="My Profile" subtitle="Manage personal and medical information"/>

      {/* Profile card */}
      <div className="card p-5 flex items-center gap-4">
        <Avatar name={fullName} size="lg"/>
        <div>
          <p className="font-bold text-base" style={{color:'var(--text-primary)'}}>{fullName}</p>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{user?.email}</p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {form.blood_group && <span className="badge badge-red">🩸 {form.blood_group}</span>}
            {form.gender      && <span className="badge badge-gray">{form.gender}</span>}
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="card p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-4">Personal Information</p>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name"><input value={form.first_name} onChange={set('first_name')} className="input"/></Field>
            <Field label="Last Name"> <input value={form.last_name}  onChange={set('last_name')}  className="input"/></Field>
            <Field label="Date of Birth"><input type="date" value={form.dob} onChange={set('dob')} className="input"/></Field>
            <Field label="Gender"><select value={form.gender} onChange={set('gender')} className="input"><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></Field>
            <Field label="Blood Group"><select value={form.blood_group} onChange={set('blood_group')} className="input"><option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g=><option key={g}>{g}</option>)}</select></Field>
            <Field label="Phone"><input value={form.phone} onChange={set('phone')} placeholder="9876543210" className="input"/></Field>
            <Field label="Emergency Contact"><input value={form.emergency_contact} onChange={set('emergency_contact')} className="input"/></Field>
            <Field label="Known Allergies"><input value={form.allergies} onChange={set('allergies')} placeholder="None" className="input"/></Field>
          </div>
          <Field label="Address"><textarea value={form.address} onChange={set('address')} rows={2} className="input resize-none"/></Field>
          {form.allergies && form.allergies!=='None' && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-amber-400" style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)'}}>
              <AlertTriangle className="w-3.5 h-3.5"/>Allergy alert: {form.allergies}
            </div>
          )}
          <button type="submit" disabled={saving} className="btn-teal flex items-center gap-2">
            {saving?<><Spinner size="sm" color="white"/>Saving…</>:<><Save className="w-4 h-4"/>Save Changes</>}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-4">Security</p>
        <form onSubmit={handlePw} className="space-y-3 max-w-sm">
          <Field label="Current Password"><input type="password" required value={pwForm.old_password} onChange={setPw('old_password')} className="input"/></Field>
          <Field label="New Password" hint="Minimum 8 characters"><input type="password" required value={pwForm.new_password} onChange={setPw('new_password')} placeholder="Min 8 chars" className="input"/></Field>
          <Field label="Confirm Password"><input type="password" required value={pwForm.confirm} onChange={setPw('confirm')} className="input"/></Field>
          <button type="submit" disabled={pwSaving} className="btn-outline flex items-center gap-2">
            {pwSaving?<><Spinner size="sm"/>Changing…</>:<><Lock className="w-4 h-4"/>Change Password</>}
          </button>
        </form>
      </div>
    </div>
  )
}
