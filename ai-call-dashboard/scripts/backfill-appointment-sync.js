// One-off: reconcile every existing appointment with its call's `type`.
//
// The create/update endpoints keep calls and appointments consistent going
// forward, but rows that already existed before that wiring were never synced.
// This walks all calls and applies the same mapping (api/_lib/appointment-sync.js)
// so historical data matches too.
//
// Idempotent: re-running it just re-applies the same target state.
// Run:  node --env-file=.env scripts/backfill-appointment-sync.js
import { getDb } from "../api/_lib/mongo.js"
import {
  TYPE_TO_APPOINTMENT,
  syncAppointmentForCallType,
} from "../api/_lib/appointment-sync.js"

const db = await getDb()
const calls = await db.collection("calls").find({}).toArray()

let synced = 0
let skipped = 0

for (const call of calls) {
  const { call_id, type, appointment_id } = call
  if (!appointment_id || !TYPE_TO_APPOINTMENT[type]) {
    skipped++
    console.log(`  skip ${call_id} (type=${type}, appt=${appointment_id || "none"})`)
    continue
  }
  const res = await syncAppointmentForCallType(db, appointment_id, type)
  if (res?.matched) {
    synced++
    console.log(
      `  ${call_id} (${type}) -> ${appointment_id}: status=${res.status}` +
        (res.confirmation_status ? `, confirmation=${res.confirmation_status}` : "")
    )
  } else {
    skipped++
    console.log(`  skip ${call_id} -> ${appointment_id} (appointment not found)`)
  }
}

console.log(`Done. Synced ${synced} appointment(s), skipped ${skipped}.`)
process.exit(0)
