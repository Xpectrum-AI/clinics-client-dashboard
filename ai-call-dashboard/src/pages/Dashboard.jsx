import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import StatCard from "../components/StatCard"
import PatientTable from "../components/PatientTable"
import CallCard from "../components/CallCard"

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <div className="p-6 space-y-6 overflow-auto">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard title="Patients" value="1,248" />
            <StatCard title="Today's Calls" value="42" />
            <StatCard title="Pending" value="11" />
            <StatCard title="Completed" value="31" />
          </div>

          {/* Scheduled Calls */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              Today's Scheduled Calls
            </h2>

            <div className="space-y-4">
              <CallCard />
              <CallCard />
              <CallCard />
            </div>
          </div>

          {/* Patients */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              Recent Patients
            </h2>

            <PatientTable />
          </div>

        </div>
      </div>
    </div>
  )
}
