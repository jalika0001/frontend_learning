import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/admin/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
    {/* // add navbar here so it shows on all pages */}
      <Navbar />
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* // add admin dashboard route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        /> 
      </Routes>
    </BrowserRouter>
  );
}