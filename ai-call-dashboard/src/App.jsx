import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Patients from "./pages/Patients"
import Calls from "./pages/Calls"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/calls" element={<Calls />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
