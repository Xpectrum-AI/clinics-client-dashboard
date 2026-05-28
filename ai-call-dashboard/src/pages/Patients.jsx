import { useOutletContext } from "react-router-dom"
import PatientTable from "../components/PatientTable"
import { matchesSearch } from "../lib/search"
import { useData } from "../context/DataContext"

export default function Patients() {
  const { search } = useOutletContext()
  const { patients, loading, errors } = useData()
  const filteredPatients = patients.filter((p) => matchesSearch(p, search))

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        All Patients {!loading.patients && `(${filteredPatients.length})`}
      </h2>

      {errors.patients && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm mb-4">
          Failed to load: {errors.patients}
        </div>
      )}

      {loading.patients ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <PatientTable patients={filteredPatients} />
      )}
    </div>
  )
}
