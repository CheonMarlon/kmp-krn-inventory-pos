import React, { useState } from "react";
import { supabase } from "../../microservices/supabaseClient";
import "./Login.css"; // optional: separate CSS for login modal
import { useNavigate } from "react-router-dom";

const Login = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Attempting login with:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Login response:", data, error);

    if (error) {
      setError(error.message || "Invalid credentials");
      return;
    }

    const user = data.user;
    if (!user) {
      setError("Login failed: no user found");
      return;
    }

    const role = user.user_metadata?.role || "Cashier";
    alert(`Welcome ${role}!`);

    if (role === "Manager") {
      navigate("/selection");
    } else {
      navigate("/pos");
    }

    onClose(); // close modal on successful login
  };

  return (
    <div className="login-modal">
      <div className="login-box">
        <h2>Staff Access</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {error && <p className="error-text">{error}</p>}
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default Login;
