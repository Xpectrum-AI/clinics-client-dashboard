import { getDb } from "./_lib/mongo.js"

export default async (req, context) => {
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

    // Fetch the call so we can pass type + purpose to the workflow.
    // This ensures the workflow uses the call's own type (e.g. "no_show") to
    // pick its script, rather than the patient's derived status (e.g. "lapsed"),
    // which can be the same value for multiple distinct call types.
    const call = await db.collection("calls").findOne({ call_id })
    if (!call) {
      return Response.json({ error: "Call not found" }, { status: 404 })
    }

    const result = await db.collection("calls").updateOne(
      { call_id },
      { $set: { status: "pending", next_run_at: now, updated_at: now } }
    )
    if (result.matchedCount === 0) {
      return Response.json({ error: "Call not found" }, { status: 404 })
    }

    // The workflow call can take a long time to respond, well past the
    // function's own execution limit. Don't block the response on it —
    // let it keep running in the background via waitUntil.
    context.waitUntil(
      fetch("https://cloud.xpectrum.dev/v1/workflows/run", {
        method: "POST",
        headers: {
          Authorization: "Bearer app-Hbjiq4hIqCLGmnYeFKb4z4bZ",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            call_id,
            call_type: call.type,       // e.g. "no_show" — use this to pick the script
            call_purpose: call.purpose, // e.g. "Missed Appointment Follow-Up"
            patient_id: call.patient_id,
            appointment_id: call.appointment_id,
          },
          response_mode: "streaming",
          user: "abc-123",
        }),
      })
        .then(async (wf) => {
          if (!wf.ok) {
            console.error("[api/calls/trigger] workflow failed:", await wf.text())
          }
        })
        .catch((e) => {
          console.error("[api/calls/trigger] workflow error:", e)
        })
    )

    return Response.json({ success: true, message: "Call triggered", call_id })
  } catch (err) {
    console.error("[api/calls/trigger] error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/calls/trigger" }
