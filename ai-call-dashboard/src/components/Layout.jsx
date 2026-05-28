import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function Layout() {
  const [search, setSearch] = useState("")

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar search={search} setSearch={setSearch} />
        <div className="p-6 space-y-6 overflow-auto">
          <Outlet context={{ search }} />
        </div>
      </div>
    </div>
  )
}
