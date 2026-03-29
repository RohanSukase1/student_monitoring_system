# AI Based Smart Student Monitoring System 

An AI-powered diploma final year project designed to automate student discipline monitoring and institutional entry management using **Computer Vision**, **Deep Learning**, and **Web Dashboards**.

## Problem statement 
In many schoolsand colleges the descipline monitoring is still a manual work, we obsereved this problem and tried to solve using computer vision and deep learning models.
<img width="1418" height="385" alt="image" src="https://github.com/user-attachments/assets/362d0472-0c3a-460a-b445-8415d13160a5" />


## Overview 
The **Smart Student Monitoring System** is an intelligent monitoring platform that detects and tracks student discipline-related activities at institutional entry points and inside campus premises.

The system uses **OpenCV**, **YOLOv8**, **YOLOv8-Pose**, and **Face Recognition models** to identify students, verify ID-card compliance, analyze discipline rules, and generate evidence-based alerts.

## Key Features
- Real-time student monitoring
- Face recognition-based entry logging
- Discipline rule analysis
- Evidence image capture
- Unknown person detection
- Automated alert generation
- Dashboard-based record management

## Main Modules

### 1. Face Recognition & Entry Monitoring
- Uses **InsightFace Buffalo_L** model for student face recognition
- Recognizes faces from approximately **25 feet**
- Captures entry timing at the **main gate**
- Stores recognized student records in the database

### 2. Discipline Checking Module
This module checks:
- **Valid ID card visibility**
- **Dress code compliance**
- **Shirt tucked / untucked detection**
- Student posture and appearance using **YOLOv8-Pose keypoints**

### 3. Security & Alert Generation
- Captures **evidence images** of each detected person
- Stores **unknown person images** separately
- Maintains timestamp-based records for each event
- Generates discipline-related alerts for students

### 4. Dashboard & Data Management
Two dashboards are designed for better usability:

#### Admin / Principal Dashboard
- Institution-wide monitoring summary
- Overall discipline statistics
- Centralized student activity overview

#### Department Dashboard
- Department-specific monitoring records
- Student evidence review
- Department-level action tracking

##  Tech Stack

### AI / Computer Vision
- Python
- OpenCV
- YOLOv8s
- YOLOv8s-Pose
- InsightFace (Buffalo_L)

### Backend
- Flask
- SQLite

### Frontend / Dashboard
- React
- Tailwind CSS


## Project Screenshots

<img width="1920" height="1080" alt="Screenshot (74)" src="https://github.com/user-attachments/assets/e96a6413-80f9-4160-aa5f-fc44a24813ef" />
<img width="1920" height="1080" alt="Screenshot 2026-02-26 211757" src="https://github.com/user-attachments/assets/d7e2e751-2048-47dd-9c43-0aef624eaaf2" />
<img width="1920" height="1080" alt="Screenshot (93)" src="https://github.com/user-attachments/assets/c6f9190c-13f8-4bc4-9c50-8bac5bf8a680" />
<img width="1920" height="1080" alt="Screenshot (76)" src="https://github.com/user-attachments/assets/67877f98-126b-4712-ba49-4e593ab7f07f" />

<img width="1920" height="1080" alt="Screenshot (84)" src="https://github.com/user-attachments/assets/86a9a447-630f-4963-b13a-7f84ecf4471b" />
<img width="1920" height="1080" alt="Screenshot (79)" src="https://github.com/user-attachments/assets/daebb35a-4ea9-4f02-99cd-5372831f9f81" />
<img width="1920" height="1080" alt="Screenshot (80)" src="https://github.com/user-attachments/assets/307f98f5-16a5-4b4d-808a-5359c2e43fd1" />
<img width="1920" height="1080" alt="Screenshot (81)" src="https://github.com/user-attachments/assets/c2977d61-9f53-4e1f-a0e5-33de2e9985dc" />
<img width="1920" height="1080" alt="Screenshot (82)" src="https://github.com/user-attachments/assets/00e18f3c-be16-4576-afac-65b85d0ee804" />
<img width="1920" height="1080" alt="Screenshot (83)" src="https://github.com/user-attachments/assets/c2a60f8b-0d78-4cd8-ac24-2ae521f48f0b" />
<img width="1920" height="1080" alt="Screenshot (94)" src="https://github.com/user-attachments/assets/e1ccdee9-0ca4-4dfe-a608-c195b77b27c7" />








