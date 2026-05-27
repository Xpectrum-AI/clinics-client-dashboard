import { getDb } from "./_lib/mongo.js"

export default async () => {
  try {
    const db = await getDb()
    const docs = await db
      .collection("patients_new")
      .find({})
      .project({
        patient_id: 1,
        name: 1,
        phone: 1,
        email: 1,
        visit_type: 1,
        scheduled_at: 1,
        status: 1,
        latest_response: 1,
        next_run_at: 1,
      })
      .limit(200)
      .toArray()

    const cleaned = docs.map((d) => ({ ...d, _id: d._id.toString() }))
    return Response.json(cleaned)
  } catch (err) {
    console.error("[api/patients] error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/patients" }
