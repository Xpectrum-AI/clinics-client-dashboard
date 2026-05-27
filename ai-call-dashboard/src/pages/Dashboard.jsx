import StatCard from "../components/StatCard"
import PatientTable from "../components/PatientTable"
import CallCard from "../components/CallCard"
import { isToday } from "../lib/dates"
import { useApi } from "../hooks/useApi"

export default function Dashboard() {
  const { data, loading, error } = useApi("/api/patients")
  const patients = data ?? []

  const total = patients.length
  const todays = patients.filter((p) => isToday(p.scheduled_at))
  const pending = patients.filter((p) =>
    ["booked", "reschedule_requested"].includes(p.status)
  ).length
  const completed = patients.filter((p) => p.status === "completed").length

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          Failed to load data: {error}. Check the terminal where you ran <code>npm run dev</code> for the actual server error.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Patients" value={loading ? "…" : total} />
        <StatCard title="Today's Calls" value={loading ? "…" : todays.length} />
        <StatCard title="Pending" value={loading ? "…" : pending} />
        <StatCard title="Completed" value={loading ? "…" : completed} />
      </div>

      {/* Scheduled Calls */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Today's Scheduled Calls
        </h2>

        <div className="space-y-4">
          {loading && <p className="text-gray-500">Loading…</p>}
          {!loading && todays.length === 0 && (
            <p className="text-gray-500">No calls scheduled for today.</p>
          )}
          {todays.map((p) => (
            <CallCard key={p._id} patient={p} />
          ))}
        </div>
      </div>

      {/* Patients */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Recent Patients
        </h2>

        <PatientTable patients={patients} />
      </div>
    </>
  )
}
