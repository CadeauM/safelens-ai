from twilio.rest import Client
import config

def send_emergency_sms(contact_phones: list[str], message: str, location_url: str):
    """
    Sends an SMS alert to a list of phone numbers using Twilio.
    
    Args:
        contact_phones (list[str]): A list of recipient phone numbers.
        message (str): The custom message from the user's settings.
        location_url (str): The Google Maps URL of the user's location.
    
    Returns:
        dict: A summary of the sending results.
    """
    try:
        client = Client(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
        
        # The complete message body
        full_message = (
            f"URGENT SafeLens Alert!\n\n"
            f"{message}\n\n"
            f"Current Location: {location_url}"
        )
        
        success_count = 0
        error_count = 0

        for phone in contact_phones:
            try:
                sms = client.messages.create(
                    to=phone.strip(),
                    from_=config.TWILIO_PHONE_NUMBER,
                    body=full_message
                )
                print(f"Successfully sent SMS to {phone} (SID: {sms.sid})")
                success_count += 1
            except Exception as e:
                print(f"!!! FAILED to send SMS to {phone}. Error: {e}")
                error_count += 1
        
        return {
            "status": "success" if error_count == 0 else "partial_success",
            "message": f"Alerts sent: {success_count}. Failed: {error_count}."
        }
    except Exception as e:
        print(f"!!! CRITICAL TWILIO ERROR: {e}")
        return {"status": "error", "message": f"Critical Twilio error: {e}"}