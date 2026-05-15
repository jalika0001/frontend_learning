import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // already logged in
  useEffect(() => {

    const token = localStorage.getItem("token");

    if (token) {
      navigate("/admin");
    }

  }, []);

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await api.post(
        "/auth/login",
        {
          username,
          password
        }
      );

      const token = res.data.token;

      // save token
      localStorage.setItem("token", token);

      // redirect
      navigate("/admin");

    } catch (err) {
      const message = err.code === "ERR_NETWORK"
        ? "Cannot reach API server. Check VITE_API_URL and backend status."
        : (err.response?.data?.message || "Login failed");

      alert(message);
    }
  };

  return (
    <div>

      <h2>Login</h2>

      <form onSubmit={handleLogin}>

        <input
          placeholder="Username"
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button type="submit">
          Login
        </button>

      </form>

    </div>
  );
}