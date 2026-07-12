import { useState } from "react"
import { Menu } from "lucide-react"
import PatientModal from "./PatientModal"

export default function Topbar({ search, setSearch, onMenuClick }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="h-16 bg-white border-b px-4 sm:px-6 flex items-center gap-3">

      <button
        onClick={onMenuClick}
        className="md:hidden text-gray-600 hover:text-gray-900 shrink-0"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      <input
        type="text"
        placeholder="Search patients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-xl px-4 py-2 flex-1 max-w-80 min-w-0"
      />

      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-3 sm:px-5 py-2 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shrink-0 whitespace-nowrap ml-auto"
      >
        <span className="sm:hidden">+ Add</span>
        <span className="hidden sm:inline">+ Add Patient</span>
      </button>

      <PatientModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => {}}
      />

    </div>
  )
}
