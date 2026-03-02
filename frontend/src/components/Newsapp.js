import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Header from "./Header";

export default function Newsapp({ user }) {
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState("business");
  const [viewSaved, setViewSaved] = useState(false);

  /* ================== CALLBACKS ================== */

  const fetchCategory = useCallback(async (cat) => {
    try {
      await axios.get(
        `https://newcontrol-1.onrender.com/api/fetch/${cat}`
      );
      const res = await axios.get(
        "https://newcontrol-1.onrender.com/api/news"
      );
      setNews(res.data);
    } catch (err) {
      console.error("Fetch category error:", err);
    }
  }, []);

  const loadSaved = useCallback(async () => {
    if (!user?.id) return; // 🔥 prevents crash

    try {
      const res = await axios.get(
        `https://newcontrol-1.onrender.com/api/saved/${user.id}`
      );
      setNews(res.data);
    } catch (err) {
      console.error("Load saved error:", err);
    }
  }, [user?.id]);

  /* ================== EFFECT ================== */

  useEffect(() => {
    if (viewSaved) {
      loadSaved();
    } else {
      fetchCategory(category);
    }
  }, [category, viewSaved, fetchCategory, loadSaved]);

  /* ================== ACTIONS ================== */

  const saveArticle = async (article) => {
    if (!user?.id) {
      alert("Please login first");
      return;
    }

    try {
      await axios.post(
        "https://newcontrol-1.onrender.com/api/save",
        {
          user_id: user.id,
          ...article,
        }
      );
      alert("Article Saved ✅");
    } catch (err) {
      alert("Error saving article");
    }
  };

  const checkFake = async (article) => {
    try {
      const res = await axios.post(
        "https://newcontrol-1.onrender.com/api/predict",
        {
          text: article.title + " " + article.description,
        }
      );

      alert(
        `🧠 Fake News Detection Result\n\nPrediction: ${res.data.prediction}\nConfidence: ${res.data.confidence}%`
      );
    } catch (err) {
      alert("AI Server Error — Backend may be sleeping (Render free tier)");
    }
  };

  const translateArticle = async (article) => {
    const lang = prompt(
      "Enter language code:\n\nhi = Hindi\nfr = French\nes = Spanish\nde = German\nar = Arabic\nja = Japanese",
      "hi"
    );

    if (!lang) return;

    try {
      const res = await axios.post(
        "https://newcontrol-1.onrender.com/api/translate",
        {
          text: article.title + " " + article.description,
          target: lang,
        }
      );

      alert("🌍 Translated Text:\n\n" + res.data.translated);
    } catch (err) {
      alert("Translation Server Error");
    }
  };

  /* ================== UI ================== */

  return (
    <div className="news-page">
      <style>{css}</style>

      <Header
        user={user}
        logout={() => {
          localStorage.removeItem("user");
          window.location.reload();
        }}
      />

      {/* CATEGORY BAR */}
      <div className="category-bar">
        {!viewSaved &&
          ["business", "sports", "technology", "health", "science"].map(
            (cat) => (
              <button
                key={cat}
                className={category === cat ? "active" : ""}
                onClick={() => setCategory(cat)}
              >
                {cat.toUpperCase()}
              </button>
            )
          )}

        <button
          className="saved-btn"
          onClick={() => setViewSaved(!viewSaved)}
        >
          {viewSaved ? "← Back to News" : "★ Saved Articles"}
        </button>
      </div>

      {/* NEWS GRID */}
      <div className="news-grid">
        {news.map((n, i) => (
          <div key={i} className="news-card">
            {n.image && <img src={n.image} alt="" />}

            <div className="news-content">
              <h3>{n.title}</h3>
              <p>{n.description}</p>

              <div className="news-footer">
                <a href={n.link} target="_blank" rel="noreferrer">
                  Read More →
                </a>

                <div className="btn-group">
                  {!viewSaved && (
                    <button onClick={() => saveArticle(n)}>
                      Save
                    </button>
                  )}

                  <button
                    className="fake-btn"
                    onClick={() => checkFake(n)}
                  >
                    🧠 Check Fake
                  </button>

                  <button
                    className="translate-btn"
                    onClick={() => translateArticle(n)}
                  >
                    🌍 Translate
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ---------------- CSS ---------------- */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

body {
  margin: 0;
}

/* ROOT */
.news-page {
  background: linear-gradient(180deg,#f8fafc,#eef2ff);
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* CATEGORY BAR */
.category-bar {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 12px;
  background: white;
  box-shadow: 0 5px 20px rgba(0,0,0,.07);
  position: sticky;
  top: 0;
  z-index: 20;
}

.category-bar button {
  border: none;
  padding: 9px 16px;
  border-radius: 999px;
  background: #e2e8f0;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: .3s ease;
}

.category-bar button:hover {
  background: #6366f1;
  color: white;
}

.category-bar .active {
  background: linear-gradient(135deg,#4f46e5,#6366f1);
  color: white;
  box-shadow: 0 5px 18px rgba(79,70,229,.45);
}

.saved-btn {
  background: linear-gradient(135deg,#020617,#1e293b) !important;
  color: white !important;
}

/* GRID */
.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(300px,1fr));
  gap: 22px;
  padding: 20px;
}

/* CARD */
.news-card {
  background: linear-gradient(180deg,#ffffff,#f9fafb);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(0,0,0,.1);
  transition: all .4s cubic-bezier(.175,.885,.32,1.15);
  display: flex;
  flex-direction: column;
  height: 440px;
  position: relative;
}

.news-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 45px rgba(0,0,0,.2);
}

/* IMAGE */
.news-card img {
  width: 100%;
  height: 190px;
  object-fit: cover;
}

/* CONTENT */
.news-content {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.news-content h3 {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  margin-bottom: 6px;
  color: #020617;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-content p {
  color: #475569;
  font-size: 14px;
  line-height: 1.55;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* FOOTER */
.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
}

/* READ LINK */
.news-footer a {
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  color: #4f46e5;
}

/* BUTTON GROUP */
.btn-group {
  display: flex;
  gap: 7px;
}

/* ACTION BUTTONS */
.news-footer button {
  border: none;
  padding: 7px 13px;
  border-radius: 10px;
  background: linear-gradient(135deg,#0f172a,#020617);
  color: white;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: .3s ease;
}

.news-footer button:hover {
  transform: scale(1.07);
}

/* FAKE */
.fake-btn {
  background: linear-gradient(135deg,#f59e0b,#f97316);
}

.fake-btn:hover {
  box-shadow: 0 6px 18px rgba(249,115,22,.55);
}

/* TRANSLATE */
.translate-btn {
  background: linear-gradient(135deg,#22c55e,#16a34a);
}

.translate-btn:hover {
  box-shadow: 0 6px 18px rgba(34,197,94,.55);
}

/* ================= MOBILE UI ================= */

@media (max-width: 900px) {
  .news-grid {
    padding: 14px;
    gap: 16px;
  }

  .news-card {
    height: auto;
  }

  .news-card img {
    height: 180px;
  }
}

@media (max-width: 600px) {

  .category-bar {
    gap: 6px;
    padding: 10px 8px;
  }

  .category-bar button {
    padding: 7px 12px;
    font-size: 11px;
  }

  .news-grid {
    grid-template-columns: 1fr;
    padding: 12px;
    gap: 14px;
  }

  .news-card {
    border-radius: 14px;
  }

  .news-card img {
    height: 170px;
  }

  .news-content h3 {
    font-size: 17px;
  }

  .news-content p {
    font-size: 13px;
  }

  .news-footer button {
    padding: 6px 11px;
    font-size: 11px;
  }

  .btn-group {
    gap: 6px;
  }
}

/* ================= APP FEEL ================= */

.news-card {
  animation: fadeUp .6s ease both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


`;
