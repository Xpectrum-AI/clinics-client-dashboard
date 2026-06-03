// One-off: seed a date_of_birth for existing patients that don't have one.
//
// NOTE: these are FABRICATED test dates, chosen to stay consistent with each
// patient's stored `age`. They are NOT real birth dates — for production the
// real DOB must be entered per patient (Add/Edit Patient form). This only
// exists so the verification flow can be exercised end-to-end.
//
// Idempotent: only patients with a missing/empty date_of_birth are touched.
// Run:  node --env-file=.env scripts/seed-dob.js
import { getDb } from "../api/_lib/mongo.js"

// patient_id -> YYYY-MM-DD (each year = 2026 - age, day/month before today so
// the derived age matches the stored age as of 2026-06-03)
const SEED = {
  PAT_1001: "1992-03-05", // Yash Thakur (age 34)
  PAT_1002: "1997-01-22", // Tiana Thomas (age 29)
  PAT_1003: "1984-04-15", // Brad Simpson (age 42)
  PAT_1004: "2005-02-10", // Suhash Parupudi (age 21)
  PAT_1005: "1981-05-30", // Kirk E. King (age 45)
}

const db = await getDb()
const now = new Date().toISOString()
let updated = 0

for (const [patient_id, dob] of Object.entries(SEED)) {
  const res = await db.collection("patients").updateOne(
    { patient_id, $or: [{ date_of_birth: { $exists: false } }, { date_of_birth: null }, { date_of_birth: "" }] },
    { $set: { date_of_birth: dob, updated_at: now } }
  )
  if (res.modifiedCount) {
    updated++
    console.log(`  set ${patient_id} -> ${dob}`)
  } else {
    console.log(`  skip ${patient_id} (not found or already has DOB)`)
  }
}

console.log(`Done. Updated ${updated} patient(s).`)
process.exit(0)
