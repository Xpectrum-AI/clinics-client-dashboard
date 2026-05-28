import { useData } from "../context/DataContext"

const STATUS_COLOR = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
}

const CONFIRMATION_COLOR = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  declined: "bg-red-100 text-red-700",
}

function Badge({ value, colorMap }) {
  const cls = colorMap[value] || "bg-gray-100 text-gray-700"
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${cls}`}>
      {value || "—"}
    </span>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  )
}

export default function Appointments() {
  const { appointments, loading, errors } = useData()

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        Appointments {!loading.appointments && `(${appointments.length})`}
      </h2>

      {errors.appointments && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm mb-4">
          Failed to load: {errors.appointments}
        </div>
      )}

      {loading.appointments ? (
        <p className="text-gray-500">Loading…</p>
      ) : appointments.length === 0 ? (
        <p className="text-gray-500">No appointments yet.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3">Appointment ID</th>
                  <th>Patient ID</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Procedure</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Confirmation</th>
                  <th>Clinic</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt._id} className="border-b">
                    <td className="py-4">{apt.appointment_id || "—"}</td>
                    <td>{apt.patient_id || "—"}</td>
                    <td>{apt.doctor_name || "—"}</td>
                    <td>{apt.department || "—"}</td>
                    <td>{apt.procedure || "—"}</td>
                    <td>{apt.appointment_date || "—"}</td>
                    <td>{apt.appointment_time || "—"}</td>
                    <td><Badge value={apt.status} colorMap={STATUS_COLOR} /></td>
                    <td><Badge value={apt.confirmation_status} colorMap={CONFIRMATION_COLOR} /></td>
                    <td>{apt.clinic || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {appointments.map((apt) => (
              <div key={apt._id} className="border rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold">{apt.procedure || apt.appointment_id || "—"}</h3>
                  <Badge value={apt.status} colorMap={STATUS_COLOR} />
                </div>
                <div className="space-y-1">
                  <Field label="Appointment">{apt.appointment_id || "—"}</Field>
                  <Field label="Patient">{apt.patient_id || "—"}</Field>
                  <Field label="Doctor">{apt.doctor_name || "—"}</Field>
                  <Field label="Department">{apt.department || "—"}</Field>
                  <Field label="Date">
                    {[apt.appointment_date, apt.appointment_time].filter(Boolean).join(" ") || "—"}
                  </Field>
                  <Field label="Clinic">{apt.clinic || "—"}</Field>
                  <Field label="Confirmation">
                    <Badge value={apt.confirmation_status} colorMap={CONFIRMATION_COLOR} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
