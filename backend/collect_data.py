import os
import sqlite3
import io
import time
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

# ================= CONFIGURATION =================
# 1. CORRECTED Google Sheet ID (Fixed the typo here)
SHEET_ID = '1WCWb74zw8vk-0rtM8nrxzrBZONAZcPllMYQiGTu1a9o' 

# 2. FULL PATH to your Credentials File
CREDENTIALS_FILE = r'D:\Projects\student_monitoring_system\backend\credentials.json'

# 3. Where to save the images
BASE_PHOTO_DIR = r"D:\Projects\student_monitoring_system\backend\face_images"

# Authenticate with Google
print("🔐 Authenticating with Google Cloud...")
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/drive.readonly']
creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=SCOPES)
sheet_service = build('sheets', 'v4', credentials=creds)
drive_service = build('drive', 'v3', credentials=creds)

def download_file(file_id, save_path):
    """Downloads a file from Google Drive to the local path."""
    request = drive_service.files().get_media(fileId=file_id)
    fh = io.FileIO(save_path, 'wb')
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while done is False:
        status, done = downloader.next_chunk()

def sync():
    print("🔄 Connecting to Google Sheets...")
    
    # --- STEP 1: AUTO-DETECT THE TAB NAME ---
    try:
        # Get the spreadsheet metadata to find the REAL name of the first tab
        spreadsheet_metadata = sheet_service.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
        sheets = spreadsheet_metadata.get('sheets', '')
        # Grab the title of the very first sheet (index 0)
        tab_name = sheets[0]['properties']['title']
        print(f"📡 Found Tab Name: '{tab_name}'")

        # Now read the data using the correct name
        result = sheet_service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID, 
            range=f"'{tab_name}'!A:G" 
        ).execute()
        rows = result.get('values', [])

    except Exception as e:
        print(f"❌ Error connecting to Sheet: {e}")
        return

    # Skip if only header exists
    if len(rows) <= 1:
        print("ℹ️ No student data found yet.")
        return

    print(f"📄 Found {len(rows)-1} student entries. Processing...")

    # --- STEP 2: CONNECT TO DATABASE ---
    conn = sqlite3.connect("students.db")
    cursor = conn.cursor()

    # Create table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            enrollment TEXT PRIMARY KEY,
            name TEXT,
            department TEXT,
            year TEXT,
            mobile TEXT
        )
    """)

    # --- STEP 3: PROCESS DATA ---
    for row in rows[1:]: # Skip the header row
        # Skip empty rows
        if len(row) < 5: 
            continue
            
        # Extract Data (CORRECTED INDEXES)
        try:
            enrollment = row[1]
            name = row[2].strip()
            dept = row[3]
            # Column E is index 4
            photo_links = row[4] if len(row) > 4 else "" 
            # Column F is index 5
            mobile = row[5] if len(row) > 5 else ""      
            # Column G is index 6
            year = row[6] if len(row) > 6 else ""        
        except IndexError:
            continue

        print(f"👤 Processing: {name} ({enrollment})")

        # Save to Database 
        cursor.execute("""
            INSERT OR REPLACE INTO students (enrollment, name, department, year, mobile)
            VALUES (?, ?, ?, ?, ?)
        """, (enrollment, name, dept, year, mobile))
        
        # Create Folder
        folder_name = name.replace(" ", "_")
        student_folder = os.path.join(BASE_PHOTO_DIR, folder_name)
        
        if not os.path.exists(student_folder):
            os.makedirs(student_folder, exist_ok=True)
            print(f"   📁 Created folder: {student_folder}")

        # Download Photos
        if photo_links and "http" in photo_links:
            links = photo_links.split(',')
            for i, link in enumerate(links):
                if "id=" in link:
                    file_id = link.split('id=')[-1].split('&')[0]
                    file_name = f"{folder_name}_{i+1}.jpg"
                    save_path = os.path.join(student_folder, file_name)
                    
                    if not os.path.exists(save_path):
                        print(f"   ⬇️  Downloading photo {i+1}...")
                        try:
                            download_file(file_id, save_path)
                        except Exception as e:
                            print(f"   ❌ Failed to download: {e}")
                    else:
                        print(f"   ✅ Photo {i+1} already exists.")

    conn.commit()
    conn.close()
    print("\n✨ Sync Complete! Database and Images are ready.")

if __name__ == "__main__":
    sync()