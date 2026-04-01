from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import pickle
import numpy as np
import os
import cv2

app = Flask(__name__)
CORS(app)

MODEL_PATH = "model/face_model.pkl"

# ─────────────────────────────
# LOAD MODEL
# ─────────────────────────────
def load_model():
    if not os.path.exists(MODEL_PATH):
        return None, None
    with open(MODEL_PATH, "rb") as f:
        data = pickle.load(f)
    return data["encodings"], data["labels"]


# ─────────────────────────────
# HEALTH CHECK
# ─────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running"})


# ─────────────────────────────
# FACE RECOGNITION
# ─────────────────────────────
@app.route("/recognize", methods=["POST"])
def recognize():

    if "image" not in request.files:
        return jsonify({"success": False, "message": "No image uploaded"})

    file = request.files["image"]

    try:
        file_bytes = file.read()
        np_arr = np.frombuffer(file_bytes, np.uint8)

        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"success": False, "message": "Invalid image file"})

        # Resize for faster processing
        img = cv2.resize(img, (0, 0), fx=0.5, fy=0.5)

        # Convert BGR → RGB
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Ensure correct type
        rgb = rgb.astype("uint8")

        # Detect face
        encodings = face_recognition.face_encodings(rgb)

        if not encodings:
            return jsonify({
                "success": False,
                "message": "No face detected"
            })

        known_encodings, known_labels = load_model()

        if known_encodings is None:
            return jsonify({
                "success": False,
                "message": "Model not trained yet"
            })

        matches = face_recognition.compare_faces(
            known_encodings, encodings[0], tolerance=0.5
        )

        distances = face_recognition.face_distance(
            known_encodings, encodings[0]
        )

        best = int(np.argmin(distances))

        if matches[best]:
            confidence = round((1 - distances[best]) * 100, 1)

            return jsonify({
                "success": True,
                "studentId": known_labels[best],
                "confidence": confidence
            })

        return jsonify({
            "success": False,
            "message": "Face not recognized"
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


# ─────────────────────────────
# TRAIN MODEL (🔥 FIXED)
# ─────────────────────────────
@app.route("/train", methods=["POST"])
def train():

    dataset_path = "dataset/"
    known_encodings = []
    known_labels = []

    if not os.path.exists(dataset_path):
        return jsonify({"message": "dataset/ folder not found"})

    for folder in os.listdir(dataset_path):

        folder_path = os.path.join(dataset_path, folder)

        if not os.path.isdir(folder_path):
            continue

        images_loaded = 0

        for img_file in os.listdir(folder_path):

            if not img_file.lower().endswith((".jpg", ".jpeg", ".png")):
                continue

            img_path = os.path.join(folder_path, img_file)

            try:
                # 🔥 FIXED IMAGE LOADING
                img = cv2.imread(img_path)

                if img is None:
                    print(f"❌ Cannot read {img_file}")
                    continue

                # 🔥 VERY IMPORTANT: resize (fix for mobile images)
                img = cv2.resize(img, (0, 0), fx=0.25, fy=0.25)

                # Convert BGR → RGB
                rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

                # Ensure correct format
                rgb = rgb.astype("uint8")

                # Detect face
                encs = face_recognition.face_encodings(rgb)

                if encs:
                    known_encodings.append(encs[0])
                    known_labels.append(folder)
                    images_loaded += 1
                    print(f"✅ Loaded {img_file} for {folder}")
                else:
                    print(f"❌ No face detected in {img_file}")

            except Exception as e:
                print(f"❌ Skipping {img_file}: {e}")

        print(f"📂 {folder}: {images_loaded} images processed")

    if not known_encodings:
        return jsonify({
            "message": "No valid faces found in dataset"
        })

    os.makedirs("model", exist_ok=True)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump({
            "encodings": known_encodings,
            "labels": known_labels
        }, f)

    return jsonify({
        "message": f"✅ Model trained with {len(known_encodings)} images for {len(set(known_labels))} students"
    })


# ─────────────────────────────
# RUN SERVER
# ─────────────────────────────
if __name__ == "__main__":
    print("🚀 Face Recognition Server running at http://localhost:5000")
    app.run(port=5000, debug=True)