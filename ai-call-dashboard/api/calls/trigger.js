import { getDb } from "../_lib/mongo.js"

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    const body = await req.json()
    const { call_id } = body

    if (!call_id) {
      return Response.json({ error: "call_id is required" }, { status: 400 })
    }

    const db = await getDb()
    
    // Update the call to mark it as triggered/pending
    const result = await db.collection("calls").updateOne(
      { call_id: call_id },
      {
        $set: {
          status: "pending",
          next_run_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    )

    if (result.matchedCount === 0) {
      return Response.json({ error: "Call not found" }, { status: 404 })
    }

    // Trigger the Xpectrum workflow
    try {
      const workflowResponse = await fetch('https://cloud-v2.xpectrum.co/v1/workflows/run', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer app-fhQQpFmSwQtmwzwKIVf7PS2s',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {
            call_id: call_id
          },
          response_mode: "streaming",
          user: "abc-123"
        })
      })

      if (!workflowResponse.ok) {
        console.error('[api/calls/trigger] Workflow trigger failed:', await workflowResponse.text())
      }
    } catch (workflowError) {
      console.error('[api/calls/trigger] Workflow trigger error:', workflowError)
      // Don't fail the entire request if workflow trigger fails
    }

    return Response.json({ 
      success: true, 
      message: "Call triggered successfully",
      call_id 
    })
  } catch (err) {
    console.error("[api/calls/trigger] error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/calls/trigger" }
