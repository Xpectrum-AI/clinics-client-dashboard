// One-off: reconcile existing data with the call-type rules.
//
// The create/update endpoints keep a call's purpose and its linked appointment
// (status / confirmation_status / date) consistent with the call's `type` going
// forward. Rows that existed before that wiring were never synced — this walks
// all calls and applies the same mapping (api/_lib/appointment-sync.js) so
// historical data matches too.
//
// NOTE: this rewrites each call's `purpose` to the standard label for its type,
// replacing any previous custom purpose, and shifts each appointment's date to
// the future/past implied by the type.
//
// Idempotent: re-running it just re-applies the same target state.
// Run:  node --env-file=.env scripts/backfill-appointment-sync.js
import { getDb } from "../api/_lib/mongo.js"
import {
  CALL_TYPE_CONFIG,
  purposeForType,
  syncAppointmentForCallType,
  syncPatientForCallType,
} from "../api/_lib/appointment-sync.js"

const db = await getDb()
const calls = await db.collection("calls").find({}).toArray()

let synced = 0
let skipped = 0

for (const call of calls) {
  const { call_id, type, appointment_id, patient_id } = call
  if (!CALL_TYPE_CONFIG[type]) {
    skipped++
    console.log(`  skip ${call_id} (unknown type=${type})`)
    continue
  }

  // 1. Call purpose follows the type.
  const purpose = purposeForType(type)
  await db
    .collection("calls")
    .updateOne(
      { call_id },
      { $set: { purpose, updated_at: new Date().toISOString() } }
    )

  // 2. Linked appointment status / confirmation / date follow the type.
  const res = appointment_id
    ? await syncAppointmentForCallType(db, appointment_id, type)
    : null

  // 3. Linked patient status follows the type.
  const pat = patient_id
    ? await syncPatientForCallType(db, patient_id, type)
    : null

  synced++
  const apptInfo = res?.matched
    ? `${appointment_id}: status=${res.status ?? "(unchanged)"}, date=${res.appointment_date}`
    : `(no appointment)`
  const patInfo = pat?.matched ? `, patient=${pat.patient_status}` : ""
  console.log(`  ${call_id} (${type}) purpose="${purpose}" -> ${apptInfo}${patInfo}`)
}

console.log(`Done. Synced ${synced} call(s), skipped ${skipped}.`)
process.exit(0)
