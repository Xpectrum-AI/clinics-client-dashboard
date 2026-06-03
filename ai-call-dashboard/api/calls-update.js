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
    const { call_id, type, identity_verified, verification_method } =
      await req.json()

    if (!call_id) {
      return Response.json({ error: "call_id is required" }, { status: 400 })
    }

    const now = new Date().toISOString()
    const update = { updated_at: now }

    if (type !== undefined) {
      if (!ALLOWED_TYPES.includes(type)) {
        return Response.json(
          { error: `type must be one of: ${ALLOWED_TYPES.join(", ")}` },
          { status: 400 }
        )
      }
      update.type = type
    }

    // Identity verification outcome written back by the voice workflow.
    if (identity_verified !== undefined) {
      update.identity_verified = Boolean(identity_verified)
      update.identity_verified_at = now
      if (verification_method) update.verification_method = verification_method
    }

    if (update.type === undefined && update.identity_verified === undefined) {
      return Response.json(
        { error: "Provide at least one of: type, identity_verified" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const result = await db
      .collection("calls")
      .updateOne({ call_id }, { $set: update })
    if (result.matchedCount === 0) {
      return Response.json({ error: "Call not found" }, { status: 404 })
    }

    return Response.json({ success: true, call_id, ...update })
  } catch (err) {
    console.error("[api/calls/update] error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/calls/update" }
