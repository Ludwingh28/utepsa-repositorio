import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import MyFiles from "./pages/MyFiles"
import Navbar from "./components/Navbar"
import FloatingButton from "./components/FloatingButton"
import { AuthProvider } from "./context/AuthContext"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="font-sans min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mis-archivos" element={<MyFiles />} />
          </Routes>
          <FloatingButton />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App