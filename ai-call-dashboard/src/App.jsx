import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Patients from "./pages/Patients"
import Calls from "./pages/Calls"
import Appointments from "./pages/Appointments"
import { DataProvider } from "./context/DataContext"

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/calls" element={<Calls />} />
            <Route path="/appointments" element={<Appointments />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  )
}

export default App
