# main.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from datetime import datetime
import csv
from collections import defaultdict
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from fastapi.middleware.cors import CORSMiddleware
import json 
import ast
from fastapi.responses import FileResponse
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload, MediaIoBaseUpload
import io

app = FastAPI()
SERVICE_ACCOUNT_FILE = 'credentials.json'
SCOPES = ['https://www.googleapis.com/auth/drive']
credentials = Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=credentials)

class SurveyData(BaseModel):
    email: str
    platform: str
    apps: list
    ratings: dict
    feedback: str

# def is_email_present(email):
#     with open("survey_data.csv", "r") as file:
#         reader = csv.reader(file)
#         for row in reader:
#             if email == row[1]:
#                 return True
#     return False

def download_google_docs_file(service, file_id, mime_type='text/csv'):
    """Download a Google Docs editor file in a specified mime type format."""
    request = service.files().export_media(fileId=file_id, mimeType=mime_type)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    fh.seek(0)
    return fh.read().decode()  # Returns content as string

def is_email_present(email, existing_data):
    try:
        data = existing_data
        reader = csv.reader(io.StringIO(data))
        for row in reader:
            if row[1] == email:  # Assuming email is in the second column
                return True
        return False
    except Exception as e:
        print(f"Failed to check email presence: {e}")
        return False  # Adjust based on how you want to handle errors

class RegisterData(BaseModel):
    email: str
origins = ["*"]

# Add the CORS middleware to your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def find_file_id_by_name(service, name):
    """Search for a file by name and return its Google Drive file ID."""
    query = f"name = '{name}'"
    response = service.files().list(q=query, spaces='drive',
                                    fields='files(id, name)').execute()
    files = response.get('files', [])


    if not files:
        return None  # No files found
    else:
        # Assuming the first matching file is the one you want
        return files[0]['id']
# Example usage
file_name = "survey_data.csv"
file_id = find_file_id_by_name(drive_service, file_name)
print("Found file ID:", file_id)    
    

@app.post("/api/survey")
async def submit_survey(survey_data: SurveyData):
    file_id = '1vDp3k6HGS9qBS2-PKgfqUpVC5jaOgLQAYZuIOxlMx6w'
    existing_data = download_google_docs_file(drive_service, file_id)
    if is_email_present(survey_data.email, existing_data):
        return {"success": False, "message": "Email already used for survey"}

    try:
        # Download existing data
        apps=json.dumps(survey_data.apps).replace('"', "'")
        ratings=json.dumps(survey_data.ratings).replace(',', "|")
        print(ratings)
        # Append new survey data
        new_data = f'\n{datetime.now()},{survey_data.email},{survey_data.platform},"{apps}",{ratings},{survey_data.feedback}\n'
        combined_data = existing_data + new_data
        combined_data_bytes = combined_data.encode('utf-8')
        fh = io.BytesIO(combined_data_bytes)
        fh.seek(0) 
        # Re-upload the updated data
        media = MediaIoBaseUpload(fh, mimetype='text/csv', resumable=True)
        drive_service.files().update(fileId=file_id, media_body=media).execute()

        send_confirmation_email(survey_data.email)  # Define this function as needed
        return {"success": True, "message": "Survey submitted successfully"}
    except Exception as e:
        return {"success": False, "message": f"An error occurred while saving survey data: {str(e)}"}

@app.get("/api/results")
async def get_survey_results():
    file_id = "1vDp3k6HGS9qBS2-PKgfqUpVC5jaOgLQAYZuIOxlMx6w"  # Google Drive file ID
    results = []
    data = download_google_docs_file(drive_service, file_id, mime_type='text/csv')
    reader = csv.reader(io.StringIO(data))
    next(reader, None)  # Skip the header row
    for row in reader:
        try:
            apps = ast.literal_eval(row[3])
            ratings = ast.literal_eval(row[4].replace("|",","))
            print(ratings)
            results.append({
                "timestamp": row[0],
                "email": row[1],
                "platform": row[2],
                "apps": apps,
                "ratings": ratings
            })
            print(results)
        except json.JSONDecodeError:
            continue  # Skip rows with malformed JSON data

    app_ratings = defaultdict(lambda: {'ios': [], 'android': []})
    platform_count = {'ios': 0, 'android': 0}
    app_count = defaultdict(int)

    for result in results:
        platform = result["platform"]
        platform_count[platform] += 1
        apps = result["apps"]
        ratings = result["ratings"]

        for app in apps:
            app_count[app] += 1
            if app in ratings:
                app_ratings[app][platform].append(int(ratings[app]))

    # Chart data for average ratings by platform per app
    average_ratings_data = {
        "labels": list(app_ratings.keys()),
        "datasets": [
            {
                "label": "iOS Average Rating",
                "data": [sum(app_ratings[app]['ios']) / len(app_ratings[app]['ios']) if app_ratings[app]['ios'] else 0 for app in app_ratings],
                "backgroundColor": "rgba(75, 192, 192, 0.6)",
                "borderColor": "rgba(75, 192, 192, 1)",
                "borderWidth": 1
            },
            {
                "label": "Android Average Rating",
                "data": [sum(app_ratings[app]['android']) / len(app_ratings[app]['android']) if app_ratings[app]['android'] else 0 for app in app_ratings],
                "backgroundColor": "rgba(255, 99, 132, 0.6)",
                "borderColor": "rgba(255, 99, 132, 1)",
                "borderWidth": 1
            },
        ]
    }

    # Chart data for response counts per platform
    response_counts_data = {
        "labels": ['iOS', 'Android'],
        "datasets": [{
            "label": "Number of Responses",
            "data": [platform_count['ios'], platform_count['android']],
            "backgroundColor": ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
            "borderColor": ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
            "borderWidth": 1
        }]
    }

    # Chart data for average ratings of each app across all platforms
    overall_avg_ratings = {
        "labels": list(app_ratings.keys()),
        "datasets": [{
            "label": "Overall Average Rating",
            "data": [(sum(app_ratings[app]['ios'] + app_ratings[app]['android']) / len(app_ratings[app]['ios'] + app_ratings[app]['android'])) if (app_ratings[app]['ios'] + app_ratings[app]['android']) else 0 for app in app_ratings],
            "backgroundColor": "rgba(153, 102, 255, 0.6)",
            "borderColor": "rgba(153, 102, 255, 1)",
            "borderWidth": 1
        }]
    }

    # Chart data for frequency of each app being reviewed
    app_review_frequency = {
        "labels": list(app_count.keys()),
        "datasets": [{
            "label": "Review Count per App",
            "data": [app_count[app] for app in app_count],
            "backgroundColor": "rgba(255, 206, 86, 0.6)",
            "borderColor": "rgba(255, 206, 86, 1)",
            "borderWidth": 1
        }]
    }

    return {
        "average_ratings_data": average_ratings_data,
        "response_counts_data": response_counts_data,
        "overall_avg_ratings": overall_avg_ratings,
        "app_review_frequency": app_review_frequency
    }
    
@app.post("/api/register")
async def register_user(register_data: RegisterData):
    # Save user registration data to database or file
    with open("registered_users.csv", "a") as file:
        writer = csv.writer(file)
        writer.writerow([datetime.now(), register_data.email])
    
    return {"message": "User registered successfully"}

@app.get("/download-csv")
async def download_csv():
    file_id = "1vDp3k6HGS9qBS2-PKgfqUpVC5jaOgLQAYZuIOxlMx6w"  # Google Drive file ID
    mime_type = "text/csv"  # Set MIME type to CSV for Google Sheets export
    file_stream = download_google_docs_file(drive_service, file_id, mime_type)
    return StreamingResponse(file_stream, media_type=mime_type, headers={"Content-Disposition": "attachment; filename=survey_data.csv"})

def send_confirmation_email(email):
    # Configure SMTP settings
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    smtp_username = "mingey.abhiprayalu@gmail.com"
    smtp_password = "cgwn ccuh bbyu tpqa"
    
    # Create email message
    message = MIMEMultipart()
    message["From"] = smtp_username
    message["To"] = email
    message["Subject"] = "Survey Confirmation"
    
    body = "Thank you for completing the survey!"
    message.attach(MIMEText(body, "plain"))
    
    # Send email
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(message)