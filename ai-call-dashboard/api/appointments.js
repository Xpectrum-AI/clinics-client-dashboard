import { getDb } from "./_lib/mongo.js"

export default async function handler(req, res) {
  try {
    const db = await getDb()
    const docs = await db
      .collection("appointments")
      .find({})
      .limit(100)
      .toArray()
    res.status(200).json(docs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
