from flask import Flask, Response, render_template
import cv2
import numpy as np
from ultralytics import YOLO
from datetime import datetime
import pytz
import os
import shirt_tucked
import atexit
from flask_cors import CORS
app = Flask(__name__)
CORS(app)



# ---------------- MODELS ----------------
model = YOLO("yolov8n-pose.pt")
model2 = YOLO("D:\\Projects\\student_monitoring_system\models\\id_card_model.pt")

# ---------------- CAMERA ----------------
# url="http://10.142.236.225:8080/video"
# cap = cv2.VideoCapture(url)
cap=cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

ui_count = {
    "is_online":1,
    "student_count": 0,
    "shirt_tucked": 0,
    "shirt_untucked": 0,
    "id_card_yes": 0,
    "id_card_no": 0
    
}
@atexit.register
def release_camera():
    cap.release()

# ---------------- STORAGE ----------------
saved_id = set()
current_ids = set()
frame_buffer = {}

folder = "captured_images"
folder2 = "id_card_detection"
os.makedirs(folder, exist_ok=True)
os.makedirs(folder2, exist_ok=True)

# ---------------- UTILS ----------------
def reset_ui_count():
    ui_count["shirt_tucked"] = 0
    ui_count["shirt_untucked"] = 0
    ui_count["id_card_yes"] = 0
    ui_count["id_card_no"] = 0

def distance(p1, p2):
    return ((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2) ** 0.5

def is_full_body(x1, y2, img_w, img_h, margin=5):
    return x1 > margin and y2 < img_h - margin

def blur_score(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()

def keypoint_visible(keypoints, conf, idx, min_conf=0.60):
    return conf[idx] > min_conf and keypoints[idx][0] > 0 and keypoints[idx][1] > 0

def ankle_knee_visible(keypoints, conf, idx, min_conf=0.65):
    return conf[idx] > min_conf and keypoints[idx][0] > 0 and keypoints[idx][1] > 0

# ---------------- VIDEO STREAM ----------------
def get_frames():
    global saved_id, frame_buffer, current_ids
    while True:
        if not cap.isOpened():
            # If camera isn't ready, wait a bit instead of crashing the loop
            cv2.waitKey(1000)
            continue
            
        ret, frame = cap.read()
    
    
        if not ret:
            break
        # reset_ui_count()
        # current_ids.clear()
        ui_count["is_online"]=1
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
        current_ids.clear()
        

        if result[0].boxes is not None:
            for i, box in enumerate(result[0].boxes):
                if box.id is None:
                    continue

                track_id = int(box.id[0])
                current_ids.add(track_id)

                if track_id in saved_id:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                if not is_full_body(x1, y2, frame_w, frame_h):
                    cv2.putText(frame_show, "BODY NOT FULL",
                                (30, 80), cv2.FONT_HERSHEY_SIMPLEX,
                                1, (0, 0, 255), 3)
                    continue

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
                min_blur = 20 if shoulder_width < 80 else 60
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

                    cv2.imwrite(f"{folder}/id_{track_id}_{time}.png", best_image)

                    # -------- ID CARD --------
                    id_found = False
                    try:
                        results_id = model2(best_image)
                        for r in results_id:
                            for b in r.boxes:
                                cls_id = int(b.cls[0])
                                if model2.names[cls_id] == "id_card" and float(b.conf[0]) > 0.1:
                                    time=datetime.now().strftime("%Y_%m_%d_%H_%M")

                                    filename = f"{folder2}/id{track_id}_{time}.jpg"
                                    image=results_id[0].plot()
                                    cv2.imwrite(filename,image)
                                    print(" Saved sharp image:", filename)
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
                        shirt_status,__path__ = shirt_tucked.shirt_tucked1(best_image)

                        if shirt_status == "TUCKED":
                            ui_count["shirt_tucked"] += 1
                        else:
                            ui_count["shirt_untucked"] += 1

                    except Exception as e:
                        print("Shirt tuck error:", e)

                    saved_id.add(track_id)
                    del frame_buffer[track_id]
        ui_count["student_count"] = len(current_ids)

        cv2.putText(frame_show,
                    f"Students: {len(current_ids)}",
                    (30, 50),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1.2,
                    (0, 255, 0),
                    3)

        _, buffer = cv2.imencode(".jpg", frame_show)
        frame_bytes = buffer.tobytes()

        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" +
               frame_bytes + b"\r\n")

    

@app.route("/video_feed")
def video_feed():
    return Response(
        get_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )
from flask import jsonify

@app.route("/count")
def counts():
    return jsonify(ui_count)
# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False,threaded=True)