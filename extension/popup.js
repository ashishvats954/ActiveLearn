// This function runs when the popup window is opened.
document.addEventListener('DOMContentLoaded', function() {

  // Select the <p> tag from our popup.html
  const statusElement = document.querySelector('p');
  statusElement.textContent = 'Connecting to backend...';

  // Call our backend!
  // This is an asynchronous network request.
  fetch('http://127.0.0.1:5000/')
    .then(response => {
      // Check if the request was successful
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Get the text from the response
      return response.text();
    })
    .then(data => {
      // Success! Display the data from the backend.
      statusElement.textContent = data;
    })
    .catch(error => {
      // An error happened.
      console.error('Error fetching from backend:', error);
      statusElement.textContent = 'Error: Could not connect to backend.';
    });
});