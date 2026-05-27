export function isToday(iso) {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function formatTime(iso) {
  if (!iso) return ""
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatDateTime(iso) {
  if (!iso) return ""
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  const time = formatTime(iso)
  if (isToday(iso)) return `Today ${time}`
  if (
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate()
  )
    return `Tomorrow ${time}`
  return `${d.toLocaleDateString([], { day: "numeric", month: "short" })} ${time}`
}

export function scenarioFromPatient(patient) {
  const status = patient?.status
  const cb = patient?.latest_response?.callback_requested
  switch (status) {
    case "booked":
      return "confirm"
    case "reschedule_requested":
      return "reschedule"
    case "cancelled":
      return "cancel"
    case "no_show":
      return "noshow"
    case "completed":
      return cb ? "callback" : "followup"
    case "inactive":
      return "lapsed"
    default:
      return "confirm"
  }
}
