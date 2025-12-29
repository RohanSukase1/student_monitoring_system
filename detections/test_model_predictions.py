from ultralytics import YOLO
model = YOLO('D:/Projects/student_monitoring_system/models/id_card_model.pt')
result = model(source= "C:\\Users\\lenovo\\Pictures\\Camera Roll\\WIN_20251228_20_11_43_Pro.jpg")
result[0].show()