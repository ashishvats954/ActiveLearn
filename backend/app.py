from flask import Flask
from flask_cors import CORS  # Import CORS

# Create an instance of the Flask class
app = Flask(__name__)

# Initialize CORS and allow all origins
# This tells your server to accept requests from any domain
CORS(app) 

# Define a "route"
@app.route("/")
def home():
    # Let's change this message so we know it's working
    return "Hello from the *CONNECTED* Backend!"

# This block starts the development server
if __name__ == "__main__":
    app.run(debug=True)