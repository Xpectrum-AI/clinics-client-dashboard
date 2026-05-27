export default function Topbar() {
  return (
    <div className="h-16 bg-white border-b px-6 flex items-center justify-between">

      <input
        type="text"
        placeholder="Search patients..."
        className="border rounded-xl px-4 py-2 w-80"
      />

      <button className="bg-blue-600 text-white px-5 py-2 rounded-xl">
        + Add Patient
      </button>

    </div>
  )
}
