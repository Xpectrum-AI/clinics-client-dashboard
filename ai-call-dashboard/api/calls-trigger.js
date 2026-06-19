import { getDb } from "./_lib/mongo.js"

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    const { call_id } = await req.json()
    if (!call_id) {
      return Response.json({ error: "call_id is required" }, { status: 400 })
    }

    const db = await getDb()
    const now = new Date().toISOString()
    const result = await db.collection("calls").updateOne(
      { call_id },
      { $set: { status: "pending", next_run_at: now, updated_at: now } }
    )
    if (result.matchedCount === 0) {
      return Response.json({ error: "Call not found" }, { status: 404 })
    }

    try {
      // DEV deployment (temporary — initial-message-delay feature is dev-only).
      // PROD was: https://cloud-v2.xpectrum.co/v1/workflows/run  Bearer app-fhQQpFmSwQtmwzwKIVf7PS2s
      const wf = await fetch("https://apps-v2-dev.xpectrum-ai.com/v1/workflows/run", {
        method: "POST",
        headers: {
          Authorization: "Bearer app-uoqXFIngTqy4zmRRhSJ5mtD5",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: { call_id },
          response_mode: "streaming",
          user: "abc-123",
        }),
      })
      if (!wf.ok) {
        console.error("[api/calls/trigger] workflow failed:", await wf.text())
      }
    } catch (e) {
      console.error("[api/calls/trigger] workflow error:", e)
    }

    return Response.json({ success: true, message: "Call triggered", call_id })
  } catch (err) {
    console.error("[api/calls/trigger] error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/calls/trigger" }
