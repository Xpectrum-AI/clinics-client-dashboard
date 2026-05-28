import { useOutletContext } from "react-router-dom"
import StatCard from "../components/StatCard"
import PatientTable from "../components/PatientTable"
import CallCard from "../components/CallCard"
import { isToday } from "../lib/dates"
import { matchesSearch } from "../lib/search"
import { useApi } from "../hooks/useApi"

export default function Dashboard() {
  const { search } = useOutletContext()
  const { data: patientsData, loading: pLoading, error: pError } = useApi("/api/patients")
  const { data: callsData, loading: cLoading, error: cError } = useApi("/api/calls")

  const patients = patientsData ?? []
  const calls = callsData ?? []
  const loading = pLoading || cLoading
  const error = pError || cError

  const visiblePatients = patients.filter((p) => matchesSearch(p, search))

  // patient_id -> patient, so calls can show real names/phones
  const patientById = Object.fromEntries(patients.map((p) => [p.patient_id, p]))

  const totalPatients = patients.length
  const todaysCalls = calls.filter((c) => isToday(c.scheduled_for))
  const pending = calls.filter((c) =>
    ["pending", "scheduled"].includes(c.status)
  ).length
  const completed = calls.filter((c) => c.status === "completed").length

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          Failed to load data: {error}. Check the terminal where you ran <code>npm run dev</code> for the actual server error.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Patients" value={loading ? "…" : totalPatients} />
        <StatCard title="Today's Calls" value={loading ? "…" : todaysCalls.length} />
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
          {!loading && todaysCalls.length === 0 && (
            <p className="text-gray-500">No calls scheduled for today.</p>
          )}
          {todaysCalls.map((c) => (
            <CallCard
              key={c._id}
              call={c}
              patient={patientById[c.patient_id]}
            />
          ))}
        </div>
      </div>

      {/* Patients */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Recent Patients
        </h2>

        <PatientTable patients={visiblePatients} />
      </div>
    </>
  )
}
