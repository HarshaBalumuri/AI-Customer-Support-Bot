import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login({ setShowSignup }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    try {
     const res = await axios.post(
  "https://ai-customer-support-bot-olxv.onrender.com/api/auth/login",
  form
);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        alert("Login Successful!");
        window.location.reload();
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert("Login Failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">🤖</div>

        <h1>Welcome Back</h1>
        <p>Sign in to continue</p>

        <input
          type="email"
          name="email"
          placeholder="📧 Email"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="🔒 Password"
          onChange={handleChange}
        />

        <button onClick={handleLogin}>
          Login
        </button>

        <div className="signup-link">
          Don't have an account?
          <span onClick={() => setShowSignup(true)}>
            Signup
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;