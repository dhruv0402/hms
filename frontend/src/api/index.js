import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refresh}` },
          })
          localStorage.setItem('access_token', data.access_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  login:          (d) => api.post('/auth/login', d),
  register:       (d) => api.post('/auth/register', d),
  me:             ()  => api.get('/auth/me'),
  changePassword: (d) => api.put('/auth/change-password', d),
}

// ── Appointments ─────────────────────────────────────────────
export const appointmentsAPI = {
  list:           (p) => api.get('/appointments', { params: p }),
  get:            (id) => api.get(`/appointments/${id}`),
  book:           (d) => api.post('/appointments', d),
  update:         (id, d) => api.put(`/appointments/${id}`, d),
  todaySchedule:  ()  => api.get('/appointments/today/schedule'),
  availableSlots: (p) => api.get('/appointments/available-slots', { params: p }),
}

// ── Patients ─────────────────────────────────────────────────
export const patientsAPI = {
  list:       (p) => api.get('/patients', { params: p }),
  get:        (id) => api.get(`/patients/${id}`),
  update:     (id, d) => api.put(`/patients/${id}`, d),
  getHistory: (id) => api.get(`/patients/${id}/history`),
  addHistory: (id, d) => api.post(`/patients/${id}/history`, d),
}

// ── Doctors ──────────────────────────────────────────────────
export const doctorsAPI = {
  list:   (p) => api.get('/doctors', { params: p }),
  get:    (id) => api.get(`/doctors/${id}`),
  create: (d)  => api.post('/doctors', d),
  addSlot:(id,d) => api.post(`/doctors/${id}/slots`, d),
}

// ── Billing ──────────────────────────────────────────────────
export const billingAPI = {
  list:   (p) => api.get('/billing', { params: p }),
  get:    (id) => api.get(`/billing/${id}`),
  create: (d)  => api.post('/billing', d),
  update: (id,d) => api.put(`/billing/${id}`, d),
}

// ── Prescriptions ─────────────────────────────────────────────
export const prescriptionsAPI = {
  getByAppt: (id) => api.get(`/prescriptions/appointment/${id}`),
  create:    (d)  => api.post('/prescriptions', d),
}

// ── Departments ──────────────────────────────────────────────
export const departmentsAPI = {
  list: () => api.get('/departments'),
}

// ── Admin ────────────────────────────────────────────────────
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  users:     () => api.get('/admin/users'),
  toggleUser:(id) => api.put(`/admin/users/${id}/toggle`),
  auditLog:  () => api.get('/admin/audit-log'),
}

// ── Pharmacy ─────────────────────────────────────────────────
export const pharmacyAPI = {
  listMedicines: (p) => api.get('/pharmacy/medicines', { params: p }),
  addMedicine:    (d) => api.post('/pharmacy/medicines', d),
  updateMedicine: (id, d) => api.put(`/pharmacy/medicines/${id}`, d),
  recordTransaction: (d) => api.post('/pharmacy/transactions', d),
}

// ── AI Smart Features ──────────────────────────────────────────
export const aiAPI = {
  predictDepartment: (symptoms) => api.post('/chat/suggest-department', { symptoms }),
}

export default api
