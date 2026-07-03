import { useState } from "react";
import axios from "axios";

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
        "http://localhost:5000/api/auth/signup",
        form
      );

      alert(res.data.message);
    } catch (error) {
      alert("Signup Failed");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <h2>Signup</h2>

      <input
        type="text"
        name="name"
        placeholder="Name"
        onChange={handleChange}
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
      />

      <button onClick={handleSignup}>
        Signup
      </button>
      <p style={{ textAlign: "center" }}>
  Already have an account?{" "}
  <span
    style={{ color: "blue", cursor: "pointer" }}
    onClick={() => setShowSignup(false)}
  >
    Login
  </span>
</p>
    </div>
  );
}

export default Signup;