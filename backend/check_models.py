import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load the .env file to get the key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("API Key not found! Check your .env file.")
else:
    try:
        genai.configure(api_key=api_key)
        print("Successfully configured. Listing available models for your key:")
        print("-" * 30)

        # This is the important part: we loop through all models
        # and print the ones that support the 'generateContent' method
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)

        print("-" * 30)
        print("Test complete.")

    except Exception as e:
        print(f"An error occurred: {e}")