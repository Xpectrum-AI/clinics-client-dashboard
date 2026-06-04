// Single source of truth for how a call's `type` drives the rest of its data.
//
// A call's type determines:
//   - the call's `purpose`            (a standard label per type)
//   - the linked appointment's status / confirmation_status
//   - the linked appointment's `appointment_date` (future vs. past)
//   - the linked patient's `patient_status` (active / lapsed / inactive)
//
// Timing rule (relative to "now"):
//   confirm / rescheduled / cancelled -> appointment is in the FUTURE (+2 days)
//   no_show / followup                -> 2 days in the PAST
//   inactive                          -> 6 months in the PAST
//
// The dashboard UI mirrors this for display only (src/lib/appointmentSync.js).

export const CALL_TYPE_CONFIG = {
  confirm: {
    purpose: "Appointment Confirmation",
    appointment: { status: "scheduled", confirmation_status: "confirmed" },
    when: { days: 2 }, // future
    patient_status: "active",
  },
  rescheduled: {
    purpose: "Appointment Reschedule",
    appointment: { status: "rescheduled", confirmation_status: "pending" },
    when: { days: 2 }, // future
    patient_status: "active",
  },
  cancelled: {
    purpose: "Appointment Cancellation",
    appointment: { status: "cancelled", confirmation_status: "declined" },
    when: { days: 2 }, // future
    patient_status: "lapsed",
  },
  no_show: {
    purpose: "Missed Appointment Follow-Up",
    appointment: { status: "no_show", confirmation_status: "declined" },
    when: { days: -2 }, // past
    patient_status: "lapsed",
  },
  followup: {
    purpose: "Post-Appointment Follow-Up",
    appointment: { status: "completed" }, // confirmation_status left as-is
    when: { days: -2 }, // past
    patient_status: "active",
  },
  inactive: {
    purpose: "Inactive Patient Reactivation",
    appointment: null, // status/confirmation left as-is
    when: { months: -6 }, // long past
    patient_status: "inactive",
  },
}

// Standard purpose label for a call of this type ("" for unknown types).
export function purposeForType(type) {
  return CALL_TYPE_CONFIG[type]?.purpose || ""
}

// The relative timing rule for a type, e.g. { days: -2 } or { months: -6 }.
// Stored on the appointment so the date can be recomputed on every read
// (dynamic-on-read) and never goes stale. Returns null for unknown types.
export function dateRuleForType(type) {
  return CALL_TYPE_CONFIG[type]?.when || null
}

// Apply an offset rule to a base date (default: now) -> "YYYY-MM-DD".
export function dateFromRule(rule, base) {
  if (!rule) return null
  const d = base ? new Date(base) : new Date()
  if (rule.days) d.setDate(d.getDate() + rule.days)
  if (rule.months) d.setMonth(d.getMonth() + rule.months)
  return d.toISOString().slice(0, 10)
}

// The appointment_date (YYYY-MM-DD) implied by a type's timing rule, computed
// relative to now. Returns null for unknown types.
export function appointmentDateForType(type) {
  return dateFromRule(dateRuleForType(type))
}

// Update the appointment linked to a call so it reflects the call's type:
// status / confirmation_status (when the type defines them) and the date.
// Returns a small summary (or null when nothing applies) for the API response.
export async function syncAppointmentForCallType(db, appointment_id, type) {
  if (!appointment_id || !type) return null

  const cfg = CALL_TYPE_CONFIG[type]
  if (!cfg) return null // unknown type -> leave appointment alone

  const set = { updated_at: new Date().toISOString() }
  if (cfg.appointment) Object.assign(set, cfg.appointment)
  // Store the offset rule + a snapshot date. The appointments API recomputes
  // the date from this rule on every read so it stays relative to "today".
  if (cfg.when) {
    set.appointment_date_rule = cfg.when
    set.appointment_date = dateFromRule(cfg.when)
  }

  const result = await db
    .collection("appointments")
    .updateOne({ appointment_id }, { $set: set })

  return { appointment_id, matched: result.matchedCount, ...set }
}

// Patient engagement state implied by a call type (null for unknown types).
export function patientStatusForType(type) {
  return CALL_TYPE_CONFIG[type]?.patient_status || null
}

// Update the patient linked to a call so their status reflects the call's type.
// Returns a small summary (or null when nothing applies) for the API response.
export async function syncPatientForCallType(db, patient_id, type) {
  if (!patient_id || !type) return null

  const patient_status = patientStatusForType(type)
  if (!patient_status) return null

  const result = await db
    .collection("patients")
    .updateOne(
      { patient_id },
      { $set: { patient_status, updated_at: new Date().toISOString() } }
    )

  return { patient_id, matched: result.matchedCount, patient_status }
}
