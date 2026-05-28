import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function Layout() {
  const [search, setSearch] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          search={search}
          setSearch={setSearch}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="p-4 sm:p-6 space-y-6 overflow-auto">
          <Outlet context={{ search }} />
        </div>
      </div>
    </div>
  )
}
