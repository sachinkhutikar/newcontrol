import os
import pickle
from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import requests
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from googletrans import Translator

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = pickle.load(open(os.path.join(BASE_DIR,"ml_model/model.pkl"), "rb"))
vectorizer = pickle.load(open(os.path.join(BASE_DIR,"ml_model/vectorizer.pkl"), "rb"))

# JWT
app.config["JWT_SECRET_KEY"] = "super-secret-key"
jwt = JWTManager(app)

API_KEY = "pub_0957aa5f1b47408fa492f5728c083ba6"


# =========================
# DATABASE INIT
# =========================
def init_db():

    conn = sqlite3.connect("news.db")
    cursor = conn.cursor()

    # USERS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    """)

    # NEWS TABLE (IMPORTANT FIX)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS news(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            image TEXT,
            link TEXT,
            category TEXT
        )
    """)

    # SAVED ARTICLES
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS saved_articles(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            description TEXT,
            image TEXT,
            link TEXT
        )
    """)

    conn.commit()
    conn.close()


# =========================
# FETCH NEWS FROM API
# =========================
@app.route("/")
def home():
    return "NewsControl Backend is running successfully 🚀"

@app.route("/api/fetch/<category>")
def fetch_news(category):

    url = f"https://newsdata.io/api/1/news?apikey={API_KEY}&country=in&category={category}"
    response = requests.get(url).json()
    articles = response.get("results", [])

    conn = sqlite3.connect("news.db")
    cursor = conn.cursor()

    count = 0

    for article in articles:
        try:
            cursor.execute("""
                INSERT OR IGNORE INTO news
                (title, description, image, link, category)
                VALUES (?, ?, ?, ?, ?)
            """, (
                article.get("title"),
                article.get("description"),
                article.get("image_url"),
                article.get("link"),
                category
            ))

            if cursor.rowcount > 0:
                count += 1

        except Exception as e:
            print("Insert error:", e)

    conn.commit()
    conn.close()

    return jsonify({"status": "stored", "count": count})



# =========================
# GET NEWS
# =========================
@app.route("/api/news")
def get_news():

    conn = sqlite3.connect("news.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT title, description, image, link, category
        FROM news
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    news = []

    for row in rows:

        news.append({
            "title": row[0],
            "description": row[1],
            "image": row[2],
            "link": row[3],
            "category": row[4]
        })

    return jsonify(news)


# =========================
# REGISTER
# =========================
@app.route("/api/register", methods=["POST"])
def register():

    data = request.json

    username = data.get("username")
    password = data.get("password")

    hashed = generate_password_hash(password)

    conn = sqlite3.connect("news.db")
    cursor = conn.cursor()

    try:

        cursor.execute(
            "INSERT INTO users(username,password) VALUES (?,?)",
            (username, hashed)
        )

        conn.commit()
        conn.close()

        return jsonify({"status": "success"})

    except:

        conn.close()

        return jsonify({
            "status": "error",
            "message": "User already exists"
        })


# =========================
# LOGIN
# =========================
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = sqlite3.connect("news.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id,password FROM users WHERE username=?", (username,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user[1], password):
        token = create_access_token(identity=user[0])
        return jsonify({
            "status": "success",
            "token": token,
            "user": {"id": user[0], "username": username}
        })

    return jsonify({"status": "error"})


# =========================
# SAVE ARTICLE
# =========================
@app.route("/api/save", methods=["POST"])
def save_article():

    data = request.json

    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"status": "error", "message": "Login required"})

    conn = sqlite3.connect("news.db")
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO saved_articles(user_id,title,description,image,link)
        VALUES(?,?,?,?,?)
    """, (
        user_id,
        data.get("title"),
        data.get("description"),
        data.get("image"),
        data.get("link")
    ))

    conn.commit()
    conn.close()

    return jsonify({"status": "saved"})


# =========================
# GET SAVED
# =========================
@app.route("/api/saved/<int:user_id>")
def get_saved(user_id):

    conn = sqlite3.connect("news.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT title,description,image,link
        FROM saved_articles
        WHERE user_id=?
    """, (user_id,))

    rows = cursor.fetchall()

    conn.close()

    articles = []

    for row in rows:

        articles.append({
            "title": row[0],
            "description": row[1],
            "image": row[2],
            "link": row[3]
        })

    return jsonify(articles)

@app.route("/api/trending/articles")
def trending_articles():
    conn = sqlite3.connect("news.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT title, COUNT(*) as total
        FROM saved_articles
        GROUP BY title
        ORDER BY total DESC
        LIMIT 5
    """)

    rows = cursor.fetchall()
    conn.close()

    return jsonify([{"title": r[0], "count": r[1]} for r in rows])

@app.route("/api/trending/categories")
def trending_categories():
    conn = sqlite3.connect("news.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT category, COUNT(*) as total
        FROM news
        GROUP BY category
        ORDER BY total DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    return jsonify([{"category": r[0], "count": r[1]} for r in rows])

@app.route("/api/trending/stats")
def platform_stats():
    conn = sqlite3.connect("news.db")
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM users")
    users = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM news")
    news = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM saved_articles")
    saves = cursor.fetchone()[0]

    conn.close()

    return jsonify({
        "users": users,
        "articles": news,
        "saves": saves
    })
@app.route("/api/predict", methods=["POST"])
def predict_fake_news():
    data = request.json
    text = data.get("text")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    vector = vectorizer.transform([text])
    prediction = model.predict(vector)[0]
    prob = model.predict_proba(vector)[0]

    confidence = round(max(prob) * 100, 2)

    return jsonify({
        "prediction": "REAL" if prediction == 1 else "FAKE",
        "confidence": confidence
    })


translator = Translator()

@app.route("/api/translate", methods=["POST"])
def translate_text():
    data = request.json
    text = data.get("text")
    target = data.get("target", "hi")   # default Hindi

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        result = translator.translate(text, dest=target)
        return jsonify({
            "translated": result.text,
            "source": result.src,
            "target": target
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# =========================
# START SERVER
# =========================
if __name__ == "__main__":

    init_db()

    print("Server running on https://newcontrol-1.onrender.com")

    app.run(debug=True, port=5001)
