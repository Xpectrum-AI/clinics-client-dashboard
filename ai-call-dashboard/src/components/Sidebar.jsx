import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Phone,
  Calendar,
} from "lucide-react"

const NAV = [
  { to: "/",              label: "Dashboard",    Icon: LayoutDashboard },
  { to: "/patients",      label: "Patients",     Icon: Users },
  { to: "/calls",         label: "Calls",        Icon: Phone },
  { to: "/appointments",  label: "Appointments", Icon: Calendar },
]

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r p-5">

      <h1 className="text-2xl font-bold mb-8">
        AI Clinic
      </h1>

      <nav className="space-y-3">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-xl cursor-pointer ${
                isActive ? "bg-blue-100" : "hover:bg-gray-100"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
