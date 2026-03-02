import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

export default function Trending() {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const cat = await axios.get("https://newcontrol-1.onrender.com/api/trending/categories");
    const art = await axios.get("https://newcontrol-1.onrender.com/api/trending/articles");
    const st = await axios.get("https://newcontrol-1.onrender.com/api/trending/stats");

    setCategories(cat.data);
    setArticles(art.data);
    setStats(st.data);
  };

  return (
    <div className="dashboard">
      <style>{css}</style>

      <h1 className="title">📰 Trending Analytics Dashboard</h1>

      {/* STATS */}
      <div className="stats">
        <StatCard title="Users" value={stats.users} />
        <StatCard title="Articles" value={stats.articles} />
        <StatCard title="Saved" value={stats.saves} />
      </div>

      <div className="grid">
        <div className="panel">
          <h3>📊 Category Trends</h3>
          <div className="chart-box">
  <Bar
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
    }}
    data={{
      labels: categories.map((c) => c.category.toUpperCase()),
      datasets: [
        {
          label: "Articles",
          data: categories.map((c) => c.count),
          backgroundColor: [
            "#6366f1",
            "#22c55e",
            "#f59e0b",
            "#ec4899",
            "#06b6d4",
          ],
          borderRadius: 8,
        },
      ],
    }}
  />
</div>

        </div>

        <div className="panel">
          <h3>🔥 Top Trending Articles</h3>
          <div className="chart-box small">
  <Pie
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { size: 11 },
            boxWidth: 12,
          },
        },
      },
    }}
    data={{
      labels: articles.map((_, i) => `Article ${i + 1}`),
      datasets: [
        {
          data: articles.map((a) => a.count),
          backgroundColor: [
            "#6366f1",
            "#22c55e",
            "#f59e0b",
            "#ec4899",
            "#06b6d4",
          ],
        },
      ],
    }}
  />
</div>


          <ul className="article-list">
            {articles.map((a, i) => (
              <li key={i}>
                <strong>Article {i + 1}:</strong> {a.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* -------------------- CARDS -------------------- */

function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <h1>{value || 0}</h1>
    </div>
  );
}

/* -------------------- CSS -------------------- */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;600&display=swap');

body {
  margin: 0;
}

.dashboard {
  min-height: 100vh;
  padding: 30px;
  background: radial-gradient(circle at top, #f8fafc, #e2e8f0);
  font-family: 'Inter', sans-serif;
  animation: fadeIn 1s ease;
}

.title {
  font-family: 'Playfair Display', serif;
  font-size: 36px;
  letter-spacing: 1px;
  margin-bottom: 25px;
  color: #0f172a;
}

/* STATS */
.stats {
  display: flex;
  gap: 25px;
  margin-bottom: 40px;
}

.stat-card {
  flex: 1;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  padding: 25px;
  border-radius: 16px;
  text-align: center;
  color: white;
  box-shadow: 0 10px 25px rgba(79,70,229,.3);
  transition: all .3s ease;
  animation: slideUp .6s ease forwards;
}

.stat-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 18px 40px rgba(79,70,229,.45);
}

.stat-card h3 {
  font-weight: 500;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.stat-card h1 {
  font-size: 42px;
  margin: 0;
}
.chart-box {
  height: 300px;
}

.chart-box.small {
  height: 240px;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 35px;
}

/* PANELS */
.panel {
  background: rgba(255,255,255,.75);
  backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(0,0,0,.08);
  animation: scaleIn .7s ease forwards;
}

.panel h3 {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  margin-bottom: 15px;
  color: #1e293b;
}

/* ARTICLES */
.article-list {
  margin-top: 15px;
  padding-left: 15px;
  max-height: 230px;
  overflow-y: auto;
}

.article-list li {
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
  color: #334155;
  border-left: 3px solid #6366f1;
  padding-left: 10px;
}

/* ANIMATIONS */
@keyframes fadeIn {
  from {opacity: 0;}
  to {opacity: 1;}
}

@keyframes slideUp {
  from {opacity: 0; transform: translateY(20px);}
  to {opacity: 1; transform: translateY(0);}
}

@keyframes scaleIn {
  from {opacity: 0; transform: scale(.95);}
  to {opacity: 1; transform: scale(1);}
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .stats {
    flex-direction: column;
  }
}
`;
