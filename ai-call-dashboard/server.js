// Local dev only. Wraps the Netlify-style handlers in /api as Express routes
// so `npm run dev` works without the Netlify CLI. Vite proxies /api/* here.

import express from "express"
import patientsFn from "./api/patients.js"
import appointmentsFn from "./api/appointments.js"
import callsFn from "./api/calls.js"

const app = express()
app.use(express.json())

function adapt(fn) {
  return async (req, res) => {
    try {
      const url = `http://${req.headers.host || "localhost"}${req.originalUrl}`
      const hasBody = !["GET", "HEAD"].includes(req.method)
      const request = new Request(url, {
        method: req.method,
        headers: { "content-type": "application/json" },
        body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
      })
      const response = await fn(request, {})
      res.status(response.status)
      response.headers.forEach((v, k) => res.setHeader(k, v))
      res.send(await response.text())
    } catch (err) {
      console.error("[adapter] error:", err)
      res.status(500).json({ error: err.message })
    }
  }
}

app.all("/api/patients", adapt(patientsFn))
app.all("/api/appointments", adapt(appointmentsFn))
app.all("/api/calls", adapt(callsFn))

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`)
})
