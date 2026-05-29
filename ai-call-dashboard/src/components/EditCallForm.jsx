import { useState } from "react"
import { useData } from "../context/DataContext"

const TYPE_OPTIONS = [
  { value: "confirm", label: "Confirm" },
  { value: "rescheduled", label: "Rescheduled" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
  { value: "followup", label: "Follow-up" },
  { value: "inactive", label: "Inactive" },
]

export default function EditCallForm({ call, onClose, onSuccess }) {
  const { updateCall } = useData()
  const [type, setType] = useState(call?.type || "confirm")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const result = await updateCall(call.call_id, type)
    setSubmitting(false)

    if (result.success) {
      onSuccess?.()
      onClose()
    } else {
      setError(result.error || "Failed to update call")
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
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-1">Edit Call</h2>
        <p className="text-sm text-gray-500 mb-4">{call?.purpose || call?.call_id}</p>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Call Type *</label>
            <select value={type} onChange={(e) => setType(e.target.value)} required className={inputCls}>
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
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
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
