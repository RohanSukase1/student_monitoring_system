# import cv2
# import numpy as np
# from ultralytics import YOLO
# import os

# # ---------------- SETUP ----------------
# SAVE_DIR = "shirt_status_v2"
# os.makedirs(SAVE_DIR, exist_ok=True)
# model = YOLO("yolov8n-pose.pt")

# # ---------------- FUNCTIONS ----------------
# def avg_hsv(img):
#     if img.size == 0: return np.array([0, 0, 0])
#     hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
#     return np.mean(hsv.reshape(-1, 3), axis=0)

# # Improved White Shirt Detection (Area Percentage Rule)
# def is_white_shirt(bgr_crop):
#     if bgr_crop.size == 0:
#         return False
        
#     hsv = cv2.cvtColor(bgr_crop, cv2.COLOR_BGR2HSV)

#     # White is defined as Low Saturation (S) and High Brightness (V)
#     lower_white = np.array([0, 0, 130])
#     upper_white = np.array([180, 60, 255])

#     mask = cv2.inRange(hsv, lower_white, upper_white)
#     white_pixels = cv2.countNonZero(mask)
    
#     total_pixels = bgr_crop.shape[0] * bgr_crop.shape[1]
#     return white_pixels > (total_pixels * 0.10)

# # ---------------- PROCESS IMAGES ----------------
# def shirt_tucked2(frame):
#     if frame is None:
#         return "image_not_found", "UNKNOWN"

#     results = model(frame, verbose=False)

#     for r in results:
#         if r.keypoints is None or len(r.keypoints.xy[0]) < 13:
#             return "no_person", "UNKNOWN"

#         # Extract Keypoints
#         kp = r.keypoints.xy[0].cpu().numpy()
        
#         # 5=L_Shoulder, 6=R_Shoulder, 11=L_Hip, 12=R_Hip
#         l_shoulder = kp[5]
#         r_shoulder = kp[6]
#         l_hip = kp[11]
#         r_hip = kp[12]

#         if any(p[0] <= 0 or p[1] <= 0 for p in [l_shoulder, r_shoulder, l_hip, r_hip]):
#             return "not_detected", "UNKNOWN"

#         # --- TIGHT INSET BOUNDARY LOGIC ---
#         # Get independent widths for shoulders and hips
#         min_shoulder_x = min(l_shoulder[0], r_shoulder[0])
#         max_shoulder_x = max(l_shoulder[0], r_shoulder[0])
#         shoulder_width = max_shoulder_x - min_shoulder_x

#         min_hip_x = min(l_hip[0], r_hip[0])
#         max_hip_x = max(l_hip[0], r_hip[0])
#         hip_width = max_hip_x - min_hip_x
        
#         shoulder_y = int(min(l_shoulder[1], r_shoulder[1]))
#         hip_y = int(max(l_hip[1], r_hip[1]))
        
#         torso_height = hip_y - shoulder_y
        
#         if torso_height <= 10 or shoulder_width <= 5 or hip_width <= 5: 
#             return "not_detected", "UNKNOWN"

#         # ---------------- 1. CROP CHEST (Inside Shoulders) ----------------
#         # 10% inside the shoulders to guarantee we only grab shirt fabric
#         chest_x1 = int(min_shoulder_x + (shoulder_width * 0.10))
#         chest_x2 = int(max_shoulder_x - (shoulder_width * 0.10))
        
#         chest_y1 = int(shoulder_y + 0.15 * torso_height)
#         chest_y2 = int(shoulder_y + 0.50 * torso_height)
        
#         chest_x1, chest_x2 = max(0, chest_x1), min(frame.shape[1], chest_x2)
#         chest_y1, chest_y2 = max(0, chest_y1), min(frame.shape[0], chest_y2)
        
#         chest_crop = frame[chest_y1:chest_y2, chest_x1:chest_x2]
        
#         if chest_crop.size == 0:
#             return "not_detected", "UNKNOWN"

#         is_white = is_white_shirt(chest_crop)
#         if is_white:
#             shirt_status = "WHITE OK"
#             text_color = (0, 255, 0)
#         else:
#             shirt_status = "NOT W"
#             text_color = (0, 0, 255)

#         avg_shirt_color = avg_hsv(chest_crop)

#         # ---------------- 2. CROP HIP (Strictly Inside Hips) ----------------
#         # 15% inside the hips to completely eliminate background walls
#         hip_x1 = int(min_hip_x + (hip_width * 0.15))
#         hip_x2 = int(max_hip_x - (hip_width * 0.15))
        
#         hip_y1 = int(hip_y - (torso_height * 0.10))
#         hip_y2 = int(hip_y + (torso_height * 0.20))
        
#         hip_x1, hip_x2 = max(0, hip_x1), min(frame.shape[1], hip_x2)
#         hip_y1, hip_y2 = max(0, hip_y1), min(frame.shape[0], hip_y2)
        
#         hip_crop = frame[hip_y1:hip_y2, hip_x1:hip_x2]

#         if hip_crop.size == 0:
#             return "not_detected", shirt_status

#         tolerance = np.array([30, 60, 60]) 
#         lower_bound = np.clip(avg_shirt_color - tolerance, 0, 255).astype(np.uint8)
#         upper_bound = np.clip(avg_shirt_color + tolerance, 0, 255).astype(np.uint8)

#         hip_hsv = cv2.cvtColor(hip_crop, cv2.COLOR_BGR2HSV)
#         mask = cv2.inRange(hip_hsv, lower_bound, upper_bound)
        
#         matched_pixels = cv2.countNonZero(mask)
#         hip_area = hip_crop.shape[0] * hip_crop.shape[1]
        
#         min_pixels_required = int(hip_area * 0.02)

#         if matched_pixels > min_pixels_required:
#             status = "UNTUCKED"
#             tuck_color = (0, 0, 255)
#         else:
#             status = "TUCKED"
#             tuck_color = (0, 255, 0)

#         # ---------------- DRAWING ----------------
#         # Draw the new strictly inner crops
#         # cv2.rectangle(frame, (chest_x1, chest_y1), (chest_x2, chest_y2), text_color, 2)
#         # cv2.rectangle(frame, (hip_x1, hip_y1), (hip_x2, hip_y2), (255, 0, 0), 2)
        
#         # label = f"{status} | {shirt_status}"
#         # cv2.putText(frame, label, (chest_x1, max(20, shoulder_y - 30)), 
#         #             cv2.FONT_HERSHEY_SIMPLEX, 0.8, tuck_color, 2)

#         return status, shirt_status

#     return "no_person", "UNKNOWN"

import cv2
import numpy as np
from ultralytics import YOLO
import os

# ---------------- SETUP ----------------
SAVE_DIR = "shirt_status_v2"
os.makedirs(SAVE_DIR, exist_ok=True)
model = YOLO("yolov8n-pose.pt")

# ---------------- FUNCTIONS ----------------
def avg_hsv(img):
    if img.size == 0: return np.array([0, 0, 0])
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    return np.mean(hsv.reshape(-1, 3), axis=0)

# Improved White Shirt Detection (Area Percentage Rule)
def is_white_shirt(bgr_crop):
  

    if bgr_crop.size == 0:
        return False
        
    hsv = cv2.cvtColor(bgr_crop, cv2.COLOR_BGR2HSV)

    # Raised minimum Value (V) to 160 to exclude gray shirts.
    # Lowered maximum Saturation (S) to 60 to exclude pale blue/yellow shirts.
    lower_white = np.array([0, 0, 80]) 
    upper_white = np.array([180, 60, 255])

    mask = cv2.inRange(hsv, lower_white, upper_white)
    white_pixels = cv2.countNonZero(mask)
    
    total_pixels = bgr_crop.shape[0] * bgr_crop.shape[1]
    
    # Strictly require 50% of the cropped area to be white
    return white_pixels >= (total_pixels * 0.50)

# ---------------- PROCESS IMAGES ----------------
def shirt_tucked2(frame):
    if frame is None:
        return "image_not_found", "UNKNOWN"

    results = model(frame, verbose=False)

    for r in results:
        if r.keypoints is None or len(r.keypoints.xy[0]) < 13:
            return "no_person", "UNKNOWN"

        # Extract Keypoints
        kp = r.keypoints.xy[0].cpu().numpy()
        
        # 5=L_Shoulder, 6=R_Shoulder, 11=L_Hip, 12=R_Hip
        l_shoulder = kp[5]
        r_shoulder = kp[6]
        l_hip = kp[11]
        r_hip = kp[12]

        if any(p[0] <= 0 or p[1] <= 0 for p in [l_shoulder, r_shoulder, l_hip, r_hip]):
            return "not_detected", "UNKNOWN"

        # --- TIGHT INSET BOUNDARY LOGIC ---
        # Get independent widths for shoulders and hips
        min_shoulder_x = min(l_shoulder[0], r_shoulder[0])
        max_shoulder_x = max(l_shoulder[0], r_shoulder[0])
        shoulder_width = max_shoulder_x - min_shoulder_x

        min_hip_x = min(l_hip[0], r_hip[0])
        max_hip_x = max(l_hip[0], r_hip[0])
        hip_width = max_hip_x - min_hip_x
        
        shoulder_y = int(min(l_shoulder[1], r_shoulder[1]))
        hip_y = int(max(l_hip[1], r_hip[1]))
        
        torso_height = hip_y - shoulder_y
        
        if torso_height <= 10 or shoulder_width <= 5 or hip_width <= 5: 
            return "not_detected", "UNKNOWN"

        # ---------------- 1. CROP CHEST (Inside Shoulders) ----------------
        # 10% inside the shoulders to guarantee we only grab shirt fabric
        chest_x1 = int(min_shoulder_x + (shoulder_width * 0.10))
        chest_x2 = int(max_shoulder_x - (shoulder_width * 0.10))
        
        chest_y1 = int(shoulder_y + 0.15 * torso_height)
        chest_y2 = int(shoulder_y + 0.50 * torso_height)
        
        chest_x1, chest_x2 = max(0, chest_x1), min(frame.shape[1], chest_x2)
        chest_y1, chest_y2 = max(0, chest_y1), min(frame.shape[0], chest_y2)
        
        chest_crop = frame[chest_y1:chest_y2, chest_x1:chest_x2]
        
        if chest_crop.size == 0:
            return "not_detected", "UNKNOWN"

        is_white = is_white_shirt(chest_crop)
        if is_white:
            shirt_status = "WHITE OK"
            text_color = (0, 255, 0)
        else:
            shirt_status = "NOT W"
            text_color = (0, 0, 255)

        avg_shirt_color = avg_hsv(chest_crop)

        # ---------------- 2. CROP HIP (Strictly Inside Hips) ----------------
        # 15% inside the hips to completely eliminate background walls
        hip_x1 = int(min_hip_x + (hip_width * 0.13))
        hip_x2 = int(max_hip_x - (hip_width * 0.7))
        
        hip_y1 = int(hip_y - (torso_height * 0.10))
        hip_y2 = int(hip_y + (torso_height * 0.20))
        
        hip_x1, hip_x2 = max(0, hip_x1), min(frame.shape[1], hip_x2)
        hip_y1, hip_y2 = max(0, hip_y1), min(frame.shape[0], hip_y2)
        
        hip_crop = frame[hip_y1:hip_y2, hip_x1:hip_x2]

        if hip_crop.size == 0:
            return "not_detected", shirt_status

        tolerance = np.array([30, 60, 60]) 
        lower_bound = np.clip(avg_shirt_color - tolerance, 0, 255).astype(np.uint8)
        upper_bound = np.clip(avg_shirt_color + tolerance, 0, 255).astype(np.uint8)

        hip_hsv = cv2.cvtColor(hip_crop, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hip_hsv, lower_bound, upper_bound)
        
        matched_pixels = cv2.countNonZero(mask)
        hip_area = hip_crop.shape[0] * hip_crop.shape[1]
        
        min_pixels_required = int(hip_area * 0.02)

        if matched_pixels > min_pixels_required:
            status = "UNTUCKED"
            tuck_color = (0, 0, 255)
        else:
            status = "TUCKED"
            tuck_color = (0, 255, 0)

        # ---------------- DRAWING ----------------
        # Draw the new strictly inner crops
        # cv2.rectangle(frame, (chest_x1, chest_y1), (chest_x2, chest_y2), text_color, 2)
        # cv2.rectangle(frame, (hip_x1, hip_y1), (hip_x2, hip_y2), (255, 0, 0), 2)
        
        # label = f"{status} | {shirt_status}"
        # cv2.putText(frame, label, (chest_x1, max(20, shoulder_y - 30)), 
        #             cv2.FONT_HERSHEY_SIMPLEX, 0.8, tuck_color, 2)

        return status, shirt_status

    return "no_person", "UNKNOWN"