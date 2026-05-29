import { getDb } from "./_lib/mongo.js"

const ALLOWED_TYPES = [
  "confirm",
  "rescheduled",
  "cancelled",
  "no_show",
  "followup",
  "inactive",
]

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    const { call_id, type } = await req.json()

    if (!call_id) {
      return Response.json({ error: "call_id is required" }, { status: 400 })
    }
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return Response.json(
        { error: `type must be one of: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      )
    }

    const db = await getDb()
    const now = new Date().toISOString()
    const result = await db.collection("calls").updateOne(
      { call_id },
      { $set: { type, updated_at: now } }
    )
    if (result.matchedCount === 0) {
      return Response.json({ error: "Call not found" }, { status: 404 })
    }

    return Response.json({ success: true, call_id, type })
  } catch (err) {
    console.error("[api/calls/update] error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/calls/update" }
