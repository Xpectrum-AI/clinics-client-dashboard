import { getDb } from "./_lib/mongo.js"

// Read-only lookup used by the voice workflow at the start of a call.
// Given a call_id it returns the call joined with its patient so the agent
// has the identity-verification material (date_of_birth, name) on hand.
//   GET /api/calls/detail?call_id=CAL_1001
export default async (req) => {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    const call_id = new URL(req.url).searchParams.get("call_id")
    if (!call_id) {
      return Response.json({ error: "call_id is required" }, { status: 400 })
    }

    const db = await getDb()
    const call = await db.collection("calls").findOne({ call_id })
    if (!call) {
      return Response.json({ error: "Call not found" }, { status: 404 })
    }

    const patient = call.patient_id
      ? await db.collection("patients").findOne({ patient_id: call.patient_id })
      : null

    return Response.json({
      call_id: call.call_id,
      type: call.type,
      purpose: call.purpose,
      status: call.status,
      scheduled_for: call.scheduled_for,
      patient: patient
        ? {
            patient_id: patient.patient_id,
            first_name: patient.first_name,
            last_name: patient.last_name,
            name: [patient.first_name, patient.last_name].filter(Boolean).join(" "),
            phone: patient.phone,
            date_of_birth: patient.date_of_birth || null,
          }
        : null,
    })
  } catch (err) {
    console.error("[api/calls/detail] error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/calls/detail" }
