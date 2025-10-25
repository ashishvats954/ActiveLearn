import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

# Configure the Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")
genai.configure(api_key=api_key)

# Create an instance of the Flask class
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

model = genai.GenerativeModel(
    model_name='models/gemini-flash-latest'
)

# This is our new "process" route
@app.route("/process", methods=['POST'])
def process_text():
    try:
        # Get the 'text' from the JSON data sent by the extension
        data = request.json
        text_segment = data.get('text')

        if not text_segment:
            return jsonify({"error": "No text provided"}), 400

        # This is the prompt from your project proposal
        summary_prompt = f"""
        I'm sharing a lecture transcript segment.
        Here is the content:
        ---
        {text_segment}
        ---

        Please do the following:

        1. Read and understand the content fully.
        2. Explain it to me in a well-structured, intuitive way, as if teaching from scratch.
        3. Include:
           - A short overview (what it’s about and why it matters).
           - Core ideas and subtopics in a logical order.
           - Analogies or real-life examples for complex parts.
        4. Format the entire response as **HTML**. Use HTML tags like `<h3>` for subheadings, `<ul>` and `<li>` for bullet points, and `<b>` or `<strong>` for bold text to make it clear, elegant, and reader-friendly.
        5. Do NOT include `<html>` or `<body>` tags. Just send the formatted content (headings, paragraphs, lists) directly.
        """

        # Call the Gemini API
        response = model.generate_content(summary_prompt)

        # Return the AI's summary as JSON
        # We also call a function to generate a quiz (which we'll build next)
        quiz_json = generate_quiz(text_segment)
        
        return jsonify({
            'summary': response.text,
            'quiz': quiz_json 
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


# (Find the old generate_quiz function and replace it with this)
def generate_quiz(text_segment):
    try:
        # NEW, smarter quiz prompt
        quiz_prompt = f"""
        Based on the following transcript, generate a JSON array of 3 quiz questions.
        The goal is to test deep understanding, not just memorization.
        Please provide:
        - 1 "Easy" question (e.g., definition, key fact)
        - 1 "Medium" question (e.g., conceptual understanding, 'why')
        - 1 "Hard" question (e.g., application, synthesis, 'what if')

        For each question, provide an object in this exact JSON format:
        {{
          "question": "The full question text...",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "The full text of the correct option",
          "explanation": "A brief, 1-2 sentence explanation of why this is the correct answer."
        }}
        
        Transcript: {text_segment}
        """

        quiz_response = model.generate_content(quiz_prompt)
        
        # Clean up the response to get just the JSON
        cleaned_response = quiz_response.text.strip().replace("```json", "").replace("```", "")
        
        return cleaned_response # Return the JSON string

    except Exception as e:
        print(f"Quiz Error: {e}")
        return "[]" # Return empty JSON array string on error


# NEW FUNCTION FOR ACTIVE RECALL EVALUATION
@app.route("/evaluate", methods=['POST'])
def evaluate_recall():
    try:
        data = request.json
        user_summary = data.get('userSummary')
        ai_summary = data.get('aiSummary') # We'll send the AI summary for comparison

        if not user_summary or not ai_summary:
            return jsonify({"error": "Missing summaries"}), 400

        # This is the prompt from your proposal (Step 3.2.4)
        eval_prompt = f"""
        Act as an academic coach. A student was given the following "golden summary"
        of a lecture:
        ---
        GOLDEN SUMMARY:
        {ai_summary}
        ---

        The student then tried to write their own summary from memory (Active Recall):
        ---
        STUDENT'S SUMMARY:
        {user_summary}
        ---

        Please compare the student's summary to the golden summary. 
        Provide constructive feedback in HTML format.
        Focus on:
        1.  **Key Concepts Missed:** What important ideas did the student forget?
        2.  **Misunderstandings:** Did the student misunderstand any concepts?
        3.  **What They Got Right:** What key concepts did they correctly identify?

        Format the feedback with `<h3>` headings and `<ul>/<li>` lists.
        Be encouraging and helpful.
        """
        
        eval_response = model.generate_content(eval_prompt)
        
        return jsonify({'feedback': eval_response.text})

    except Exception as e:
        print(f"Evaluate Error: {e}")
        return jsonify({"error": str(e)}), 500

# This block starts the development server
if __name__ == "__main__":
    app.run(debug=True)

    