import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Signup({ setShowSignup }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async () => {
    try {
      const res = await axios.post(
  "https://ai-customer-support-bot-olxv.onrender.com/api/auth/signup",
  form
);

      alert(res.data.message);
      setShowSignup(false);
    } catch (error) {
      alert("Signup Failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">🤖</div>

        <h1>Create Account</h1>
        <p>Join AI Customer Support</p>

        <input
          type="text"
          name="name"
          placeholder="👤 Name"
          onChange={handleChange}
        />

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

        <button onClick={handleSignup}>
          Signup
        </button>

        <div className="signup-link">
          Already have an account?
          <span onClick={() => setShowSignup(false)}>
            Login
          </span>
        </div>
      </div>
    </div>
  );
}

export default Signup;