import { useEffect, useState } from "react"

export function useApi(url) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    setLoading(true)
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d) => {
        if (cancel) return
        setData(d)
        setError(null)
      })
      .catch((e) => !cancel && setError(e.message))
      .finally(() => !cancel && setLoading(false))
    return () => {
      cancel = true
    }
  }, [url])

  return { data, error, loading }
}
