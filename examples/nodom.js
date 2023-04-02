const audioCtx = new AudioContext();
const audioElement = document.getElementById('the-audio');
const clearPeaks = document.getElementById('clear-peaks');
const getPeaks = document.getElementById('get-peaks');
const currentFloat = document.getElementById('current-float');
const currentDB = document.getElementById('current-db');
const maxesFloat = document.getElementById('maxes-float');
const maxesDB = document.getElementById('maxes-db');

const sourceNode = audioCtx.createMediaElementSource(audioElement);
sourceNode.connect(audioCtx.destination);

const buttonElement = document.getElementById('ctx-button');
buttonElement.addEventListener('click', () => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  } else {
    audioCtx.suspend();
  }
});

const ctxStatus = document.getElementById('ctx-status');
setInterval(() => {
  ctxStatus.innerText = audioCtx.state;
  if (audioCtx.state === 'suspended') {
    buttonElement.innerText = 'Resume';
  } else {
    buttonElement.innerText = 'Suspend';
  }
}, 100);

const meterInstance = new webAudioPeakMeter.WebAudioPeakMeter(sourceNode);

clearPeaks.addEventListener('click', () => {
  meterInstance.clearPeaks();
});

const displayFloatArray = (arr) => arr.map((val) => val.toFixed(2)).join(', ');

getPeaks.addEventListener('click', () => {
  const peaks = meterInstance.getPeaks();
  currentFloat.innerText = displayFloatArray(peaks.current);
  currentDB.innerText = displayFloatArray(peaks.currentDB);
  maxesFloat.innerText = displayFloatArray(peaks.maxes);
  maxesDB.innerText = displayFloatArray(peaks.maxesDB);
});
