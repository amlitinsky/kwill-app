import os
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# Service account key file path
SERVICE_ACCOUNT_FILE = os.path.expanduser("~/Downloads/stable-equator-379006-85cec06196cc.json")


# Spreadsheet ID and sheet name
SPREADSHEET_ID = "1mIfbBmpA8HGmgMNgAWWQCNvnv9nui1G649WBx-Bb4E8"
SHEET_NAME = "Sheet1"  # Adjust the sheet name as necessary

# Setup the credentials
credentials = Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=["https://www.googleapis.com/auth/spreadsheets"]
)

# Build the service object
service = build("sheets", "v4", credentials=credentials)


def find_next_empty_row(service, spreadsheet_id, sheet_name):
    # if there is any data in a row then we move onto the next one
    # Get the data from the first column to determine the next empty row
    range_name = f"{sheet_name}!A:A"
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=range_name)
        .execute()
    )
    values = result.get("values", [])

    if not values:
        return 1  # Return the first row if the column is empty
    return len(values) + 1  # Return the next empty row


def map_headers_and_append_data(service, spreadsheet_id, sheet_name, data_dict):
    # Get the headers from the spreadsheet
    header_range = f"{sheet_name}!1:1"
    headers_result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=header_range)
        .execute()
    )
    headers = headers_result.get("values", [[]])[0]

    # Create a row with None values for all headers
    row_data = [None] * len(headers)

    # Map the data_dict to the corresponding header columns
    for key, value in data_dict.items():
        if key in headers:
            index = headers.index(key)
            row_data[index] = value

    # Append the mapped data to the spreadsheet
    append_range = (
        f"{sheet_name}!A{find_next_empty_row(service, spreadsheet_id, sheet_name)}"
    )
    body = {"values": [row_data]}
    request = (
        service.spreadsheets()
        .values()
        .append(
            spreadsheetId=spreadsheet_id,
            range=append_range,
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body=body,
        )
    )
    response = request.execute()

    return response


# Example data dictionary that maps to headers
# in the LLM prompt, we want to map the transcript to a dictionary of values such that columns match the data that the LLM gathered
# TODO in the case that the key isn't perfect, can we find the closest value that matches it
data_dict = {
    "Firm Name": "K1 Investment Management",
    "Location": "LA",
    "Sector Focus": "Lower middle market tech investment; Software",
    "Rev Requirements": "$2 million to $100 million",
    "Check Size": "$5 million to $400 million",
    "Target Ownership": "Majority; Minority for follow-ons",
    "Other": "High gross margins (80-90%), diverse customer base",
}

# Append the data
response = map_headers_and_append_data(service, SPREADSHEET_ID, SHEET_NAME, data_dict)
print("Data appended successfully")
print(response)
