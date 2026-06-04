import { useState } from "react"
import { Pencil } from "lucide-react"
import PatientModal from "./PatientModal"

const STATUS_COLOR = {
  active:   "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  lapsed:   "bg-orange-100 text-orange-700",
}

function StatusBadge({ status }) {
  if (!status) return <span className="text-gray-400">—</span>
  const cls = STATUS_COLOR[status] || "bg-gray-100 text-gray-700"
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

const thCls = "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap"
const tdCls = "px-4 py-4 align-middle text-sm text-gray-700"

export default function PatientTable({ patients = [] }) {
  const [editing, setEditing] = useState(null)

  if (patients.length === 0) {
    return (
      <p className="text-gray-500 py-4">No patients to show.</p>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-160 border-collapse">

        <thead>
          <tr className="text-left bg-gray-50 border-b border-gray-200">
            <th className={thCls}>Name</th>
            <th className={thCls}>Phone</th>
            <th className={thCls}>DOB</th>
            <th className={thCls}>Age</th>
            <th className={thCls}>Status</th>
            <th className={thCls}>Notes</th>
            <th className={`${thCls} w-10`}></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {patients.map((p) => (
            <tr key={p._id} className="hover:bg-gray-50/70 transition-colors">
              <td className={`${tdCls} font-medium text-gray-900`}>{p.name || "—"}</td>
              <td className={tdCls}>{p.phone || "—"}</td>
              <td className={tdCls}>{p.date_of_birth || "—"}</td>
              <td className={tdCls}>{p.age ?? "—"}</td>
              <td className={tdCls}><StatusBadge status={p.status} /></td>
              <td className={tdCls}>{p.notes || "—"}</td>
              <td className={tdCls}>
                <button
                  onClick={() => setEditing(p)}
                  title="Edit patient"
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                >
                  <Pencil size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
      </div>

      <PatientModal
        open={Boolean(editing)}
        patient={editing}
        onClose={() => setEditing(null)}
        onSaved={() => window.location.reload()}
      />
    </>
  )
}
