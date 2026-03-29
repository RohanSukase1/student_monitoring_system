

from flask import Flask, Response
import cv2
import numpy as np
from ultralytics import YOLO
from datetime import datetime
import pytz
import sys
import os
import shirt_tuck
import atexit
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
sys.path.append(BASE_DIR)
from insightface.app import FaceAnalysis


# ---------------- FLASK ----------------
app = Flask(__name__)



ui_count = {
    "student_count": 0,
    "shirt_tucked": 0,
    "shirt_untucked": 0,
    "id_card_yes": 0,
    "id_card_no": 0,
    "violation": 0 ,
    "disciplined": 0,
    "not_shirt_white": 0,
    "shirt_white": 0
}



# ---------------- STORAGE (LIST , SET , DICTIONARY , GLOBAL VARIABLE ETC) ----------------
saved_id = set()
current_ids = set()
frame_buffer = {}
violated_ids = set()   
disciplined_ids = set()
close_image_saved = set()
recognized_names = {}
global_next_id = 1
seen_tracks = {}   # yolo_id -> our_custom_id   

# ---------------- DIRECTORY STRUCTURE----------------------------------------------------

SAVE_DIR = "Project_Output"

capture_images = os.path.join(SAVE_DIR, "Capture_images")
face_capture = os.path.join(SAVE_DIR, "face_detection")

RECOGNIZED_DIR = os.path.join(face_capture, "face_recognize")
UNRECOGNIZED_DIR = os.path.join(face_capture, "un_recognize")


os.makedirs(capture_images, exist_ok=True)
os.makedirs(face_capture, exist_ok=True)
os.makedirs(RECOGNIZED_DIR, exist_ok=True)
os.makedirs(UNRECOGNIZED_DIR, exist_ok=True)


# ---------------- ALL FUNCTIONS THOSE NEED TO PROJECTS ----------------

# @atexit.register
# def release_camera():
#     cap.release()


def distance(p1, p2):
    return ((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2) ** 0.5

def is_full_body(x1, y2, img_w, img_h, margin=10):
    return x1 > margin and y2 < img_h - margin

def blur_score(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()

def keypoint_visible(keypoints, conf, idx, min_conf=0.60):
    return conf[idx] > min_conf and keypoints[idx][0] > 0 and keypoints[idx][1] > 0

def ankle_knee_visible(keypoints, conf, idx, min_conf=0.65):
    
    return conf[idx] > min_conf and keypoints[idx][0] > 0 and keypoints[idx][1] > 0

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


# ---------------------face saved-----------------
def save_face_image(face_crop, name, is_recognized=True):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")

    if is_recognized:
        person_folder = os.path.join(RECOGNIZED_DIR, name)
        os.makedirs(person_folder, exist_ok=True)
        filename = f"{name}_{timestamp}.jpg"
        save_path = os.path.join(person_folder, filename)
        label_text = name
        color = (0, 255, 0)   
    else:
        filename = f"unknown_{timestamp}.jpg"
        save_path = os.path.join(UNRECOGNIZED_DIR, filename)
        label_text = "Unknown"
        color = (0, 0, 255)   # Red for unknown
    labeled_img = face_crop.copy()

    # Position for text
    h, w = labeled_img.shape[:2]
    text_pos = (10,30)

    cv2.putText(
        labeled_img,
        label_text,
        text_pos,
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        color,
        1,
        cv2.LINE_AA

    )

    # ---------------- SAVE IMAGE ----------------
    cv2.imwrite(save_path, labeled_img)
    print("Saved face:", save_path)

#---------------- face recognization-------------------------

def recognize_face_from_crop(face_crop, threshold=0.5):
    faces = face_app.get(face_crop)

    if len(faces) == 0:
        return "No Face", 0.0                                                   

    # Take the largest detected face in crop
    face = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0]) * (f.bbox[3]-f.bbox[1]))
    emb = face.embedding

    if len(db_embeddings) == 0:
        return "No Database", 0.0

    sims = [cosine_similarity(emb, db_emb) for db_emb in db_embeddings]
    best_index = np.argmax(sims)
    best_score = sims[best_index]

    if best_score >= threshold:
        return db_names[best_index], float(best_score)
    else:
        return "Unknown", float(best_score)

def load_face_database(db_path="D:\\Projects\\student_monitoring_system\\backend\\face_embeddings"):
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

db_embeddings, db_names= load_face_database()


# ----------------  YOLO MODELS ----------------

model = YOLO("D:\\Projects\\student_monitoring_system\\models\\yolov8n-pose.pt")
model2 = YOLO("D:\\Projects\\student_monitoring_system\models\\id_card_model.pt")
face_app = FaceAnalysis(name="buffalo_l")
face_app.prepare(ctx_id=1)   # CPU mode


# ---------------- CAMERA VIDIO CAPTURE PROGRAM  ----------------

# url = "http://10.69.223.41:8080/video"
url = "http://10.119.130.31:8080/video"
cap = cv2.VideoCapture(0)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
# FACE_CLOSE_EYE_DIST = 30  # controls distance (IMPORTANT)



# ---------------- VIDEO STREAM MAIN PROGRAM ----------------
def get_frames():
    global saved_id, frame_buffer, current_ids
    global global_next_id


    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_h, frame_w = frame.shape[:2]

        result = model.track(
            frame,
            persist=True,
            tracker="botsort.yaml",
            conf=0.7,
            iou=0.6,
            classes=[0]
        )

        frame_show = result[0].plot()
        ui_count["student_count"] = len(current_ids)

        if result[0].boxes is not None:
            for i, box in enumerate(result[0].boxes):
                if box.id is None:
                    continue

                yolo_id = int(box.id[0])

                if yolo_id not in seen_tracks:
                    seen_tracks[yolo_id] = global_next_id
                    global_next_id += 1

                track_id = seen_tracks[yolo_id]
                current_ids.add(track_id)
                if track_id in saved_id:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])
                # dispay person name on frame
            #     if track_id in recognized_names:
            #         display_name = recognized_names[track_id]
            #     else:
            #         display_name = "Unknown"

            #     cv2.putText(                
            #         frame_show,
            #         display_name,
            #     (x1, y1 - 10),
            #      cv2.FONT_HERSHEY_SIMPLEX,
            #      0.7,
            #     (0, 255, 0),
            #     2
            #     )


                keypoints = result[0].keypoints.xy[i]
                conf = result[0].keypoints.conf[i]

                nose, l_eye, r_eye = keypoints[0], keypoints[1], keypoints[2]
                l_sh, r_sh = keypoints[5], keypoints[6]
                l_ankle = keypoints[15]

                if nose[0] <= 0 and l_eye[0] <= 0 and r_eye[0] <= 0:
                    continue

                face_visible = (
                    keypoint_visible(keypoints, conf, 0) and
                    (keypoint_visible(keypoints, conf, 1) or
                     keypoint_visible(keypoints, conf, 2))
                )
                if not face_visible:
                    continue

            


                if not is_full_body(x1, y2, frame_w, frame_h):
                    cv2.putText(frame_show, "BODY NOT FULL",
                                (30, 80), cv2.FONT_HERSHEY_SIMPLEX,
                                1, (0, 0, 255), 3)
                    continue

                if not (ankle_knee_visible(keypoints, conf, 13) or
                        ankle_knee_visible(keypoints, conf, 14)):
                    continue

                if not (ankle_knee_visible(keypoints, conf, 15) or
                        ankle_knee_visible(keypoints, conf, 16)):
                    continue

                shoulder_width = distance(l_sh, r_sh)
                body_height = distance(nose, l_ankle)
                if body_height == 0:
                    continue

                person_crop = frame[y1:y2, x1:x2]
                if person_crop.size == 0:
                    continue

                score = blur_score(person_crop)
                min_blur = 40 if shoulder_width < 80 else 80
                if score < min_blur:
                    continue

                frame_buffer.setdefault(track_id, [])
                frame_buffer[track_id].append((score, person_crop))
                frame_buffer[track_id] = sorted(
                    frame_buffer[track_id],
                    key=lambda x: x[0],
                    reverse=True
                )[:5]
                if len(frame_buffer[track_id]) == 3:
                    best_image = frame_buffer[track_id][0][1]
                    time = datetime.now().strftime("%Y_%m_%d_%H_%M")


                    cv2.imwrite(f"{capture_images}/id_{track_id}_{time}.png", best_image)

                    # ---------------- FACE RECOGNITION ----------------
                    faces = face_app.get(best_image)

                    face_found = False

                    if len(faces) == 0:
                       name, score = "No Face", 0.0
                    else:
                       face = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0]) * (f.bbox[3]-f.bbox[1]))
                       x1f, y1f, x2f, y2f = map(int, face.bbox)

                       face_crop = best_image
                       
                       face_found = True


                    # ---------------- HALF BODY CROP (HEAD TO HIP) ----------------
                    h, w = frame.shape[:2]   # IMPORTANT: use ORIGINAL FRAME

                     # Face bbox is in best_image coords, convert to full-frame coords
                    if face_found:
                         x1f_full = x1 + x1f
                         y1f_full = y1 + y1f
                         x2f_full = x1 + x2f
                         y2f_full = y1 + y2f

                    # Pose keypoints are already in full-frame coords
                    shoulder_y = int(min(l_sh[1], r_sh[1]))
                    hip_y = int(max(keypoints[11][1], keypoints[12][1]))

                    if face_found:
                       top = max(0, y1f_full - 20)
                       left = max(0, min(x1f_full, int(l_sh[0]), int(r_sh[0])) - 20)
                       right = min(w, max(x2f_full, int(l_sh[0]), int(r_sh[0])) + 20)
                    else:
                       top = max(0, shoulder_y - 30)
                       left = max(0, min(int(l_sh[0]), int(r_sh[0])) - 40)
                       right = min(w, max(int(l_sh[0]), int(r_sh[0])) + 40)

                    bottom = min(h, hip_y + 10)

                    # Final safety check
                    if bottom > top and right > left:
                       half_body_crop = frame[top:bottom, left:right]   # <-- CROP FROM FULL FRAME
                    else:
                       half_body_crop = frame[y1:y2, x1:x2]             # fallback = person crop

                    name, score = recognize_face_from_crop(half_body_crop, threshold=0.5)




                    if name != "Unknown" and name != "No Face":
                       save_face_image(half_body_crop, name, is_recognized=True)
                    else:
                       save_face_image(half_body_crop, "unknown", is_recognized=False)

                    # -------- ID CARD --------
                    id_found = False
                    try:
                        results_id = model2(best_image)
                        for r in results_id:
                            for b in r.boxes:
                                cls_id = int(b.cls[0])
                                if model2.names[cls_id] == "id_card" and float(b.conf[0]) > 0.1:
                                    id_found = True
                                    break
                    except Exception as e:
                        print("ID card error:", e)
                    if id_found:
                        ui_count["id_card_yes"] += 1
                    else:
                        ui_count["id_card_no"] += 1


                    # -------- SHIRT TUCK --------
                    try:
                        shirt_status , _Color_= shirt_tuck.shirt_tucked2(best_image)
                        if _Color_ == "WHITE OK":
                            ui_count["shirt_white"] += 1
                        else:
                            ui_count["not_shirt_white"] += 1

                        if shirt_status == "TUCKED":
                            ui_count["shirt_tucked"] += 1
                        else:
                            ui_count["shirt_untucked"] += 1

                    except Exception as e:
                        print("Shirt tuck error:", e)
                    
                    if id_found and shirt_status == "TUCKED":
    # DISCIPLINED STUDENT
                        if track_id not in disciplined_ids:
                           
                            disciplined_ids.add(track_id)
                            ui_count["disciplined"] = len(disciplined_ids)
                    else:
                        # VIOLATION STUDENT
                        if track_id not in violated_ids:

                            ui_count["violation"] += 1
                            violated_ids.add(track_id)

                    saved_id.add(track_id)
                    
                    del frame_buffer[track_id]

        # cv2.putText(frame_show,
        #             f"Students: {len(current_ids)}",
        #             (30, 50),
        #             cv2.FONT_HERSHEY_SIMPLEX,
        #             1.2,
        #             (0, 255, 0),
        #             3)

        _, buffer = cv2.imencode(".jpg", frame_show)
        frame_bytes = buffer.tobytes()

        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" +
               frame_bytes + b"\r\n")



# ---------------- ROUTES ----------------
# @app.route("/")
# def index():
#     return render_template("index.html")
from flask import jsonify

@app.route("/count")
def counts():
    return jsonify(ui_count)

from flask_cors import CORS
CORS(app)


@app.route("/video_feed")
def video_feed():
    return Response(
        get_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )






# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)