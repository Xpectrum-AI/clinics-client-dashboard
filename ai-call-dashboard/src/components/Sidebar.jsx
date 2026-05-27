import {
  LayoutDashboard,
  Users,
  Phone,
  Settings
} from "lucide-react"

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r p-5">

      <h1 className="text-2xl font-bold mb-8">
        AI Clinic
      </h1>

      <nav className="space-y-3">

        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-100">
          <LayoutDashboard size={20} />
          Dashboard
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer">
          <Users size={20} />
          Patients
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer">
          <Phone size={20} />
          Calls
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer">
          <Settings size={20} />
          Settings
        </div>

      </nav>
    </div>
  )
}
