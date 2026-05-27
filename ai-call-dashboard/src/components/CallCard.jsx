import { useState } from "react"

const SCENARIOS = [
  { value: "confirm",    label: "Confirm Appointment" },
  { value: "reschedule", label: "Reschedule" },
  { value: "cancel",     label: "Cancelled" },
  { value: "noshow",     label: "No-show" },
  { value: "followup",   label: "Follow-up" },
  { value: "callback",   label: "Callback" },
  { value: "lapsed",     label: "Lapsed Patient" },
]

export default function CallCard() {
  const [scenario, setScenario] = useState("confirm")

  return (
    <div className="border rounded-2xl p-4 flex justify-between items-center">

      <div>
        <h3 className="font-semibold text-lg">
          Rahul Sharma
        </h3>

        <p className="text-gray-500">
          Extraction Follow-Up
        </p>

        <p className="text-sm text-blue-600 mt-1">
          2:30 PM
        </p>
      </div>

      <div className="flex items-center gap-2">

        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          className="border rounded-xl px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SCENARIOS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl">
          Start Call
        </button>

        <button className="border px-4 py-2 rounded-xl">
          Reschedule
        </button>

      </div>

    </div>
  )
}
