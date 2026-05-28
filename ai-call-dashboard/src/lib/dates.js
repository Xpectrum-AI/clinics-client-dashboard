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
