import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  try {
    jwtDecode(token);
    return children;
  } catch (err) {
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
}