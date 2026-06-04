// Keeps a call's linked appointment consistent with the call's `type`.
//
// When a call's type is set (on create) or changed (on update), the appointment
// it points at (`appointment_id`) is updated to match, so the two collections
// never drift apart. This is the single source of truth for that mapping — the
// dashboard UI mirrors it for display only (see EditCallForm / AddCallForm).
//
// A `null` entry means "leave the appointment untouched".

export const TYPE_TO_APPOINTMENT = {
  confirm:     { status: "scheduled",   confirmation_status: "confirmed" },
  rescheduled: { status: "rescheduled", confirmation_status: "pending" },
  cancelled:   { status: "cancelled",   confirmation_status: "declined" },
  no_show:     { status: "no_show",     confirmation_status: "declined" },
  followup:    { status: "completed" }, // confirmation_status intentionally left as-is
  inactive:    null,                    // parked call — no appointment change
}

// Update the appointment linked to a call so it reflects the call's type.
// Returns a small summary (or null when nothing was changed) for the API response.
export async function syncAppointmentForCallType(db, appointment_id, type) {
  if (!appointment_id || !type) return null

  const mapping = TYPE_TO_APPOINTMENT[type]
  if (!mapping) return null // inactive / unknown type -> leave appointment alone

  const set = { ...mapping, updated_at: new Date().toISOString() }
  const result = await db
    .collection("appointments")
    .updateOne({ appointment_id }, { $set: set })

  return { appointment_id, matched: result.matchedCount, ...set }
}
