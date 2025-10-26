document.addEventListener('DOMContentLoaded', function() {
  
  // Get all our new HTML elements
  const summaryContainer = document.getElementById('summary-container');
  const summaryElement = document.getElementById('summary-content');
  const startQuizBtn = document.getElementById('start-quiz-btn');

  const quizContainer = document.getElementById('quiz-container');
  const quizElement = document.getElementById('quiz-content');
  const submitQuizBtn = document.getElementById('submit-quiz-btn');

  const recallContainer = document.getElementById('recall-container');
  const recallTextarea = document.getElementById('recall-textarea');
  const submitRecallBtn = document.getElementById('submit-recall-btn');

  const resultsContainer = document.getElementById('results-container');
  const scoreText = document.getElementById('score-text');
  const resultsContent = document.getElementById('results-content');
  const evalContainer = document.getElementById('eval-container');
  const evalContent = document.getElementById('eval-content');
  
  // Store data from the AI
  let aiSummaryText = ""; // To store the plain text summary for evaluation
  let allQuizData = [];
  let userAnswers = [];

  // 1. Start by injecting the content script
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['content.js']
    });
  });

  // 2. Listen for the transcript
  chrome.runtime.onMessage.addListener(function(request) {
    if (request.transcript) {
      if (request.transcript.startsWith('Error:')) {
        summaryElement.innerText = request.transcript;
      } else {
        callBackend(request.transcript);
      }
    }
  });

  // 3. Call the /process endpoint
  function callBackend(transcript) {
    fetch('http://127.0.0.1:5000/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: transcript }) 
    })
    .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
    .then(data => {
      // Store the summary (HTML for display, text for evaluation)
      summaryElement.innerHTML = data.summary;
      aiSummaryText = summaryElement.innerText; // Get plain text version
      
      startQuizBtn.classList.remove('hidden'); 
      
      allQuizData = JSON.parse(data.quiz);
      buildQuizUI(allQuizData);
    })
    .catch(error => {
      console.error('Error fetching from backend:', error);
      summaryElement.innerText = 'Error: Could not connect to backend.';
    });
  }

  // 4. Build the HTML for the quiz
  function buildQuizUI(quizQuestions) {
    quizElement.innerHTML = ''; // Clear "Loading..."
    quizQuestions.forEach((q, index) => {
      const questionBlock = document.createElement('div');
      questionBlock.className = 'question-block';
      
      const questionText = document.createElement('p');
      questionText.className = 'question-text';
      questionText.innerText = `${index + 1}. ${q.question}`;
      questionBlock.appendChild(questionText);

      q.options.forEach(option => {
        const optionLabel = document.createElement('label');
        optionLabel.className = 'option-item';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `question-${index}`;
        radio.value = option;
        optionLabel.appendChild(radio);
        optionLabel.appendChild(document.createTextNode(` ${option}`));
        questionBlock.appendChild(optionLabel);
      });
      
      quizElement.appendChild(questionBlock);
    });
  }

  // 5. Handle all the button clicks to move between sections

  // Summary -> Quiz
  startQuizBtn.addEventListener('click', function() {
    summaryContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
  });

  // Quiz -> Active Recall
  submitQuizBtn.addEventListener('click', function() {
    checkQuizAnswers();
    quizContainer.classList.add('hidden');
    recallContainer.classList.remove('hidden');
  });

  // Active Recall -> Results
  submitRecallBtn.addEventListener('click', function() {
    callEvaluateAPI(); // Call the new /evaluate endpoint
    recallContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
  });


  // 6. Check the quiz answers and store them
  function checkQuizAnswers() {
    let score = 0;
    userAnswers = []; // Clear previous answers

    allQuizData.forEach((q, index) => {
      const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
      const userAnswer = selectedOption ? selectedOption.value : "No answer";
      userAnswers.push(userAnswer);

      if (userAnswer === q.correctAnswer) {
        score++;
      }
    });

    scoreText.innerText = `You scored ${score} out of ${allQuizData.length}!`;
    buildResultsUI(); // Show the detailed results
  }

  // 7. Build the final results UI with explanations
  function buildResultsUI() {
    resultsContent.innerHTML = ''; // Clear old results
    
    allQuizData.forEach((q, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === q.correctAnswer;
      
      const resultBlock = document.createElement('div');
      resultBlock.className = 'result-block';
      
      resultBlock.innerHTML = `
        <p class="result-question">${index + 1}. ${q.question}</p>
        <p class="result-user-answer">Your answer: 
          <span class="${isCorrect ? 'result-correct' : 'result-incorrect'}">
            ${userAnswer}
          </span>
        </p>
        ${!isCorrect ? `<p class="result-user-answer">Correct answer: ${q.correctAnswer}</p>` : ''}
        <div class="result-explanation">
          <b>Explanation:</b> ${q.explanation}
        </div>
      `;
      resultsContent.appendChild(resultBlock);
    });
  }

  // 8. Call the new /evaluate endpoint
  function callEvaluateAPI() {
    const userSummary = recallTextarea.value;
    
    if (userSummary.trim().length < 10) {
      evalContent.innerHTML = "<p>You didn't write a summary, so no feedback can be given.</p>";
      evalContainer.classList.remove('hidden');
      return;
    }
    
    evalContent.innerHTML = "<p>Analyzing your summary...</p>";
    evalContainer.classList.remove('hidden');

    fetch('http://127.0.0.1:5000/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userSummary: userSummary,
        aiSummary: aiSummaryText // Send the plain-text summary we saved earlier
      }) 
    })
    .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
    .then(data => {
      evalContent.innerHTML = data.feedback; // Show the AI's HTML feedback
    })
    .catch(error => {
      console.error('Error fetching from /evaluate:', error);
      evalContent.innerText = 'Error: Could not get feedback.';
    });
  }
});