import { useState } from "react"
import { useData } from "../context/DataContext"
import { formatDateTime } from "../lib/dates"
import AddCallForm from "../components/AddCallForm"

const STATUS_COLOR = {
  completed: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  pending:   "bg-yellow-100 text-yellow-700",
  failed:    "bg-red-100 text-red-700",
}

function StatusBadge({ status }) {
  const cls = STATUS_COLOR[status] || "bg-gray-100 text-gray-700"
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${cls}`}>
      {status || "—"}
    </span>
  )
}

export default function Calls() {
  const { calls, loading, errors, triggerCall } = useData()
  const [showAddForm, setShowAddForm] = useState(false)
  const [triggeringId, setTriggeringId] = useState(null)

  const handleTriggerCall = async (callId) => {
    setTriggeringId(callId)
    const result = await triggerCall(callId)
    setTriggeringId(null)
    if (!result.success) {
      alert(`Failed to trigger call: ${result.error}`)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Calls {!loading.calls && `(${calls.length})`}
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            + Add Call
          </button>
        </div>

        {errors.calls && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm mb-4">
            Failed to load: {errors.calls}
          </div>
        )}

        {loading.calls ? (
          <p className="text-gray-500">Loading…</p>
        ) : calls.length === 0 ? (
          <p className="text-gray-500">No calls yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3">Purpose</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Next Run</th>
                  <th>Status</th>
                  <th>Retries</th>
                  <th>Last Attempt</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((c) => (
                  <tr key={c._id} className="border-b">
                    <td className="py-4">{c.purpose || "—"}</td>
                    <td>{c.patient_id || "—"}</td>
                    <td>{c.type || "—"}</td>
                    <td>{formatDateTime(c.next_run_at) || "—"}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>{c.retry_count ?? 0}</td>
                    <td>{formatDateTime(c.last_attempt_at)}</td>
                    <td>
                      <button
                        onClick={() => handleTriggerCall(c.call_id)}
                        disabled={triggeringId === c.call_id}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {triggeringId === c.call_id ? "Triggering..." : "Trigger"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddForm && (
        <AddCallForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
          }}
        />
      )}
    </>
  )
}
