import { getDb } from "./_lib/mongo.js"

export default async function handler(req, res) {
  try {
    const db = await getDb()
    const docs = await db
      .collection("calls")
      .find({})
      .limit(200)
      .toArray()

    const cleaned = docs.map((d) => ({ ...d, _id: d._id.toString() }))
    res.status(200).json(cleaned)
  } catch (err) {
    console.error("[api/calls] error:", err)
    res.status(500).json({ error: err.message })
  }
}
