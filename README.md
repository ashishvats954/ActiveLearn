# ActiveLearn: An Intelligent, Real-Time Study Assistant 🚀

Welcome to ActiveLearn! This project is a browser extension that transforms passive video lectures into an active learning experience. It provides real-time, AI-powered summaries, comprehension quizzes, and active recall feedback directly from a video's transcript.

## ✨ Key Features

* **Timestamp-Aware Summaries:** Get beautifully formatted summaries of the content you've watched *up to the current point* in the video.
* **Smart Quizzes:** Test your understanding with conceptual questions that include difficulty levels (Easy, Medium, Hard).
* **Detailed Feedback:** After the quiz, see the correct answers along with a brief explanation for each one.
* **Active Recall Evaluation:** Challenge yourself by writing your own summary and get AI-powered feedback comparing it to the original, helping you identify knowledge gaps.

## 🔧 Technologies Used

* **Frontend:** JavaScript, HTML, CSS (Browser Extension)
* **Backend:** Python (Flask)
* **AI:** Google Gemini API (`gemini-1.5-flash-latest`)
* **Code Management:** Git & GitHub

---

## ⚙️ How to Run This Project

Follow these steps carefully to get the project running on your local machine.

### Part A: Get the Code

1.  Open your terminal (e.g., Command Prompt, PowerShell, or Terminal).
2.  Clone the project repository from GitHub and navigate into the new folder:
    ```bash
    git clone [https://github.com/ashishvats945/ActiveLearn.git](https://github.com/ashishvats945/ActiveLearn.git)
    cd ActiveLearn
    ```

### Part B: Set Up the Backend Server

This part configures the "brain" of the project.

1.  Navigate into the `backend` folder from the main project directory:
    ```bash
    cd backend
    ```

2.  Create a Python virtual environment. This isolates the project's libraries:
    ```bash
    python -m venv venv
    ```

3.  Activate the virtual environment.
    > **💡 PowerShell Note:** If you get a red error about `running scripts is disabled...`, run this command first:
    > `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`
    > (Press `Y` and Enter to confirm. This change is temporary and only for this window.)

    Now, run the activate command:
    ```powershell
    # On Windows
    .\venv\Scripts\activate
    ```
    Your terminal prompt should now start with `(venv)`.

4.  Install all the required Python libraries. This command reads the `requirements.txt` file and installs Flask, the Google API, etc.
    ```bash
    pip install -r requirements.txt
    ```

5.  Create a secret `.env` file to hold your API key.
    * In the *same* `backend` folder, create a new file named exactly: `.env`
    * Open this file and add your personal Google Gemini API key in this format, then save it:
        `GEMINI_API_KEY=YOUR_API_KEY_HERE`

6.  Run the backend server:
    ```bash
    python app.py
    ```
7.  The terminal should show that the server is running. **Leave this terminal open and running!**

### Part C: Load the Chrome Extension

This part installs the frontend that you will see in your browser.

1.  Open the Google Chrome browser.
2.  In the address bar, type **`chrome://extensions`** and press Enter.
3.  In the top-right corner, turn on the **"Developer mode"** toggle.
4.  Click the **"Load unpacked"** button.
5.  A file dialog will open. Navigate to the `ActiveLearn` folder and select the **`extension`** folder.
6.  The "ActiveLearn" extension card will appear on the page.

### Part D: Use the Project!

1.  Click the **puzzle piece icon** 🧩 in your Chrome toolbar and click the **pin icon** 📌 next to "ActiveLearn" to make it visible.
2.  Go to any YouTube video that has a transcript (e.g., a Khan Academy lecture).
3.  **Crucial Step:** Below the video, click the "..." (more) button and select **"Show transcript"**. You must have the transcript panel open for the extension to work.
4.  Play the video for a minute or two.
5.  Click the **ActiveLearn icon** in your toolbar to begin the experience!
