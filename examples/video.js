const audioCtx = new AudioContext();

const ctxStatus = document.getElementById('ctx-status');
setInterval(() => {
  ctxStatus.innerText = audioCtx.state;
  if (audioCtx.state === 'suspended') {
    buttonElement.innerText = 'Resume';
  } else {
    buttonElement.innerText = 'Suspend';
  }
}, 100);

const buttonElement = document.getElementById('ctx-button');
buttonElement.addEventListener('click', () => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  } else {
    audioCtx.suspend();
  }
});

const videoElement = document.getElementById('the-video');
const meterElement = document.getElementById('peak-meter');
const sourceNode = audioCtx.createMediaElementSource(videoElement);
sourceNode.connect(audioCtx.destination);
const test = new webAudioPeakMeter.WebAudioPeakMeter(sourceNode, meterElement);
