import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Load datasets
fake = pd.read_csv("Fake.csv")
real = pd.read_csv("True.csv")

fake["label"] = 0   # Fake
real["label"] = 1   # Real

data = pd.concat([fake, real])
data = data.sample(frac=1).reset_index(drop=True)

# Combine title + text
data["content"] = data["title"] + " " + data["text"]

X = data["content"]
y = data["label"]

# Vectorizer
vectorizer = TfidfVectorizer(stop_words="english", max_df=0.7)
X = vectorizer.fit_transform(X)

# Train model
model = LogisticRegression()
model.fit(X, y)

# Save model + vectorizer
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("✅ Fake News Detection Model Trained Successfully")