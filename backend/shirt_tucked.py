# import cv2
# import numpy as np
# from ultralytics import YOLO
# import os
# from datetime import datetime

# SAVE_DIR = "dressing"
# TUCKED_DIR = os.path.join(SAVE_DIR, "tucked")
# UNTUCKED_DIR = os.path.join(SAVE_DIR, "untucked")

# os.makedirs(TUCKED_DIR, exist_ok=True)
# os.makedirs(UNTUCKED_DIR, exist_ok=True)

# # Load pose model
# model = YOLO("yolov8n-pose.pt")

# # Folder path
# image_folder = "captured_images"

# status=""

# # ---------------- FUNCTIONS ----------------
# def avg_hsv(img):
#     hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
#     return np.mean(hsv.reshape(-1, 3), axis=0)

# def color_distance(c1, c2):
#     return np.linalg.norm(c1 - c2)

# # ---------------- PROCESS IMAGES ----------------
# def shirt_tucked1(frame):

#     if frame is None:
#         return "image_not_found", None

#     results = model(frame)

#     for r in results:
#         if r.keypoints is None:
#             return "no_person", None

#         for kp in r.keypoints.xy:

#             l_shoulder = kp[5]
#             r_shoulder = kp[6]
#             l_hip = kp[11]
#             r_hip = kp[12]

#             # Validate keypoints
#             if any(p[0] <= 0 or p[1] <= 0 for p in [l_shoulder, r_shoulder, l_hip, r_hip]):
#                 return "not_detected", None

#             x1 = int(min(l_shoulder[0], r_shoulder[0]))
#             x2 = int(max(l_shoulder[0], r_shoulder[0]))

#             shoulder_y = int(min(l_shoulder[1], r_shoulder[1]))
#             hip_y = int(max(l_hip[1], r_hip[1]))

#             if x2 <= x1 or hip_y <= shoulder_y:
#                 return "not_detected", None

#             shirt_sample = frame[shoulder_y:shoulder_y + 60, x1:x2]
#             hip_line = frame[hip_y-10:hip_y-5, x1:x2]

#             if shirt_sample.size == 0 or hip_line.size == 0:
#                 return "not_detected", None

#             shirt_color = avg_hsv(shirt_sample)
#             hip_color = avg_hsv(hip_line)

#             diff = color_distance(shirt_color, hip_color)

#             if diff < 30:
#                 status = "UNTUCKED"
#                 color = (0, 0, 255)
#                 save_dir = UNTUCKED_DIR
#             else:
#                 status = "TUCKED"
#                 color = (0, 255, 0)
#                 save_dir = TUCKED_DIR

#             # Draw on image
#             cv2.putText(frame, status,
#                         (x1, shoulder_y - 8),
#                         cv2.FONT_HERSHEY_SIMPLEX,
#                         0.8, color, 2)

#             cv2.rectangle(frame, (x1, shoulder_y), (x2, shoulder_y + 60), (255, 0, 0), 2)
#             cv2.rectangle(frame, (x1, hip_y - 10), (x2, hip_y-5), (0, 255, 255), 2)

#             # Save image
#             timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#             filename = f"{status}_{timestamp}.jpg"
#             save_path = os.path.join(save_dir, filename)

#             cv2.imwrite(save_path, frame)

#             return status, save_path

#     return "no_person", None
import cv2
import numpy as np
from ultralytics import YOLO
import os
from datetime import datetime

# ---------------- BASE OUTPUT STRUCTURE ----------------
BASE_OUTPUT_DIR = "output"

DRESSING_DIR = os.path.join(BASE_OUTPUT_DIR, "dressing")
TUCKED_DIR = os.path.join(DRESSING_DIR, "tucked")
UNTUCKED_DIR = os.path.join(DRESSING_DIR, "untucked")

os.makedirs(TUCKED_DIR, exist_ok=True)
os.makedirs(UNTUCKED_DIR, exist_ok=True)

# ---------------- MODEL ----------------
model = YOLO("models/yolov8n-pose.pt")

# ---------------- UTILS ----------------
def avg_hsv(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    return np.mean(hsv.reshape(-1, 3), axis=0)

def color_distance(c1, c2):
    return np.linalg.norm(c1 - c2)

# ---------------- MAIN FUNCTION ----------------
def shirt_tucked1(frame):

    if frame is None:
        return "image_not_found", None

    results = model(frame)

    for r in results:
        if r.keypoints is None:
            return "no_person", None

        for kp in r.keypoints.xy:

            l_shoulder = kp[5]
            r_shoulder = kp[6]
            l_hip = kp[11]
            r_hip = kp[12]

            # Validate keypoints
            if any(p[0] <= 0 or p[1] <= 0 for p in [l_shoulder, r_shoulder, l_hip, r_hip]):
                return "not_detected", None

            x1 = int(min(l_shoulder[0], r_shoulder[0]))
            x2 = int(max(l_shoulder[0], r_shoulder[0]))

            shoulder_y = int(min(l_shoulder[1], r_shoulder[1]))
            hip_y = int(max(l_hip[1], r_hip[1]))

            if x2 <= x1 or hip_y <= shoulder_y:
                return "not_detected", None

            # Regions of interest
            shirt_sample = frame[shoulder_y:shoulder_y + 60, x1:x2]
            hip_line = frame[hip_y - 10:hip_y - 5, x1:x2]

            if shirt_sample.size == 0 or hip_line.size == 0:
                return "not_detected", None

            # Color comparison
            shirt_color = avg_hsv(shirt_sample)
            hip_color = avg_hsv(hip_line)
            diff = color_distance(shirt_color, hip_color)

            if diff < 30:
                status = "UNTUCKED"
                color = (0, 0, 255)
                save_root = UNTUCKED_DIR
            else:
                status = "TUCKED"
                color = (0, 255, 0)
                save_root = TUCKED_DIR

            # ---------------- DATE FOLDER ----------------
            today = datetime.now().strftime("%Y-%m-%d")
            save_dir = os.path.join(save_root, today)
            os.makedirs(save_dir, exist_ok=True)

            # ---------------- DRAW ON IMAGE ----------------
            display_frame = frame.copy()

            cv2.putText(display_frame, status,
                        (x1, shoulder_y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5, color, 1)

            cv2.rectangle(display_frame,
                          (x1, shoulder_y),
                          (x2, shoulder_y + 60),
                          (255, 0, 0), 2)

            cv2.rectangle(display_frame,
                          (x1, hip_y - 10),
                          (x2, hip_y - 5),
                          (0, 255, 255), 2)

            # ---------------- SAVE IMAGE ----------------
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{status}_{timestamp}.jpg"
            save_path = os.path.join(save_dir, filename)

            cv2.imwrite(save_path, display_frame)
            print("Dressing saved:", save_path)

            return status, save_path

    return "no_person", None
