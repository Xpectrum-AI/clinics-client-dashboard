import { createContext, useContext, useState, useEffect } from "react"

const DataContext = createContext()

export function DataProvider({ children }) {
  const [calls, setCalls] = useState([])
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState({ calls: true, patients: true, appointments: true })
  const [errors, setErrors] = useState({})

  const fetchCalls = async () => {
    setLoading(prev => ({ ...prev, calls: true }))
    try {
      const res = await fetch("/api/calls")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setCalls(data)
      setErrors(prev => ({ ...prev, calls: null }))
    } catch (err) {
      setErrors(prev => ({ ...prev, calls: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, calls: false }))
    }
  }

  const fetchPatients = async () => {
    setLoading(prev => ({ ...prev, patients: true }))
    try {
      const res = await fetch("/api/patients")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setPatients(data)
      setErrors(prev => ({ ...prev, patients: null }))
    } catch (err) {
      setErrors(prev => ({ ...prev, patients: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, patients: false }))
    }
  }

  const fetchAppointments = async () => {
    setLoading(prev => ({ ...prev, appointments: true }))
    try {
      const res = await fetch("/api/appointments")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setAppointments(data)
      setErrors(prev => ({ ...prev, appointments: null }))
    } catch (err) {
      setErrors(prev => ({ ...prev, appointments: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, appointments: false }))
    }
  }

  const triggerCall = async (callId) => {
    try {
      const res = await fetch(`/api/calls/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_id: callId })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchCalls() // Refresh calls after triggering
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const updateCall = async (callId, type) => {
    try {
      const res = await fetch("/api/calls/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_id: callId, type })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      // Refresh both: the call's type changed and its linked appointment was synced.
      await Promise.all([fetchCalls(), fetchAppointments()])
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const createCall = async (callData) => {
    try {
      const res = await fetch("/api/calls/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(callData)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const newCall = await res.json()
      // Refresh both: a new call also synced its linked appointment.
      await Promise.all([fetchCalls(), fetchAppointments()])
      return { success: true, data: newCall }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    fetchCalls()
    fetchPatients()
    fetchAppointments()
  }, [])

  return (
    <DataContext.Provider
      value={{
        calls,
        patients,
        appointments,
        loading,
        errors,
        fetchCalls,
        fetchPatients,
        fetchAppointments,
        triggerCall,
        createCall,
        updateCall,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within DataProvider")
  }
  return context
}
