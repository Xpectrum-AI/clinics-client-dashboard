import { useState } from "react"
import { Pencil } from "lucide-react"
import PatientModal from "./PatientModal"

export default function PatientTable({ patients = [] }) {
  const [editing, setEditing] = useState(null)

  if (patients.length === 0) {
    return (
      <p className="text-gray-500 py-4">No patients to show.</p>
    )
  }

  return (
    <>
      <table className="w-full">

        <thead>
          <tr className="text-left border-b">
            <th className="py-3">Name</th>
            <th>Phone</th>
            <th>Age</th>
            <th>Status</th>
            <th>Notes</th>
            <th className="w-10"></th>
          </tr>
        </thead>

        <tbody>
          {patients.map((p) => (
            <tr key={p._id} className="border-b">
              <td className="py-4">{p.name || "—"}</td>
              <td>{p.phone || "—"}</td>
              <td>{p.age ?? "—"}</td>
              <td>{p.status || "—"}</td>
              <td>{p.notes || "—"}</td>
              <td>
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

      <PatientModal
        open={Boolean(editing)}
        patient={editing}
        onClose={() => setEditing(null)}
        onSaved={() => window.location.reload()}
      />
    </>
  )
}
