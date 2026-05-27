// Local dev only. Runs the same /api handlers as a small Express server.
// Vite proxies /api/* to this server (see vite.config.js).

import express from "express"
import patientsHandler from "./api/patients.js"
import appointmentsHandler from "./api/appointments.js"
import callsHandler from "./api/calls.js"

const app = express()
app.use(express.json())

app.all("/api/patients", patientsHandler)
app.all("/api/appointments", appointmentsHandler)
app.all("/api/calls", callsHandler)

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`)
})
