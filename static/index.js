import { sendImageToModel } from './predict.js'

const touchingHairTagName = "touching-hair"
const notTouchingHairTagName = "not-touching-hair"
const predictionIntervalBaseline = 1000
const audioFilePath = '../resources/audio/cant-touch-this.mp3'

async function captureCameraFrame() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    var video = document.querySelector("#video-element") 

    video.srcObject = stream 

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        const captureFrame = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/jpeg'); // Change format if needed
          resolve(imageData);
        };

        setInterval(captureFrame, 500); // Adjust the interval as needed
      };
    });
  } catch (error) {
    console.error('Error capturing camera frame:', error);
    throw error;
  }
}

// Function to play audio
function playAudio() {
  const audio = new Audio(audioFilePath);
  audio.play();
}


let timeoutId;
let timesTouched = 0
var predictionInterval = predictionIntervalBaseline
var isTouching = false

function touchingAlert() {
  playAudio()
  timesTouched++
  document.getElementById("touch-count").textContent = timesTouched
  document.body.style.backgroundColor = "red";
}

function notTouching() {
  document.body.style.backgroundColor = "rgb(13, 97, 111)";
}

// Start continuous image capture and model prediction
async function startContinuousPrediction() {
  if (isTouching == true) {
    isTouching = false;
    startStopwatch()
    notTouching()
  }
  try {
    const imageData = await captureCameraFrame();
    const tagName = await sendImageToModel(imageData);
    console.log('Model response:', tagName);

    if (tagName.toLowerCase() == touchingHairTagName) {
      // Increment the times-touched variable
      isTouching = true;
      touchingAlert()
      resetStopwatch()
      
      predictionInterval = 5000
    }
  }
  catch (error) {console.error('Error:', error)};

  timeoutId = setTimeout(startContinuousPrediction, predictionInterval);
  predictionInterval = predictionIntervalBaseline;
}

// Stop Video
function StopVideo() {
  var stream = document.querySelector("#video-element").srcObject;
  stream.getTracks().forEach(function (track) {track.stop()});
}

// Stop continuous image capture and model prediction
function stopContinuousPrediction() {
  StopVideo();
  clearTimeout(timeoutId);
}

// Stop watch for current streak
var startTime; // to keep track of the start time
var stopwatchInterval; // to keep track of the interval
var elapsedPausedTime = 0; // to keep track of the elapsed time while stopped

function startStopwatch() {
  if (!stopwatchInterval) {
    startTime = new Date().getTime() - elapsedPausedTime; // get the starting time by subtracting the elapsed paused time from the current time
    stopwatchInterval = setInterval(updateStopwatch, 1000); // update every second
  }
}

function stopStopwatch() {
    clearInterval(stopwatchInterval); // stop the interval
    elapsedPausedTime = new Date().getTime() - startTime; // calculate elapsed paused time
    stopwatchInterval = null; // reset the interval variable
}

function resetStopwatch() {
    stopStopwatch(); // stop the interval
    elapsedPausedTime = 0; // reset the elapsed paused time variable
    document.getElementById("stopwatch").innerHTML = "00:00:00"; // reset the display
}

function updateStopwatch() {
    var currentTime = new Date().getTime(); // get current time in milliseconds
    var elapsedTime = currentTime - startTime; // calculate elapsed time in milliseconds
    var seconds = Math.floor(elapsedTime / 1000) % 60; // calculate seconds
    var minutes = Math.floor(elapsedTime / 1000 / 60) % 60; // calculate minutes
    var hours = Math.floor(elapsedTime / 1000 / 60 / 60); // calculate hours
    var displayTime = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds); // format display time
    document.getElementById("stopwatch").innerHTML = displayTime; // update the display
  }
  
  function pad(number) {
    // add a leading zero if the number is less than 10
    return (number < 10 ? "0" : "") + number;
  }


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start").addEventListener("click", () => {
      startStopwatch();
      document.getElementById("start").hidden = true; // hide Start button
      document.getElementById("video-element").hidden = false // show video
      document.getElementById("stop").hidden = false; // show Stop buttonam
      document.getElementById("stop").style.zIndex = 1;
      startContinuousPrediction()
    });
    document.getElementById("stop").addEventListener("click", () => {
      resetStopwatch();
      document.getElementById("stop").hidden = true;
      document.getElementById("video-element").hidden = true; // hide webcam
      document.getElementById("start").hidden = false;
      document.getElementById("start").style.zIndex = 1;
      stopContinuousPrediction();
    });
})
