import cv2
from ultralytics import YOLO
capture = cv2.VideoCapture(0)
model=YOLO("D:/Projects/student_monitoring_system/models/id_card_model.pt")
#model = YOLO("C:/Users/lenovo/Desktop/Programming/Datasets/Dataset_2/runs/detect/train3/weights/best.pt")


while True:
    isAvailable ,frame = capture.read()
    if isAvailable :
       result = model(source=frame,conf=0.10)
       annotation = result[0].plot()
       cv2.imshow("Live Tracking ",annotation)
    else:
       print("Something went wrong")
       break
    if cv2.waitKey(1) == ord("q") :
       print("Quitting")
       break
capture.release()
cv2.destroyAllWindows()