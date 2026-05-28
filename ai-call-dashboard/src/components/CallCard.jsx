import { formatTime } from "../lib/dates"

export default function CallCard({ call, patient }) {
  if (!call) return null

  const displayName = patient?.name || call.patient_id || "Unknown"

  return (
    <div className="border rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

      <div>
        <h3 className="font-semibold text-lg">
          {displayName}
        </h3>

        <p className="text-gray-500">
          {call.purpose || call.type || "—"}
        </p>

        <p className="text-sm text-blue-600 mt-1">
          {call.next_run_at ? formatTime(call.next_run_at) : "Not scheduled"}
        </p>
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors w-full sm:w-auto shrink-0">
        Start Call
      </button>

    </div>
  )
}
