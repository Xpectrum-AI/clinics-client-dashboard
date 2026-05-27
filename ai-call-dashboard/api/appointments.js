import { getDb } from "./_lib/mongo.js"

export default async () => {
  try {
    const db = await getDb()
    const docs = await db
      .collection("appointments")
      .find({})
      .limit(200)
      .toArray()

    const cleaned = docs.map((d) => ({ ...d, _id: d._id.toString() }))
    return Response.json(cleaned)
  } catch (err) {
    console.error("[api/appointments] error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/appointments" }
