import { useState } from "react"
import { useData } from "../context/DataContext"
import { formatDateTime } from "../lib/dates"
import AddCallForm from "../components/AddCallForm"
import EditCallForm from "../components/EditCallForm"

const TYPE_LABEL = {
  confirm: "Confirm",
  rescheduled: "Rescheduled",
  cancelled: "Cancelled",
  no_show: "No Show",
  followup: "Follow-up",
  inactive: "Inactive",
}

const typeLabel = (t) => TYPE_LABEL[t] || t || "—"

const STATUS_COLOR = {
  completed:   "bg-green-100 text-green-700",
  scheduled:   "bg-blue-100 text-blue-700",
  pending:     "bg-yellow-100 text-yellow-700",
  failed:      "bg-red-100 text-red-700",
  cancelled:   "bg-red-100 text-red-700",
  rescheduled: "bg-purple-100 text-purple-700",
  no_show:     "bg-orange-100 text-orange-700",
}

function StatusBadge({ status }) {
  const cls = STATUS_COLOR[status] || "bg-gray-100 text-gray-700"
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status || "—"}
    </span>
  )
}

const thCls = "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500"
const tdCls = "px-4 py-4 align-middle text-sm text-gray-700"

function Field({ label, children }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  )
}

export default function Calls() {
  const { calls, patients, appointments, loading, errors, triggerCall } = useData()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCall, setEditingCall] = useState(null)
  const [triggeringId, setTriggeringId] = useState(null)

  // patient_id -> patient, for showing name & phone instead of the raw id
  const patientById = Object.fromEntries(patients.map((p) => [p.patient_id, p]))
  // appointment_id -> appointment, so each call can show the linked appointment's
  // current status next to its type (the two are kept in sync server-side).
  const apptById = Object.fromEntries(appointments.map((a) => [a.appointment_id, a]))

  // Sorted by appointment so this list lines up with the Appointments page.
  const sortedCalls = [...calls].sort((a, b) =>
    (a.appointment_id || "").localeCompare(b.appointment_id || "")
  )

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

  const editBtnCls =
    "border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm transition-colors"

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
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left bg-gray-50 border-b border-gray-200">
                    <th className={thCls}>Purpose</th>
                    <th className={thCls}>Patient</th>
                    <th className={thCls}>Type</th>
                    <th className={thCls}>Appointment</th>
                    <th className={thCls}>Next Run</th>
                    {/* <th className={thCls}>Status</th> */}
                    {/* <th className={thCls}>Retries</th> */}
                    <th className={thCls}>Last Attempt</th>
                    <th className={`${thCls} text-right`}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedCalls.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className={`${tdCls} font-medium text-gray-900`}>{c.purpose || "—"}</td>
                      <td className={tdCls}>
                        {patientById[c.patient_id] ? (
                          <div className="flex flex-col">
                            <span>{patientById[c.patient_id].name}</span>
                            <span className="text-xs text-gray-400">{patientById[c.patient_id].phone}</span>
                          </div>
                        ) : (
                          c.patient_id || "—"
                        )}
                      </td>
                      <td className={tdCls}>{typeLabel(c.type)}</td>
                      <td className={tdCls}>
                        {apptById[c.appointment_id] ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-xs text-gray-400">{c.appointment_id}</span>
                            <StatusBadge status={apptById[c.appointment_id].status} />
                          </div>
                        ) : (
                          c.appointment_id || "—"
                        )}
                      </td>
                      <td className={`${tdCls} whitespace-nowrap`}>{formatDateTime(c.next_run_at) || "—"}</td>
                      {/* <td className={tdCls}><StatusBadge status={c.status} /></td> */}
                      {/* <td className={tdCls}>{c.retry_count ?? 0}</td> */}
                      <td className={`${tdCls} whitespace-nowrap`}>{formatDateTime(c.last_attempt_at)}</td>
                      <td className={tdCls}>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingCall(c)}
                            className={`px-3 py-1.5 ${editBtnCls}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleTriggerCall(c.call_id)}
                            disabled={triggeringId === c.call_id}
                            className={`px-3 py-1.5 ${triggerBtnCls}`}
                          >
                            {triggeringId === c.call_id ? "Triggering..." : "Trigger"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {sortedCalls.map((c) => (
                <div key={c._id} className="border rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold">{c.purpose || "—"}</h3>
                    {/* <StatusBadge status={c.status} /> */}
                  </div>
                  <div className="space-y-1">
                    <Field label="Patient">
                      {patientById[c.patient_id] ? (
                        <span>
                          {patientById[c.patient_id].name}
                          <span className="text-gray-400"> · {patientById[c.patient_id].phone}</span>
                        </span>
                      ) : (
                        c.patient_id || "—"
                      )}
                    </Field>
                    <Field label="Type">{typeLabel(c.type)}</Field>
                    <Field label="Appointment">
                      {apptById[c.appointment_id] ? (
                        <span>
                          <span className="text-gray-400">{c.appointment_id} · </span>
                          <StatusBadge status={apptById[c.appointment_id].status} />
                        </span>
                      ) : (
                        c.appointment_id || "—"
                      )}
                    </Field>
                    <Field label="Next Run">{formatDateTime(c.next_run_at) || "—"}</Field>
                    {/* <Field label="Retries">{c.retry_count ?? 0}</Field> */}
                    <Field label="Last Attempt">{formatDateTime(c.last_attempt_at) || "—"}</Field>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCall(c)}
                      className={`w-full px-3 py-2 ${editBtnCls}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleTriggerCall(c.call_id)}
                      disabled={triggeringId === c.call_id}
                      className={`w-full px-3 py-2 ${triggerBtnCls}`}
                    >
                      {triggeringId === c.call_id ? "Triggering..." : "Trigger"}
                    </button>
                  </div>
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

      {editingCall && (
        <EditCallForm
          call={editingCall}
          onClose={() => setEditingCall(null)}
          onSuccess={() => setEditingCall(null)}
        />
      )}
    </>
  )
}
