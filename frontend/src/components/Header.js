import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header({ user, logout }) {
  const navigate = useNavigate();

  return (
    <header className="news-header">
      <style>{css}</style>

      <div className="header-left">
        <span className="logo" onClick={() => navigate("/")}>
          📰 NewsControl
        </span>
      </div>

      <nav className="header-nav">
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate("/trending")}>Trending</button>
      </nav>

      <div className="header-right">
        <span className="welcome">Welcome, {user.username}</span>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}

/* ---------------- CSS ---------------- */

const css = `
.news-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 30px;
  background: linear-gradient(135deg,#020617,#0f172a);
  color: white;
  box-shadow: 0 10px 25px rgba(0,0,0,.4);
}

/* LOGO */
.logo {
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
  transition: .3s ease;
}

.logo:hover {
  color: #60a5fa;
  transform: scale(1.05);
}

/* NAV */
.header-nav button {
  background: transparent;
  border: none;
  color: #cbd5f5;
  font-size: 15px;
  font-weight: 600;
  margin: 0 10px;
  cursor: pointer;
  position: relative;
  transition: .3s ease;
}

.header-nav button::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 0%;
  height: 2px;
  background: #60a5fa;
  transition: .3s ease;
}

.header-nav button:hover::after {
  width: 100%;
}

.header-nav button:hover {
  color: white;
}

/* RIGHT */
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome {
  font-size: 14px;
  color: #e5e7eb;
}

/* LOGOUT */
.logout-btn {
  border: none;
  padding: 8px 16px;
  border-radius: 999px;
  background: linear-gradient(135deg,#ef4444,#dc2626);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: .3s ease;
}

.logout-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(239,68,68,.5);
}
`;
