import { getDb } from "./_lib/mongo.js"

export default async () => {
  try {
    const db = await getDb()
    const docs = await db
      .collection("calls")
      .find({})
      .limit(200)
      .toArray()

    const cleaned = docs.map((d) => ({ ...d, _id: d._id.toString() }))
    return Response.json(cleaned)
  } catch (err) {
    console.error("[api/calls] error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/calls" }
