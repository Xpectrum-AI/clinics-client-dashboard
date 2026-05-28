import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Phone,
  Calendar,
  X,
} from "lucide-react"

const NAV = [
  { to: "/",              label: "Dashboard",    Icon: LayoutDashboard },
  { to: "/patients",      label: "Patients",     Icon: Users },
  { to: "/calls",         label: "Calls",        Icon: Phone },
  { to: "/appointments",  label: "Appointments", Icon: Calendar },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* backdrop, mobile only */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r p-5 transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">AI Clinic</h1>
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-800"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="space-y-3">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
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
      </aside>
    </>
  )
}
