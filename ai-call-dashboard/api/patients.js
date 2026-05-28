import { getDb } from "./_lib/mongo.js"

function serialize(d) {
  return {
    _id: d._id.toString(),
    patient_id: d.patient_id,
    first_name: d.first_name,
    last_name: d.last_name,
    name: [d.first_name, d.last_name].filter(Boolean).join(" "),
    phone: d.phone,
    age: d.age,
    gender: d.gender,
    status: d.patient_status,
    notes: d.notes,
    preferred_call_time: d.preferred_call_time,
  }
}

function buildFields(body) {
  return {
    first_name: (body.first_name || "").trim(),
    last_name: (body.last_name || "").trim(),
    phone: (body.phone || "").trim(),
    age: body.age ? Number(body.age) : null,
    gender: body.gender || "",
    preferred_call_time: body.preferred_call_time || null,
    patient_status: body.patient_status || "active",
    notes: body.notes || "",
  }
}

async function nextPatientId(collection) {
  const docs = await collection
    .find({}, { projection: { patient_id: 1 } })
    .toArray()
  const nums = docs
    .map((d) => parseInt(String(d.patient_id || "").replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1001
  return `PAT_${next}`
}

export default async (req) => {
  try {
    const db = await getDb()
    const collection = db.collection("patients")
    const now = new Date().toISOString()

    if (req.method === "POST") {
      const fields = buildFields(await req.json())
      if (!fields.first_name || !fields.phone) {
        return Response.json(
          { error: "first_name and phone are required" },
          { status: 400 }
        )
      }
      const doc = {
        patient_id: await nextPatientId(collection),
        ...fields,
        created_at: now,
        updated_at: now,
      }
      const result = await collection.insertOne(doc)
      return Response.json(serialize({ ...doc, _id: result.insertedId }), {
        status: 201,
      })
    }

    if (req.method === "PUT") {
      const body = await req.json()
      const patient_id = (body.patient_id || "").trim()
      if (!patient_id) {
        return Response.json({ error: "patient_id is required" }, { status: 400 })
      }
      const fields = buildFields(body)
      if (!fields.first_name || !fields.phone) {
        return Response.json(
          { error: "first_name and phone are required" },
          { status: 400 }
        )
      }
      const result = await collection.updateOne(
        { patient_id },
        { $set: { ...fields, updated_at: now } }
      )
      if (result.matchedCount === 0) {
        return Response.json({ error: "Patient not found" }, { status: 404 })
      }
      const updated = await collection.findOne({ patient_id })
      return Response.json(serialize(updated))
    }

    const docs = await collection.find({}).limit(200).toArray()
    return Response.json(docs.map(serialize))
  } catch (err) {
    console.error("[api/patients] error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/patients" }
