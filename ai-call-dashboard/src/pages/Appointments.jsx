import { useData } from "../context/DataContext"

const STATUS_COLOR = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  rescheduled: "bg-purple-100 text-purple-700",
  no_show: "bg-orange-100 text-orange-700",
}

const CONFIRMATION_COLOR = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  declined: "bg-red-100 text-red-700",
  unreachable: "bg-gray-100 text-gray-600",
}

function Badge({ value, colorMap }) {
  const cls = colorMap[value] || "bg-gray-100 text-gray-700"
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {value || "—"}
    </span>
  )
}

const thCls = "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap"
const tdCls = "px-4 py-4 align-middle text-sm text-gray-700 whitespace-nowrap"

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

  // Sorted by id so this list lines up with the Calls page.
  const sortedAppointments = [...appointments].sort((a, b) =>
    (a.appointment_id || "").localeCompare(b.appointment_id || "")
  )

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
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left bg-gray-50 border-b border-gray-200">
                  <th className={thCls}>Appointment ID</th>
                  <th className={thCls}>Patient ID</th>
                  <th className={thCls}>Doctor</th>
                  <th className={thCls}>Department</th>
                  <th className={thCls}>Procedure</th>
                  <th className={thCls}>Date</th>
                  <th className={thCls}>Time</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Confirmation</th>
                  <th className={thCls}>Clinic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedAppointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className={`${tdCls} font-medium text-gray-900`}>{apt.appointment_id || "—"}</td>
                    <td className={tdCls}>{apt.patient_id || "—"}</td>
                    <td className={tdCls}>{apt.doctor_name || "—"}</td>
                    <td className={tdCls}>{apt.department || "—"}</td>
                    <td className={`${tdCls} whitespace-normal`}>{apt.procedure || "—"}</td>
                    <td className={tdCls}>{apt.appointment_date || "—"}</td>
                    <td className={tdCls}>{apt.appointment_time || "—"}</td>
                    <td className={tdCls}><Badge value={apt.status} colorMap={STATUS_COLOR} /></td>
                    <td className={tdCls}><Badge value={apt.confirmation_status} colorMap={CONFIRMATION_COLOR} /></td>
                    <td className={tdCls}>{apt.clinic || "—"}</td>
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
