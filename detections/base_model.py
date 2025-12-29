from ultralytics import YOLO

import cv2
import math
import os
import time

model=YOLO("yolov8n-pose.pt")
model2=YOLO("D:/Projects/student_monitoring_system/models/id_card_model.pt")
def distance(p1, p2):
    return ((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2) ** 0.5

def blur_score(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()

def is_face_visible(keypoints):
    nose = keypoints[0]
    left_eye = keypoints[1]
    right_eye = keypoints[2]

    # All face keypoints must exist
    if nose[0] <= 0.1 or nose[1] <= 1:
        return False
    if left_eye[0] <= 0.1 or left_eye[1] <= 1:
        return False
    if right_eye[0] <= 0.1 or right_eye[1] <= 1:
        return False

    return True

def is_front_facing(keypoints):
    left_eye = keypoints[1]
    right_eye = keypoints[2]

    eye_y_diff = abs(left_eye[1] - right_eye[1])

    # If eyes are not level → face rotated
    if eye_y_diff > 15:
        return False

    return True

    

    # Back view → face very small or invisible
    


frame_buffer={}

best_image= None

folder = "captured_images"
if not os.path.exists(folder):
    os.mkdir(folder)

cap=cv2.VideoCapture(0)
saved_id=set()
current_ids = set()


while True:
    ret,frame=cap.read()
    if not ret:
        break
    result = model.track(
        frame,
        persist=True,
        tracker="botsort.yaml",
        conf=0.75,
        iou=0.6,
        classes=[0]  # person only
    )
    frame_show=result[0].plot()
    

    if result[0].boxes is not None:
        
        
        for i, box in enumerate(result[0].boxes):
            if box.id is None:
                continue
            track_id = int(box.id[0])
            current_ids.add(track_id)

            if track_id in saved_id:
                continue
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            keypoints=result[0].keypoints.xy[i]
            conf=result[0].keypoints.conf[i]
        

            if conf.mean() < 0.5:
                continue


            nose= keypoints[0]
            l_eye= keypoints[1]
            r_eye= keypoints[2]
            l_shoulder= keypoints[5]
            r_shoulder= keypoints[6]
            l_hip= keypoints[11]
            r_hip= keypoints[12]
            l_knee=keypoints[13]
            r_knee=keypoints[14]
            knee=keypoints[14]
            l_ankle=keypoints[15]
            r_ankle=keypoints[16]

            

            if nose[0] <=300 and l_eye[0] <= 300 and r_eye[0] <= 300:
                print("not  Front face detected")
                continue


            
        

            body_parts=[nose,l_eye,r_eye,l_shoulder,r_shoulder,l_hip,r_hip,l_knee,r_knee,l_ankle,r_ankle]


            for part in body_parts:
                if part[0]<=0 or part[1]<0:
                    continue
            
            # Allow at least ONE ankle visible
            ankle_visible = (
            (l_ankle[0] > 0 and l_ankle[1] > 0) or
            (r_ankle[0] > 0 and r_ankle[1] > 0)
                 )

            if not ankle_visible:
                continue
            

            eye_diff = abs(l_eye[1] - r_eye[1])
            shoulder_diff = abs(l_shoulder[1] - r_shoulder[1])

            shoulder_width = distance(l_shoulder, r_shoulder)
            body_height = distance(nose, l_ankle)

            knee_visible = (
            (l_knee[0] > 0 and l_knee[1] > 0) or
            (r_knee[0] > 0 and r_knee[1] > 0)
                 )
            if not knee_visible:
                continue

            if not is_face_visible(keypoints):
                continue
            if not is_front_facing(keypoints):
                continue


            if body_height ==0:
                continue

            width_ratio = shoulder_width / body_height

            print(f" _width_ratio :{width_ratio}")

            

            if width_ratio < 0.10 or width_ratio > 0.60:
                continue
        

            person_crop = frame[y1:y2, x1:x2]
            if person_crop.size == 0:
                continue

            score = blur_score(person_crop)
                # store frames temporarily
            min_blur = 20 if shoulder_width < 100 else 50
            if score < min_blur:
                continue
            if track_id not in frame_buffer:
                frame_buffer[track_id] = []

            frame_buffer[track_id].append((score, person_crop))
            frame_buffer[track_id] = sorted(
                frame_buffer[track_id],
                    key=lambda x: x[0],
                        reverse=True
                    )[:5]
            
                
            if len(frame_buffer[track_id]) == 3:
                best_image = frame_buffer[track_id][0][1]
                filename = f"{folder}/person_{track_id}.jpg"
                cv2.imwrite(filename, best_image)
                print(" Saved sharp image:", filename)
                saved_id.add(track_id)
                del frame_buffer[track_id]

                results_id = model2(best_image)
                for r in results_id:
                    for box in r.boxes:
                        cls_id = int(box.cls[0])
                        conf = float(box.conf[0])
                        print(f"🆔 Detected: {model2.names[cls_id]}  |  Confidence: {conf:.2f}")
                
    
    cv2.putText(
    frame_show,
    f"Students: {len(current_ids)}",
    (30, 50),
    cv2.FONT_HERSHEY_SIMPLEX,
    1.2,
    (0, 255, 0),
    3
)
    cv2.imshow("Front View Detection", frame_show)

    

    if cv2.waitKey(1)==ord("q"):
        break
cap.release()
cv2.destroyAllWindows()