import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Newsapp from "./components/Newsapp";
import Trending from "./components/Trending";

function App() {
  const [user, setUser] = useState(() => {
  const saved = localStorage.getItem("user");
  return saved ? JSON.parse(saved) : null;
});

  const [register, setRegister] = useState(false);

  if (!user) {
    return register ? (
      <Register setRegister={setRegister} />
    ) : (
      <Login setUser={setUser} setRegister={setRegister} />
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Newsapp user={user} />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
