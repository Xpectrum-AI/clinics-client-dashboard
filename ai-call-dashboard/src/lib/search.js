export function matchesSearch(patient, query) {
  const q = (query || "").trim().toLowerCase()
  if (!q) return true
  return (
    (patient.name || "").toLowerCase().includes(q) ||
    (patient.phone || "").toLowerCase().includes(q) ||
    (patient.patient_id || "").toLowerCase().includes(q)
  )
}
