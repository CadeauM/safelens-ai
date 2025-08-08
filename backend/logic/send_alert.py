"""
It uses the Twilio API to send a real SMS message to the contacts.
"""
from twilio.rest import Client

try:
    import config
except ImportError:
    class MockConfig:
        TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER = "mock_sid", "mock_token", "mock_phone"
    config = MockConfig()

def send_alert(contact_phones: list[str], message: str):
    """
    Sends an SMS alert to a list of phone numbers.
    """
    if config.TWILIO_ACCOUNT_SID == "mock_sid":
        print("--- WARNING: Twilio credentials not found. Using MOCK ALERT. ---")
        print(f"RECIPIENTS: {', '.join(contact_phones)}")
        print(f"MESSAGE: {message}")
        return {"status": "mock_success", "message": f"Mock alert shown for {len(contact_phones)} contacts."}

    try:
        client = Client(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
        success_count = 0
        error_count = 0

        # Loop through each phone number in the provided list
        for phone_number in contact_phones:
            try:
                # Use .strip() to remove any accidental whitespace from the number
                sms = client.messages.create(
                    to=phone_number.strip(),
                    from_=config.TWILIO_PHONE_NUMBER,
                    body=message
                )
                print(f"Successfully sent SMS to {phone_number} (SID: {sms.sid})")
                success_count += 1
            except Exception as e:
                print(f"!!! FAILED to send SMS to {phone_number}. Error: {e} !!!")
                error_count += 1
        
        return {
            "status": "partial_success" if error_count > 0 else "success",
            "message": f"Alerts sent: {success_count}. Failed: {error_count}."
        }

    except Exception as e:
        #catches critical errors, if the Twilio client itself fails to initialize
        print(f"!!! CRITICAL TWILIO ERROR: {e} !!!")
        return {"status": "error", "message": f"Critical Twilio error: {e}"}