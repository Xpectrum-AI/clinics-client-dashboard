import { getDb } from "./_lib/mongo.js"
import { syncAppointmentForCallType } from "./_lib/appointment-sync.js"

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    const body = await req.json()
    const {
      patient_id,
      appointment_id,
      type,
      purpose,
      scheduled_for,
      next_run_at,
      metadata,
      status = "scheduled",
      retry_count = 0,
    } = body

    if (!patient_id || !appointment_id || !type || !purpose || !scheduled_for) {
      return Response.json(
        {
          error:
            "Missing required fields: patient_id, appointment_id, type, purpose, scheduled_for",
        },
        { status: 400 }
      )
    }

    const db = await getDb()
    const callCount = await db.collection("calls").countDocuments()
    const call_id = `CAL_${callCount + 1001}`
    const now = new Date().toISOString()

    const newCall = {
      call_id,
      patient_id,
      appointment_id,
      type,
      purpose,
      scheduled_for,
      next_run_at: next_run_at || null,
      status,
      retry_count,
      last_attempt_at: null,
      metadata: metadata || {},
      created_at: now,
      updated_at: now,
    }

    const result = await db.collection("calls").insertOne(newCall)

    // Keep the linked appointment consistent with the new call's type.
    const appointment_sync = await syncAppointmentForCallType(
      db,
      appointment_id,
      type
    )

    return Response.json(
      { ...newCall, _id: result.insertedId.toString(), appointment_sync },
      { status: 201 }
    )
  } catch (err) {
    console.error("[api/calls/create] error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/calls/create" }
