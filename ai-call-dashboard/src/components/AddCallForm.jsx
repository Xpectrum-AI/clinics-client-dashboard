import { useState } from "react"
import { useData } from "../context/DataContext"

const EMPTY = {
  patient_id: "",
  appointment_id: "",
  type: "confirm",
  purpose: "",
  scheduled_for: "",
  next_run_at: "",
  prompt: ""
}

export default function AddCallForm({ onClose, onSuccess }) {
  const { patients, appointments, createCall, loading } = useData()
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // Filter appointments for selected patient
  const filteredAppointments = form.patient_id
    ? appointments.filter(apt => apt.patient_id === form.patient_id)
    : []

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    
    try {
      const payload = {
        patient_id: form.patient_id,
        appointment_id: form.appointment_id,
        type: form.type,
        purpose: form.purpose,
        scheduled_for: form.scheduled_for,
        next_run_at: form.next_run_at || null,
        status: "scheduled",
        retry_count: 0,
        metadata: { prompt: form.prompt || "" }
      }

      const result = await createCall(payload)
      
      if (result.success) {
        onSuccess?.()
        onClose()
      } else {
        throw new Error(result.error || "Failed to create call")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    "border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Add New Call</h2>

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Patient *</label>
              <select value={form.patient_id} onChange={set("patient_id")} required className={inputCls} disabled={loading.patients}>
                <option value="">{loading.patients ? "Loading..." : "Select Patient"}</option>
                {patients.map(p => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.first_name} {p.last_name} — {p.phone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Appointment *</label>
              <select value={form.appointment_id} onChange={set("appointment_id")} required disabled={!form.patient_id || loading.appointments} className={inputCls}>
                <option value="">{!form.patient_id ? "Select patient first" : loading.appointments ? "Loading..." : "Select Appointment"}</option>
                {filteredAppointments.map(apt => (
                  <option key={apt.appointment_id} value={apt.appointment_id}>
                    {apt.procedure} — {apt.appointment_date}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Call Type *</label>
              <select value={form.type} onChange={set("type")} required className={inputCls}>
                <option value="confirm">Confirm</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
                <option value="followup">Follow-up</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Purpose *</label>
              <input type="text" value={form.purpose} onChange={set("purpose")} required placeholder="e.g., Post Extraction Follow-Up" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Scheduled For *</label>
              <input type="datetime-local" value={form.scheduled_for} onChange={set("scheduled_for")} required className={inputCls} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Next Run At</label>
              <input type="datetime-local" value={form.next_run_at} onChange={set("next_run_at")} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Notes</label>
            <textarea value={form.prompt} onChange={set("prompt")} rows={2} placeholder="Ask patient about recovery status..." className={inputCls} />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="border px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving…" : "Create Call"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
