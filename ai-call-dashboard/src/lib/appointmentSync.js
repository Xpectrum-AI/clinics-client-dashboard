// Display-only mirror of the server-side call-type -> appointment mapping.
// Source of truth lives in api/_lib/appointment-sync.js; this exists so the
// Add/Edit Call forms can preview what changing a call's type will do to the
// linked appointment. Keep the two in sync.

export const TYPE_TO_APPOINTMENT = {
  confirm:     { status: "scheduled",   confirmation_status: "confirmed" },
  rescheduled: { status: "rescheduled", confirmation_status: "pending" },
  cancelled:   { status: "cancelled",   confirmation_status: "declined" },
  no_show:     { status: "no_show",     confirmation_status: "declined" },
  followup:    { status: "completed" }, // confirmation_status unchanged
  inactive:    null,                    // no appointment change
}

// Human-readable description of the appointment effect for a given call type.
export function appointmentEffect(type) {
  const m = TYPE_TO_APPOINTMENT[type]
  if (!m) return "No change to the linked appointment."
  const parts = []
  if (m.status) parts.push(`status → ${m.status}`)
  if (m.confirmation_status) parts.push(`confirmation → ${m.confirmation_status}`)
  return `Linked appointment: ${parts.join(", ")}.`
}
