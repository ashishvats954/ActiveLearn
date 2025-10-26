/*
 * This is the "smart" content script that implements
 * the logic from the project proposal.
 */
function getSmartTranscript() {
  // 1. Find the main video player element
  const video = document.querySelector('video.html5-main-video');
  if (!video) {
    return "Error: Could not find video player.";
  }
  // 2. Get the video's current time in seconds
  const currentTime = video.currentTime;

  // 3. Find all transcript *segments*
  const segmentRenderers = document.querySelectorAll('ytd-transcript-segment-renderer');
  if (segmentRenderers.length === 0) {
    return "Error: Could not find a transcript on this page. Please make sure the transcript is open.";
  }

  const relevantSegments = [];

  // 4. Loop through every segment
  for (const segment of segmentRenderers) {
    try {
      // 5. Get the timestamp text (e.g., "1:05")
      const timeText = segment.querySelector('.segment-timestamp').innerText.trim();
      
      // 6. Convert the timestamp text into seconds
      const parts = timeText.split(':').map(Number);
      let segmentStartTime = 0;
      if (parts.length === 3) { // Handles "1:05:10"
        segmentStartTime = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) { // Handles "1:05"
        segmentStartTime = parts[0] * 60 + parts[1];
      }

      // 7. This is the logic: only add text if its time is before or at the current video time
      if (segmentStartTime <= currentTime) {
       const segmentText = segment.querySelector('yt-formatted-string.segment-text').innerText;
        relevantSegments.push(segmentText);
      } else {
        // We've gone past the current time, so we can stop
        break;
      }
    } catch (e) {
      // Ignore any segment that fails to parse
      console.warn("Could not parse transcript segment:", e);
    }
  }

  if (relevantSegments.length === 0) {
    return "Error: No transcript segments found before the current time. Try playing the video first.";
  }

  // 8. Join only the relevant segments together
  return relevantSegments.join(' ');
}

// Send the smart transcript (or error) back to the popup
chrome.runtime.sendMessage({ transcript: getSmartTranscript() });