export default function PatientTable() {
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

        <tr className="border-b">
          <td className="py-4">Rahul Sharma</td>
          <td>9876543210</td>
          <td>Extraction</td>
          <td>Today 2:30 PM</td>
        </tr>

        <tr className="border-b">
          <td className="py-4">Priya Verma</td>
          <td>9876543211</td>
          <td>Implant</td>
          <td>Tomorrow 11 AM</td>
        </tr>

      </tbody>

    </table>
  )
}
