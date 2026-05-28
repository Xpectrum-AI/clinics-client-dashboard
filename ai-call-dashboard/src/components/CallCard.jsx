import { formatTime } from "../lib/dates"

export default function CallCard({ call, patient }) {
  if (!call) return null

  const displayName = patient?.name || call.patient_id || "Unknown"

  return (
    <div className="border rounded-2xl p-4 flex justify-between items-center">

      <div>
        <h3 className="font-semibold text-lg">
          {displayName}
        </h3>

        <p className="text-gray-500">
          {call.purpose || call.type || "—"}
        </p>

        <p className="text-sm text-blue-600 mt-1">
          {formatTime(call.scheduled_for)}
        </p>
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors">
        Start Call
      </button>

    </div>
  )
}
