import cv2
import numpy as np
import os
from insightface.app import FaceAnalysis

# ---------------- LOAD FACE MODEL ----------------
face_app = FaceAnalysis(name="buffalo_l")
face_app.prepare(ctx_id=-1)   # CPU mode

# ---------------- UTILS ----------------
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def load_face_database(db_path="face_embeddings/"):
    embeddings = []
    names = []

    for person in os.listdir(db_path):
        person_folder = os.path.join(db_path, person)
        if not os.path.isdir(person_folder):
            continue

        for file in os.listdir(person_folder):
            if file.endswith(".npy"):
                emb = np.load(os.path.join(person_folder, file))
                embeddings.append(emb)
                names.append(person)

    print("Loaded identities:", set(names))
    return embeddings, names

db_embeddings, db_names = load_face_database()

# ---------------- RECOGNITION FUNCTION ----------------
def recognize_face_from_image(image_path, threshold=0.38):
    img = cv2.imread(image_path)
    if img is None:
        print("❌ Could not read image:", image_path)
        return

    faces = face_app.get(img)

    if len(faces) == 0:
        print("❌ No face detected.")
        return

    # Take largest face
    face = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0]) * (f.bbox[3]-f.bbox[1]))
    x1, y1, x2, y2 = map(int, face.bbox)

    # Add margin
    margin = 20
    x1 = max(0, x1 - margin)
    y1 = max(0, y1 - margin)
    x2 = min(img.shape[1], x2 + margin)
    y2 = min(img.shape[0], y2 + margin)

    face_crop = img[y1:y2, x1:x2]

    # ---------------- FACE SIZE ----------------
    h, w = face_crop.shape[:2]
    print(f"📐 Face size: {w}px (width) x {h}px (height)")

    if w < 80 or h < 80:
        print("⚠️ Face too small for reliable recognition")
        return

    # ---------------- RECOGNITION ----------------
    emb = face.embedding

    if len(db_embeddings) == 0:
        print("❌ No face database found")
        return

    sims = [cosine_similarity(emb, db_emb) for db_emb in db_embeddings]
    best_index = np.argmax(sims)
    best_score = sims[best_index]
    best_name = db_names[best_index]

    if best_score >= threshold:
        result = best_name
        color = (0, 255, 0)
        print(f"✅ Recognized as: {best_name} | Score: {best_score:.3f}")
    else:
        result = "Unknown"
        color = (0, 0, 255)
        print(f"❌ Not recognized | Best Score: {best_score:.3f}")

    # ---------------- SHOW IMAGE ----------------
    labeled = face_crop.copy()
    cv2.putText(
        labeled,
        f"{result} ({best_score:.2f})",
        (5, 25),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        color,
        2,
        cv2.LINE_AA
    )

    # cv2.imshow("Face Recognition Result", labeled)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


# ---------------- RUN TEST ----------------
if __name__ == "__main__":
    image_path = r"D:\Projects\student_monitoring_system\backend\output\recognition\unrecognized_faces\unknown_20260203_213749_990772.jpg"
    recognize_face_from_image(image_path)
