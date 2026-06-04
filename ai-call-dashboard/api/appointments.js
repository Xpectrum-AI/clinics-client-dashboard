import { getDb } from "./_lib/mongo.js"
import { dateFromRule } from "./_lib/appointment-sync.js"

export default async () => {
  try {
    const db = await getDb()
    const docs = await db
      .collection("appointments")
      .find({})
      .limit(200)
      .toArray()

    // Appointments synced from a call type carry a relative date rule; recompute
    // their date from today so it stays exactly +2d / -2d / -6mo (dynamic-on-read).
    const cleaned = docs.map((d) => ({
      ...d,
      _id: d._id.toString(),
      appointment_date: d.appointment_date_rule
        ? dateFromRule(d.appointment_date_rule)
        : d.appointment_date,
    }))
    return Response.json(cleaned)
  } catch (err) {
    console.error("[api/appointments] error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/appointments" }
