"""
It mocks the sending of an emergency alert by printing to the console.
"""
def send_alert(contact_phone: str, message: str):
    print("="*30)
    print("!!! EMERGENCY ALERT TRIGGERED !!!")
    print(f"Sending to: {contact_phone}")
    print(f"Message: {message}")
    print("="*30)
    
    return {"status": "success", "message": f"Mock alert sent to {contact_phone}."}