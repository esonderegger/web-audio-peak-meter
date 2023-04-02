const audioCtx = new AudioContext();
const audioElement = document.getElementById('the-audio');
const meterElement = document.getElementById('peak-meter');
const meterToggle = document.getElementById('meter-toggle');

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

let meterInstance = null;

meterToggle.addEventListener('click', () => {
  if (meterInstance) {
    meterInstance.cleanup();
    meterInstance = null;
    meterToggle.innerText = 'Create meter';
  } else {
    meterInstance = new webAudioPeakMeter.WebAudioPeakMeter(sourceNode, meterElement);
    meterToggle.innerText = 'Delete meter';
  }
});
