import cv2
import os
import numpy as np
from insightface.app import FaceAnalysis

# Initialize InsightFace
app = FaceAnalysis(name="buffalo_l")
app.prepare(ctx_id=0)   # -1 for CPU, 0 for GPU

input_folder = "face_images"
output_folder = "face_embeddings"

os.makedirs(output_folder, exist_ok=True)

for person_name in os.listdir(input_folder):
    person_path = os.path.join(input_folder, person_name)

    if not os.path.isdir(person_path):
        continue

    print(f"\nProcessing: {person_name}")

    save_person_path = os.path.join(output_folder, person_name)
    os.makedirs(save_person_path, exist_ok=True)

    count = 0

    for img_file in os.listdir(person_path):
        if not img_file.lower().endswith((".jpg", ".png", ".jpeg")):
            continue

        img_path = os.path.join(person_path, img_file)
        img = cv2.imread(img_path)

        if img is None:
            print("Could not read:", img_file)
            continue

        faces = app.get(img)

        if len(faces) == 0:
            print(f"No face detected in {img_file}")
            continue

        if len(faces) > 1:
            print(f"Multiple faces detected in {img_file}, skipping")
            continue

        emb = faces[0].embedding
        save_path = os.path.join(save_person_path, f"{count}.npy")
        np.save(save_path, emb)

        print(f"Saved embedding: {save_path}")
        count += 1

    if count == 0:
        print(f"⚠ No valid face found for {person_name}")
    else:
        print(f"✅ {count} faces registered for {person_name}")

print("\nFace registration from images completed.")
