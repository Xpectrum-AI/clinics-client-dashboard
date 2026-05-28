import { useState } from "react"
import PatientModal from "./PatientModal"

export default function Topbar({ search, setSearch }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="h-16 bg-white border-b px-6 flex items-center justify-between">

      <input
        type="text"
        placeholder="Search patients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-xl px-4 py-2 w-80"
      />

      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        + Add Patient
      </button>

      <PatientModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => window.location.reload()}
      />

    </div>
  )
}
