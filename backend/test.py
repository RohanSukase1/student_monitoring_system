import cv2
import os

url = "rtsp://admin:admin@192.168.1.42:554/live/ch00_0"

cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)
print("Opened:", cap.isOpened())

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ No frame received")
        break

    cv2.imshow("Matrix CCTV", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
