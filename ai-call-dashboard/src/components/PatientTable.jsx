import { formatDateTime } from "../lib/dates"

export default function PatientTable({ patients = [] }) {
  if (patients.length === 0) {
    return (
      <p className="text-gray-500 py-4">No patients to show.</p>
    )
  }

  return (
    <table className="w-full">

      <thead>
        <tr className="text-left border-b">
          <th className="py-3">Name</th>
          <th>Phone</th>
          <th>Procedure</th>
          <th>Next Call</th>
        </tr>
      </thead>

      <tbody>
        {patients.map((p) => (
          <tr key={p._id} className="border-b">
            <td className="py-4">{p.name || "—"}</td>
            <td>{p.phone || "—"}</td>
            <td>{p.visit_type || "—"}</td>
            <td>{formatDateTime(p.scheduled_at)}</td>
          </tr>
        ))}
      </tbody>

    </table>
  )
}
