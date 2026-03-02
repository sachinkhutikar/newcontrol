import React, { useState } from "react";
import axios from "axios";

export default function Login({ setUser, setRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const login = async () => {
    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }

    const res = await axios.post("http://127.0.0.1:5001/api/login", {
      username,
      password,
    });

    if (res.data.status === "success") {
  localStorage.setItem("user", JSON.stringify(res.data.user));
  setUser(res.data.user);
}
 else {
      alert("Invalid Login ❌");
    }
  };

  return (
    <div className="login-page">
      <style>{css}</style>

      <div className="login-card">
        <h1>📰 News Control</h1>
        <h3>Sign in to continue</h3>

        <input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="password-box">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <span onClick={() => setShow(!show)}>
            {show ? "🙈" : "👁️"}
          </span>
        </div>

        <button onClick={login}>Login</button>

        <p onClick={() => setRegister(true)}>
          New here? <span>Create Account</span>
        </p>
      </div>
    </div>
  );
}

/* ---------------- CSS ---------------- */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;600&display=swap');

.login-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, #f8fafc, #e2e8f0);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Inter', sans-serif;
}

.login-card {
  width: 380px;
  padding: 35px 40px;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(12px);
  border-radius: 18px;
  text-align: center;
  box-shadow: 0 18px 45px rgba(0,0,0,.15);
  animation: scaleIn .6s ease forwards;
}

.login-card h1 {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  margin-bottom: 5px;
  color: #0f172a;
}

.login-card h3 {
  font-weight: 500;
  margin-bottom: 25px;
  color: #334155;
}

/* INPUTS */
.login-card input {
  width: 100%;
  padding: 14px 15px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  margin-bottom: 15px;
  font-size: 15px;
  outline: none;
  transition: .25s ease;
}

.login-card input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.25);
}

/* PASSWORD BOX */
.password-box {
  position: relative;
}

.password-box span {
  position: absolute;
  right: 12px;
  top: 13px;
  cursor: pointer;
  font-size: 18px;
}

/* BUTTON */
.login-card button {
  width: 100%;
  padding: 14px;
  margin-top: 10px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg,#4f46e5,#6366f1);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all .3s ease;
  box-shadow: 0 8px 20px rgba(79,70,229,.35);
}

.login-card button:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 35px rgba(79,70,229,.5);
}

/* LINK */
.login-card p {
  margin-top: 18px;
  font-size: 14px;
  cursor: pointer;
  color: #475569;
}

.login-card span {
  color: #4f46e5;
  font-weight: 600;
}

.login-card p:hover span {
  text-decoration: underline;
}

/* ANIMATION */
@keyframes scaleIn {
  from {opacity: 0; transform: scale(.92);}
  to {opacity: 1; transform: scale(1);}
}
`;
