import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './useAuth.jsx'
import toast from 'react-hot-toast'

export function useSocket() {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    // Connect to the same host as backend (proxy handles /socket.io)
    const socket = io('/', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      socket.emit('join', { role: user.role, user_id: user.user_id })
    })

    socket.on('new_appointment', (data) => {
      toast.success(`New appointment from ${data.patient_name}`, {
        icon: '📅',
        duration: 5000,
        position: 'top-center'
      })
    })

    socket.on('appointment_update', (data) => {
      toast.success(`Appointment status: ${data.status}`, {
        icon: '🔔',
        duration: 5000,
        position: 'top-center'
      })
    })

    socket.on('admin_update', (data) => {
      if (user.role === 'admin') {
        console.log('Admin update received:', data)
      }
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    return () => {
      socket.disconnect()
    }
  }, [user])

  return socketRef.current
}
