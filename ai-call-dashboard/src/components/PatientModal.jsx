import { useState, useEffect } from "react"
import { useData } from "../context/DataContext"

const EMPTY = {
  first_name: "",
  last_name: "",
  phone: "",
  age: "",
  date_of_birth: "",
  gender: "",
  patient_status: "active",
  notes: "",
  call_from: "",
  call_to: "",
}

function fromPatient(p) {
  if (!p) return EMPTY
  return {
    first_name: p.first_name || "",
    last_name: p.last_name || "",
    phone: p.phone || "",
    age: p.age ?? "",
    date_of_birth: p.date_of_birth || "",
    gender: p.gender || "",
    patient_status: p.status || "active",
    notes: p.notes || "",
    call_from: p.preferred_call_time?.from || "",
    call_to: p.preferred_call_time?.to || "",
  }
}

export default function PatientModal({ open, onClose, onSaved, patient }) {
  const { fetchPatients } = useData()
  const isEdit = Boolean(patient)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setForm(fromPatient(patient))
      setError(null)
    }
  }, [open, patient])

  if (!open) return null

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        age: form.age,
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        patient_status: form.patient_status,
        notes: form.notes,
        preferred_call_time:
          form.call_from || form.call_to
            ? { from: form.call_from, to: form.call_to }
            : null,
      }
      if (isEdit) payload.patient_id = patient.patient_id

      const res = await fetch("/api/patients", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      await fetchPatients()
      onSaved?.()
      onClose()
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
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Patient" : "Add Patient"}
        </h2>

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">First name *</label>
              <input className={inputCls} value={form.first_name} onChange={set("first_name")} required />
            </div>
            <div>
              <label className="text-sm text-gray-600">Last name</label>
              <input className={inputCls} value={form.last_name} onChange={set("last_name")} />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Phone *</label>
            <input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="+91..." required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Date of birth</label>
              <input type="date" className={inputCls} value={form.date_of_birth} onChange={set("date_of_birth")} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Age</label>
              <input type="number" min="0" className={inputCls} value={form.age} onChange={set("age")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Gender</label>
              <select className={inputCls} value={form.gender} onChange={set("gender")}>
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <select className={inputCls} value={form.patient_status} onChange={set("patient_status")}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="lapsed">Lapsed</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Preferred call</label>
              <div className="flex items-center gap-1 min-w-0">
                <input type="time" className="border rounded-xl px-2 py-2 w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.call_from} onChange={set("call_from")} />
                <span className="text-gray-400 flex-shrink-0">–</span>
                <input type="time" className="border rounded-xl px-2 py-2 w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.call_to} onChange={set("call_to")} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Notes</label>
            <textarea className={inputCls} rows={2} value={form.notes} onChange={set("notes")} />
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
              {submitting ? "Saving…" : isEdit ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
