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

function Field({ label, children }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-right">{children}</span>
    </div>
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

  const triggerBtnCls =
    "bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"

  return (
    <>
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4 gap-3">
          <h2 className="text-xl font-semibold">
            Calls {!loading.calls && `(${calls.length})`}
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
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
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
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
                          className={`px-3 py-1 ${triggerBtnCls}`}
                        >
                          {triggeringId === c.call_id ? "Triggering..." : "Trigger"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {calls.map((c) => (
                <div key={c._id} className="border rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold">{c.purpose || "—"}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="space-y-1">
                    <Field label="Patient">{c.patient_id || "—"}</Field>
                    <Field label="Type">{c.type || "—"}</Field>
                    <Field label="Next Run">{formatDateTime(c.next_run_at) || "—"}</Field>
                    <Field label="Retries">{c.retry_count ?? 0}</Field>
                    <Field label="Last Attempt">{formatDateTime(c.last_attempt_at) || "—"}</Field>
                  </div>
                  <button
                    onClick={() => handleTriggerCall(c.call_id)}
                    disabled={triggeringId === c.call_id}
                    className={`w-full px-3 py-2 ${triggerBtnCls}`}
                  >
                    {triggeringId === c.call_id ? "Triggering..." : "Trigger"}
                  </button>
                </div>
              ))}
            </div>
          </>
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
