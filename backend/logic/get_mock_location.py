"""
It returns a URL to our "fake live tracking" page with mock coordinates
for the University of Johannesburg (UJ) Business School.
"""
def get_mock_location():
    # These are the mock coordinates
    lat = -26.1843
    lon = 28.0055


    live_server_address = "https://b31703c6b4be.ngrok-free.app" 
    
    # We construct a URL with the coordinates as parameters for our tracking page
    return f"{live_server_address}/frontend/track.html?lat={lat}&lon={lon}"