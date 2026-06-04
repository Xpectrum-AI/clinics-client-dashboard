// Display-only mirror of the server-side call-type mapping.
// Source of truth lives in api/_lib/appointment-sync.js; this exists so the
// Add/Edit Call forms can preview what a chosen call type will do (purpose,
// linked appointment status/confirmation, and the appointment's timing).
// Keep the two in sync.

export const CALL_TYPE_CONFIG = {
  confirm:     { purpose: "Appointment Confirmation",      status: "scheduled",   confirmation_status: "confirmed", when: "always 2 days from now" },
  rescheduled: { purpose: "Appointment Reschedule",        status: "rescheduled", confirmation_status: "pending",   when: "always 2 days from now" },
  cancelled:   { purpose: "Appointment Cancellation",      status: "cancelled",   confirmation_status: "declined",  when: "always 2 days from now" },
  no_show:     { purpose: "Missed Appointment Follow-Up",  status: "no_show",     confirmation_status: "declined",  when: "always 2 days ago" },
  followup:    { purpose: "Post-Appointment Follow-Up",    status: "completed",                                     when: "always 2 days ago" },
  inactive:    { purpose: "Inactive Patient Reactivation",                                                          when: "always 6 months ago" },
}

// Standard purpose label for a call of this type.
export function purposeForType(type) {
  return CALL_TYPE_CONFIG[type]?.purpose || ""
}

// Human-readable description of what choosing this type does to the appointment.
export function appointmentEffect(type) {
  const cfg = CALL_TYPE_CONFIG[type]
  if (!cfg) return "No change to the linked appointment."
  const parts = []
  if (cfg.status) parts.push(`status → ${cfg.status}`)
  if (cfg.confirmation_status) parts.push(`confirmation → ${cfg.confirmation_status}`)
  if (cfg.when) parts.push(`date → ${cfg.when}`)
  return parts.length
    ? `Linked appointment: ${parts.join(", ")}.`
    : "No change to the linked appointment."
}
