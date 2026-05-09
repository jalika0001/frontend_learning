import { useState, useEffect } from "react";
import axios from "axios";
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

      const res = await axios.post(
        "http://localhost:3000/auth/login",
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

      // alert(
      //   err.response?.data?.message ||
      //   "Login failed"
      // );
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