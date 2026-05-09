import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(
        "http://localhost:3000/auth/register",
        { username, password }
      );

      // 🔥 SAVE TOKEN
      localStorage.setItem(
        "token",
        res.data.token
      );

      alert("Register success!");

      // 🔥 GO TO DASHBOARD
      navigate("/admin");

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Register failed"
      );
    }
  };

  return (
    <div>

      <h2>Register</h2>

      <form onSubmit={handleRegister}>

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
          Register
        </button>

      </form>

    </div>
  );
}