import cv2
import numpy as np
from ultralytics import YOLO
from datetime import datetime, timedelta
import os
import atexit
from flask import Flask, Response, jsonify, request, send_file
from flask_cors import CORS
from insightface.app import FaceAnalysis
import threading
import queue
import time
import sqlite3
import torch
import bcrypt
import jwt
import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS


# --- IMPORT LOGIC MODULE ---
try:
    import shirt_tuck 
except ImportError:
    print("WARNING: shirt_tuck.py not found. Logic will skip shirt analysis.")

app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = "mysecret_production_key"

# ---------------- CONFIGURATION & HARDWARE ----------------
print("--- SYSTEM STARTUP ---")
print("YOLO GPU available:", torch.cuda.is_available())
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Running on: {DEVICE}")

# Prevent OpenCV from spawning too many threads (conflicts with PyTorch)
cv2.setNumThreads(1)

# --- LOCKS ---
count_lock = threading.Lock()       # Protects global counters
results_lock = threading.Lock()     # Protects processed results for display
visual_lock = threading.Lock()      # Protects bounding box data for video feed
inference_lock = threading.Lock()   # CRITICAL: Prevents GPU contention

# --- QUEUES ---
processing_queue = queue.Queue(maxsize=30)  # Holds frames waiting for AI
log_queue = queue.Queue(maxsize=1000)       # Holds DB entries
save_queue = queue.Queue(maxsize=1000)      # Holds images to write to disk

# --- STATE MANAGEMENT ---
processing_ids = set() 
saved_id = set() 
processed_results = {} 
visual_data = {} 

# ---------------- DIRECTORIES ----------------
BASE_DIR = "output1"
CAPTURED_DIR = os.path.join(BASE_DIR, "captured_image")
DETECTION_DIR = os.path.join(BASE_DIR, "detections", "id_card_detection")
DRESSING_DIR = os.path.join(BASE_DIR, "dressing")
TUCKED_DIR = os.path.join(DRESSING_DIR, "tucked")
UNTUCKED_DIR = os.path.join(DRESSING_DIR, "untucked")
RECOGNITION_DIR = os.path.join(BASE_DIR, "recognition")
RECOGNIZED_DIR = os.path.join(RECOGNITION_DIR, "recognized_faces")
UNRECOGNIZED_DIR = os.path.join(RECOGNITION_DIR, "unrecognized_faces")

for d in [CAPTURED_DIR, DETECTION_DIR, RECOGNITION_DIR, RECOGNIZED_DIR, UNRECOGNIZED_DIR, TUCKED_DIR, UNTUCKED_DIR]:
    os.makedirs(d, exist_ok=True)

# ---------------- DATABASE INIT ----------------
def init_db():
    """Initializes the database tables if they do not exist."""
    with sqlite3.connect("student_monitoring.db") as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                time TEXT,
                enrollment TEXT,
                name TEXT,
                department TEXT,
                year TEXT,
                mobile TEXT,
                recognized INTEGER,
                discipline INTEGER,
                id_card INTEGER,
                shirt_tucked INTEGER,
                image_path TEXT
            )
        """)
    
    with sqlite3.connect("users.db") as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password_hash BLOB,
                role TEXT
            )
        """)
init_db()

# ---------------- MODELS ----------------
print("Loading Models...")

# 1. Pose Model (Fast Tracking)
model = YOLO("yolov8n-pose.pt")

# 2. ID Card Model
id_model_path = r"D:\\Projects\\student_monitoring_system\\models\\id_card_model_v2.pt"
if not os.path.exists(id_model_path):
    print(f"Warning: ID Model not found")
    model2 = YOLO("yolov8n.pt") 
else:
    model2 = YOLO(id_model_path)

# 3. Face Analysis
providers = ["CUDAExecutionProvider"] if DEVICE == "cuda" else ["CPUExecutionProvider"]
face_app = FaceAnalysis(name="buffalo_l", providers=providers)
face_app.prepare(ctx_id=0 if DEVICE == "cuda" else -1)

# Load Face Embeddings
db_embeddings = []
db_names = []

def load_face_database(db_path="D:\\Projects\\student_monitoring_system\\backend\\face_embeddings"):
    global db_embeddings, db_names
    if not os.path.exists(db_path):
        print(f"Warning: Face DB path {db_path} not found.")
        return
    
    loaded_names = []
    for person in os.listdir(db_path):
        person_folder = os.path.join(db_path, person)
        if not os.path.isdir(person_folder): continue

        for file in os.listdir(person_folder):
            if file.endswith(".npy"):
                try:
                    emb = np.load(os.path.join(person_folder, file))
                    db_embeddings.append(emb)
                    db_names.append(person)
                    loaded_names.append(person)
                except Exception: pass
    print(f"Loaded {len(loaded_names)} identities.")

load_face_database()
print("Models Loaded.")

# ---------------- GLOBAL COUNTS ----------------
ui_count = {
    "is_online": 1,
    "live_flow": 0,         
    "total_scanned": 0,
    "disciplined_total": 0,
    "undisciplined_total": 0,
    "id_card_yes_total": 0,
    "id_card_no_total": 0,
    "white_dress_total": 0,
    "improper_dress_total": 0,
    "tucked_total": 0,
    "untucked_total": 0,
    "recognized_total": 0,
    "unrecognized": 0,
    "staff_total": 0,
    "discipline_rate_total": 0.0,

    # --- AN (AI & ML) Department ---
    "recognized_an": 0, "disciplined_an": 0, "undisciplined_an": 0, "discipline_rate_an": 0.0,
    "id_card_yes_an": 0, "id_card_no_an": 0, "white_dress_an": 0, "improper_dress_an": 0,
    "tucked_an": 0, "untucked_an": 0,

    # --- AN FY ---
    "recognized_an_fy": 0, "disciplined_an_fy": 0, "undisciplined_an_fy": 0, "discipline_rate_an_fy": 0.0,
    "id_card_yes_an_fy": 0, "id_card_no_an_fy": 0, "white_dress_an_fy": 0, "improper_dress_an_fy": 0,
    "tucked_an_fy": 0, "untucked_an_fy": 0,

    # --- AN SY ---
    "recognized_an_sy": 0, "disciplined_an_sy": 0, "undisciplined_an_sy": 0, "discipline_rate_an_sy": 0.0,
    "id_card_yes_an_sy": 0, "id_card_no_an_sy": 0, "white_dress_an_sy": 0, "improper_dress_an_sy": 0,
    "tucked_an_sy": 0, "untucked_an_sy": 0,

    # --- AN TY ---
    "recognized_an_ty": 0, "disciplined_an_ty": 0, "undisciplined_an_ty": 0, "discipline_rate_an_ty": 0.0,
    "id_card_yes_an_ty": 0, "id_card_no_an_ty": 0, "white_dress_an_ty": 0, "improper_dress_an_ty": 0,
    "tucked_an_ty": 0, "untucked_an_ty": 0,

    # --- CO (Computer) Department ---
    "recognized_co": 0, "disciplined_co": 0, "undisciplined_co": 0, "discipline_rate_co": 0.0,
    "id_card_yes_co": 0, "id_card_no_co": 0, "white_dress_co": 0, "improper_dress_co": 0,
    "tucked_co": 0, "untucked_co": 0,
    
    # Internal usage for Rate Calculation
    "_scanned_an": 0, "_scanned_an_fy": 0, "_scanned_an_sy": 0, "_scanned_an_ty": 0, "_scanned_co": 0
}

# ---------------- CAMERA THREAD ----------------
class CameraStream:
    def __init__(self, src=0):
        self.stream = cv2.VideoCapture(src)
        if not self.stream.isOpened():
            print("Warning: IP Camera not found, switching to webcam...")
            self.stream = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        
        self.stream.set(cv2.CAP_PROP_BUFFERSIZE, 1) # Reduce lag
        self.ret, self.frame = self.stream.read()
        self.stopped = False
        self.lock = threading.Lock()

    def start(self):
        t = threading.Thread(target=self.update, args=(), daemon=True)
        t.start()
        return self

    def update(self):
        while True:
            if self.stopped: return
            ret, frame = self.stream.read()
            with self.lock:
                self.ret = ret
                self.frame = frame
            time.sleep(0.001)

    def read(self):
        with self.lock:
            return self.ret, self.frame.copy() if self.frame is not None else None

    def release(self):
        self.stopped = True
        self.stream.release()

# UPDATE IP ADDRESS HERE
url = "http://192.0.0.4:8080/video"
url1="rtsp://admin:Admin@123@192.168.1.126:554/live/ch00_0"
camera_stream = CameraStream(url).start()

@atexit.register
def cleanup():
    camera_stream.release()

# ---------------- HELPER FUNCTIONS ----------------
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def distance(p1, p2):
    return ((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2) ** 0.5

def blur_score(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()

def is_full_body(x1, y2, img_w, img_h):
    valid_left = x1 >= -50
    valid_bottom = y2 <= img_h + 50
    return valid_left and valid_bottom

def keypoint_visible(keypoints, conf, idx, min_conf=0.60):
    return conf[idx] > min_conf and keypoints[idx][0] > 0 and keypoints[idx][1] > 0

def ankle_knee_visible(keypoints, conf, idx, min_conf=0.65):
    return conf[idx] > min_conf and keypoints[idx][0] > 0 and keypoints[idx][1] > 0

def normalize_dept_year(dept_str, year_str):
    d_key = None
    y_key = None
    
    if dept_str:
        d_lower = str(dept_str).lower().strip()
        if "artificial" in d_lower or "aiml" in d_lower or "ai & ml" in d_lower or "an" == d_lower:
            d_key = "an"
        elif "computer" in d_lower or "comp" in d_lower or "co" in d_lower:
            d_key = "co"
            
    if year_str:
        y_lower = str(year_str).lower().strip()
        # Robust check for FY, SY, TY, 1, 2, 3, First, Second, Third
        if y_lower in ["fy", "first", "1", "fe", "i"]: y_key = "fy"
        elif y_lower in ["sy", "second", "2", "se", "ii"]: y_key = "sy"
        elif y_lower in ["ty", "third", "3", "te", "iii"]: y_key = "ty"
        
    return d_key, y_key

def update_counter_set(category_suffix, is_disciplined, id_yes, is_white, is_tucked, is_recognized):
    suffix = f"_{category_suffix}" if category_suffix else "_total"
    
    # Internal counter for rate calculation
    if category_suffix: 
        internal_key = f"_scanned{suffix}"
        if internal_key in ui_count: ui_count[internal_key] += 1
    
    if is_recognized: ui_count[f"recognized{suffix}"] += 1
    
    if is_disciplined: ui_count[f"disciplined{suffix}"] += 1
    else: ui_count[f"undisciplined{suffix}"] += 1
    
    if id_yes: ui_count[f"id_card_yes{suffix}"] += 1
    else: ui_count[f"id_card_no{suffix}"] += 1
    
    if is_white: ui_count[f"white_dress{suffix}"] += 1
    else: ui_count[f"improper_dress{suffix}"] += 1
    
    if is_tucked: ui_count[f"tucked{suffix}"] += 1
    else: ui_count[f"untucked{suffix}"] += 1

# ---------------- BACKGROUND WORKERS ----------------

def db_logger_worker():
    conn = sqlite3.connect("student_monitoring.db", timeout=30.0, check_same_thread=False)
    try:
        conn.execute("PRAGMA journal_mode=WAL;") 
        conn.commit()
    except Exception as e:
        print(f"WAL Mode Error: {e}")
        
    cursor = conn.cursor()
    print("--- DB Worker Running ---")
    
    while True:
        data = log_queue.get()
        retry_count = 0
        max_retries = 5
        saved = False
        
        while retry_count < max_retries:
            try:
                cursor.execute("""
                    INSERT INTO entries (
                        date, time, enrollment, name, department, year, mobile,
                        recognized, discipline, id_card, shirt_tucked, image_path
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    data["date"], data["time"], data["enrollment"], data["name"],
                    data["department"], data["year"], data["mobile"],
                    int(data["recognized"]), int(data["discipline"]), 
                    int(data["id_card"]), int(data["shirt_tucked"]), 
                    data["image_path"]
                ))
                conn.commit()
                saved = True
                break
            except sqlite3.OperationalError as e:
                if "locked" in str(e).lower():
                    retry_count += 1
                    time.sleep(0.2)
                else:
                    print(f"SQLite Error: {e}")
                    break 
            except Exception as e:
                print(f"DB Worker Error: {e}")
                break
        
        if not saved:
            print(f"Failed to save DB entry for {data.get('name', 'Unknown')}")
            
        log_queue.task_done()

def file_writer_worker():
    while True:
        try:
            path, img = save_queue.get()
            cv2.imwrite(path, img)
        except Exception as e:
            print(f"File Save Error: {e}")
        finally:
            save_queue.task_done()

def get_student_by_name(recognized_name):
    if not recognized_name or recognized_name.lower() in ["unknown", "no face", "no database"]:
        return None
    try:
        with sqlite3.connect("students.db", timeout=10.0) as conn:
            c = conn.cursor()
            c.execute("SELECT enrollment, name, department, year, mobile FROM students WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))", (recognized_name,))
            row = c.fetchone()
            if row:
                return {"enrollment": row[0], "name": row[1], "department": row[2], "year": row[3], "mobile": row[4]}
    except Exception as e:
        # Silently fail if student DB doesn't exist
        pass
    return None

# ---------------- CORE PROCESSING ----------------

def recognize_face_fast(full_frame, keypoints, db_embeddings, db_names, threshold=0.5):
    nose, l_eye, r_eye = keypoints[0], keypoints[1], keypoints[2]
    l_sh, r_sh = keypoints[5], keypoints[6]

    if nose[0] <= 0: return "No Face", False, None

    h, w = full_frame.shape[:2]
    sh_width = distance(l_sh, r_sh)
    half_width = int(sh_width * 0.65) if sh_width > 60 else 90
    center_x = int(nose[0])

    valid_eyes = (l_eye[1] > 0 and r_eye[1] > 0)
    eye_y = min(l_eye[1], r_eye[1]) if valid_eyes else nose[1]
    head_height = abs(nose[1] - eye_y) * 2.5
    top = int(eye_y - head_height)

    chest_y = int((l_sh[1] + r_sh[1]) / 2)
    bottom = int(chest_y + 0.3 * sh_width)

    x1 = max(0, center_x - half_width)
    x2 = min(w, center_x + half_width)
    y1 = max(0, top)
    y2 = min(h, bottom)

    face_crop = full_frame[y1:y2, x1:x2]
    if face_crop.size == 0: return "No Face", False, None

    # --- INFERENCE LOCK (Crucial for GPU Safety) ---
    with inference_lock:
        faces = face_app.get(face_crop)
    
    if len(faces) == 0: return "No Face", False, face_crop

    face = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0]) * (f.bbox[3]-f.bbox[1]))
    
    if len(db_embeddings) == 0: return "No Database", False, face_crop

    sims = [cosine_similarity(face.embedding, db) for db in db_embeddings]
    best_i = np.argmax(sims)

    if sims[best_i] >= threshold:
        return db_names[best_i], True, face_crop
    
    return "Unknown", False, face_crop

def async_save_image(img, folder, filename):
    path = os.path.join(folder, filename)
    try:
        save_queue.put_nowait((path, img))
    except queue.Full:
        pass 
    return path

def processing_worker():
    while True:
        try:
            data = processing_queue.get()
            track_id = data['track_id']
            full_frame = data['full_frame']
            best_person_crop = data['best_person_crop']
            keypoints = data['keypoints']
            xyxy = data['xyxy']
            
            timestamp = datetime.now().strftime("%Y_%m_%d_%H_%M_%S")

            # --- SHIRT LOGIC ---
            shirt_status = "UNKNOWN"
            color_status = "UNKNOWN"
            try:
                if 'shirt_tuck' in globals():
                    shirt_status, color_status = shirt_tuck.shirt_tucked2(best_person_crop)
            except Exception: pass

            # --- ID CARD LOGIC ---
            id_detected = False
            try:
                upper_y = max(0, int(keypoints[5][1] - 20))
                lower_y = int(keypoints[11][1])
                crop_y1 = int(xyxy[1])
                local_y1 = max(0, upper_y - crop_y1)
                local_y2 = min(best_person_crop.shape[0], lower_y - crop_y1)
                
                torso_crop = best_person_crop[local_y1:local_y2, :] if local_y2 > local_y1 else best_person_crop[0:int(best_person_crop.shape[0]*0.6), :]

                if torso_crop.size > 0:
                    # Thread safe inference for ID card
                    with inference_lock:
                        results_id = model2(best_person_crop, verbose=False, conf=0.15)
                    
                    for r in results_id:
                        for b in r.boxes:
                            if int(b.cls[0]) == 0: 
                                id_detected = True
                                display_id_status = "Yes"
                                async_save_image(r.plot(), DETECTION_DIR, f"id_{track_id}_{timestamp}.jpg")
                                break
            except Exception: pass

            # --- FACE RECOGNITION ---
            person_name, is_recognized, face_crop = recognize_face_fast(full_frame, keypoints, db_embeddings, db_names)
            
            display_name = person_name if person_name else "Unknown"
            student_info = None
            if is_recognized:
                student_info = get_student_by_name(person_name)
                if student_info:
                    display_name = f"{student_info['name']} ({student_info['enrollment']})"
            
            # --- EVALUATE STATUS FIRST ---
            is_white = (color_status == "WHITE OK")
            is_tucked = (shirt_status == "TUCKED")
            is_disciplined = is_white and is_tucked and id_detected

            # Evidence Saving
            image_path = ""
            if is_recognized:
                folder = os.path.join(RECOGNIZED_DIR, person_name)
                os.makedirs(folder, exist_ok=True)
                fname = f"{person_name}_{timestamp}.jpg"
                text_color = (0, 255, 0) # Green for recognized
            else:
                folder = UNRECOGNIZED_DIR
                fname = f"unknown_{timestamp}.jpg"
                display_name = "Unknown" 
                text_color = (0, 0, 255) # Red for unrecognized
            
            if best_person_crop is not None and best_person_crop.size > 0:
                labeled_img = best_person_crop.copy()
                
                # 1. Prepare the text lines
                overlay_lines = [
                    f"{display_name}",
                    f"ID Card: {'Yes' if id_detected else 'No'}",
                    f"Shirt Tucked: {'Yes' if is_tucked else 'No'}",
                    f"White Shirt: {'Yes' if is_white else 'No'}"
                ]
                
                # 2. Draw text with proper alignment and a black outline for readability
                start_y = 150
                line_spacing = 15
                font_scale = 0.4
                
                for i, line in enumerate(overlay_lines):
                    y = start_y + (i * line_spacing)
                    # Draw a slightly thicker black outline first so text is visible on any shirt color
                    cv2.putText(labeled_img, line, (5, y), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 0, 0), 2, cv2.LINE_AA)
                    # Draw the actual colored text over it
                    cv2.putText(labeled_img, line, (5, y), cv2.FONT_HERSHEY_SIMPLEX, font_scale, text_color, 1, cv2.LINE_AA)
                
                image_path = async_save_image(labeled_img, folder, fname)
            # --- UPDATE COUNTS ---
            is_white = (color_status == "WHITE OK")
            is_tucked = (shirt_status == "TUCKED")
            is_disciplined = is_white and is_tucked and id_detected
            
            dept_key = None
            year_key = None
            is_staff = False

            if student_info:
                dept_str = student_info.get("department", "")
                year_str = student_info.get("year", "")
                dept_key, year_key = normalize_dept_year(dept_str, year_str)
                
                if "staff" in str(dept_str).lower() or "faculty" in str(dept_str).lower():
                    is_staff = True

            with count_lock:
                # 1. Global Updates
                ui_count["total_scanned"] += 1
                if not is_recognized: ui_count["unrecognized"] += 1
                if is_staff: ui_count["staff_total"] += 1

                update_counter_set(None, is_disciplined, id_detected, is_white, is_tucked, is_recognized)

                # 2. Department & Year Specific Updates
                if dept_key == "an":
                    # Update generic AN counts
                    update_counter_set("an", is_disciplined, id_detected, is_white, is_tucked, is_recognized)
                    
                    # Update specific Year counts (FY, SY, TY)
                    if year_key == "fy":
                        update_counter_set("an_fy", is_disciplined, id_detected, is_white, is_tucked, is_recognized)
                    elif year_key == "sy":
                        update_counter_set("an_sy", is_disciplined, id_detected, is_white, is_tucked, is_recognized)
                    elif year_key == "ty":
                        update_counter_set("an_ty", is_disciplined, id_detected, is_white, is_tucked, is_recognized)

                elif dept_key == "co":
                    # Update generic CO counts
                    update_counter_set("co", is_disciplined, id_detected, is_white, is_tucked, is_recognized)

            # --- DB ENTRY ---
            now = datetime.now()
            entry_data = {
                "date": now.strftime("%Y-%m-%d"),
                "time": now.strftime("%H:%M:%S"),
                "enrollment": student_info["enrollment"] if student_info else "NA",
                "name": student_info["name"] if student_info else person_name,
                "department": student_info["department"] if student_info else "Unknown",
                "year": student_info["year"] if student_info else "Unknown",
                "mobile": student_info["mobile"] if student_info else "NA",
                "recognized": is_recognized,
                "discipline": is_disciplined,
                "id_card": id_detected,
                "shirt_tucked": is_tucked,
                "image_path": image_path
            }
            log_queue.put(entry_data)

            # --- SHARED RESULT UPDATES ---
            final_color = (0, 255, 0) if is_disciplined else (0, 0, 255)
            shirt_str = f"{shirt_status}/{'White' if is_white else 'Color'}"

            with results_lock:
                processed_results[track_id] = {
                    "name": display_name,
                    "shirt": shirt_str,
                    "id": "Yes" if id_detected else "No",
                    "color": final_color,
                    "timestamp": time.time()
                }
            
            processing_ids.discard(track_id)
            processing_queue.task_done()

        except Exception as e:
            print(f"Worker Error: {e}")
            if 'track_id' in locals(): processing_ids.discard(track_id)

# START THREADS
for _ in range(3): 
    t = threading.Thread(target=processing_worker, daemon=True)
    t.start()
t = threading.Thread(target=db_logger_worker, daemon=True)
t.start()
t = threading.Thread(target=file_writer_worker, daemon=True)
t.start()

# ---------------- CAMERA LOGIC LOOP ----------------
track_enter_time = {}
frame_buffer = {}

def camera_processing_loop():
    print("--- Camera Logic Started ---")
    while True:
        ret, frame = camera_stream.read()
        if not ret or frame is None:
            time.sleep(0.01)
            continue

        frame_h, frame_w = frame.shape[:2]

        # TRACKING 
        # Note: If this crashes with CUDNN errors, wrap this line in "with inference_lock:"
        results = model.track(frame, persist=True, tracker="botsort.yaml", conf=0.6, verbose=False, classes=[0])

        current_boxes = [] 
        current_frame_ids = set()

        if results[0].boxes is not None and results[0].boxes.id is not None:
            boxes = results[0].boxes
            keypoints_data = results[0].keypoints.xy
            conf_data = results[0].keypoints.conf

            for i, box in enumerate(boxes):
                track_id = int(box.id[0])
                current_frame_ids.add(track_id)
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                
                current_boxes.append({
                    "id": track_id,
                    "coords": (x1, y1, x2, y2)
                })

                if track_id in saved_id or track_id in processing_ids:
                    continue

                # Stabilization
                now = time.time()
                if track_id not in track_enter_time:
                    track_enter_time[track_id] = now
                
                if (now - track_enter_time[track_id]) < 1.0: continue

                if not is_full_body(x1, y2, frame_w, frame_h): continue

                kpts = keypoints_data[i]
                confs = conf_data[i]

                if not (keypoint_visible(kpts, confs, 0) and keypoint_visible(kpts, confs, 1)): continue
                if not ((ankle_knee_visible(kpts, confs, 13) or ankle_knee_visible(kpts, confs, 14))): continue

                person_crop = frame[y1:y2, x1:x2]
                if person_crop.size == 0: continue

                score = blur_score(person_crop)
                if score < 40: continue

                # Buffer Frames to find best shot
                frame_buffer.setdefault(track_id, [])
                frame_buffer[track_id].append({
                    "score": score,
                    "crop": person_crop,
                    "frame": frame.copy(),
                    "box": [x1, y1, x2, y2],
                    "kpts": kpts.cpu().numpy()
                })

                frame_buffer[track_id] = sorted(frame_buffer[track_id], key=lambda x: x["score"], reverse=True)[:3]

                # Trigger Processing if enough good frames gathered
                if len(frame_buffer[track_id]) >= 2:
                    best = frame_buffer[track_id][0]
                    packet = {
                        "track_id": track_id,
                        "full_frame": best["frame"],
                        "best_person_crop": best["crop"],
                        "keypoints": best["kpts"],
                        "xyxy": best["box"]
                    }
                    try:
                        processing_queue.put_nowait(packet)
                        processing_ids.add(track_id)
                        saved_id.add(track_id)
                        del frame_buffer[track_id]
                    except queue.Full:
                        pass
        
        with count_lock:
            ui_count["live_flow"] = len(current_frame_ids)

        with visual_lock:
            visual_data.clear()
            for b in current_boxes:
                visual_data[b["id"]] = b["coords"]

        time.sleep(0.01)

threading.Thread(target=camera_processing_loop, daemon=True).start()

# ---------------- API ROUTES ----------------

@app.route('/count')
def counts():
    with count_lock:
        # Calculate rates dynamically based on accumulated totals
        if ui_count["total_scanned"] > 0:
            ui_count["discipline_rate_total"] = round((ui_count["disciplined_total"] / ui_count["total_scanned"]) * 100, 2)
        else:
            ui_count["discipline_rate_total"] = 0.0

        if ui_count["_scanned_an"] > 0:
            ui_count["discipline_rate_an"] = round((ui_count["disciplined_an"] / ui_count["_scanned_an"]) * 100, 2)

        for y in ["fy", "sy", "ty"]:
            scanned = ui_count.get(f"_scanned_an_{y}", 0)
            disciplined = ui_count.get(f"disciplined_an_{y}", 0)
            if scanned > 0:
                ui_count[f"discipline_rate_an_{y}"] = round((disciplined / scanned) * 100, 2)

        if ui_count["_scanned_co"] > 0:
            ui_count["discipline_rate_co"] = round((ui_count["disciplined_co"] / ui_count["_scanned_co"]) * 100, 2)

        # Filter out internal keys starting with "_"
        response_data = {k: v for k, v in ui_count.items() if not k.startswith("_")}
        
        return jsonify(response_data)

@app.route("/entries")
def get_entries():
    try:
        with sqlite3.connect("student_monitoring.db", timeout=10.0) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM entries ORDER BY date DESC, time DESC LIMIT 200")
            rows = cursor.fetchall()
            return jsonify([dict(row) for row in rows])
    except Exception as e:
        print(f"API Error: {e}")
        return jsonify([])

@app.route('/video_feed')
def video_feed():
    def generate():
        while True:
            ret, frame = camera_stream.read()
            if not ret: 
                time.sleep(0.02)
                continue
            
            boxes_to_draw = {}
            with visual_lock:
                boxes_to_draw = visual_data.copy()
            
            labels_to_draw = {}
            with results_lock:
                labels_to_draw = processed_results.copy()
            
            for tid, coords in boxes_to_draw.items():
                x1, y1, x2, y2 = coords
                
                if tid in labels_to_draw:
                    data = labels_to_draw[tid]
                    label = data['name']
                    sub_label = f"{data['shirt']} | ID:{data['id']}"
                    color = data['color']
                    
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, label, (x1, y1 - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                    cv2.putText(frame, sub_label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
                
                elif tid in processing_ids:
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
                    cv2.putText(frame, "Processing...", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                
                else:
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (200, 200, 200), 1)

            _, buffer = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/evidence")
def serve_evidence():
    path = request.args.get("path", "")
    path = os.path.normpath(path)
    if not path.startswith(BASE_DIR): return "Access denied", 403
    if not os.path.isfile(path): return "File not found", 404
    return send_file(path, mimetype="image/jpeg")

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    if not data: return jsonify({"error": "No data"}), 400
    username = data.get("username")
    password = data.get("password")
    try:
        conn = sqlite3.connect("users.db", timeout=10.0)
        cur = conn.cursor()
        cur.execute("SELECT password_hash, role FROM users WHERE username=?", (username,))
        row = cur.fetchone()
        conn.close()
        if not row: return jsonify({"error": "Invalid username"}), 401
        pw_hash, role = row
        if isinstance(pw_hash, str): pw_hash = pw_hash.encode('utf-8')
        if bcrypt.checkpw(password.encode('utf-8'), pw_hash):
            token = jwt.encode({
                "username": username, "role": role,
                "exp": datetime.utcnow() + timedelta(hours=12)
            }, app.config["SECRET_KEY"], algorithm="HS256")
            return jsonify({"token": token, "role": role})
        return jsonify({"error": "Invalid password"}), 401
    except Exception as e:
        return jsonify({"error": "Server error"}), 500



    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=False)
