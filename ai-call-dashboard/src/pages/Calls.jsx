import { useApi } from "../hooks/useApi"
import { formatDateTime } from "../lib/dates"

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
  const { data, loading, error } = useApi("/api/calls")
  const calls = data ?? []

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        Calls {!loading && `(${calls.length})`}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm mb-4">
          Failed to load: {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : calls.length === 0 ? (
        <p className="text-gray-500">No calls yet.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="py-3">Purpose</th>
              <th>Patient</th>
              <th>Type</th>
              <th>Scheduled</th>
              <th>Status</th>
              <th>Retries</th>
              <th>Last Attempt</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((c) => (
              <tr key={c._id} className="border-b">
                <td className="py-4">{c.purpose || "—"}</td>
                <td>{c.patient_id || "—"}</td>
                <td>{c.type || "—"}</td>
                <td>{formatDateTime(c.scheduled_for)}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>{c.retry_count ?? 0}</td>
                <td>{formatDateTime(c.last_attempt_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
