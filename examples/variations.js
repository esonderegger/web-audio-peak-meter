const audioCtx = new AudioContext();

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

const audioElementOne = document.getElementById('audio-one');
const audioElementTwo = document.getElementById('audio-two');

const sourceNodeOne = audioCtx.createMediaElementSource(audioElementOne);
const sourceNodeTwo = audioCtx.createMediaElementSource(audioElementTwo);
sourceNodeOne.connect(audioCtx.destination);
sourceNodeTwo.connect(audioCtx.destination);

const elementOneA = document.getElementById('meter-one-a');
const meterOneA = new webAudioPeakMeter.WebAudioPeakMeter(sourceNodeOne, elementOneA);
const elementOneB = document.getElementById('meter-one-b');
const optionsOneB = {
  backgroundColor: '#555',
  peakHoldDuration: 2000,
};
const meterOneB = new webAudioPeakMeter.WebAudioPeakMeter(sourceNodeOne, elementOneB, optionsOneB);
const elementTwoA = document.getElementById('meter-two-a');
const optionsTwoA = {
  vertical: true,
};
const meterTwoA = new webAudioPeakMeter.WebAudioPeakMeter(sourceNodeTwo, elementTwoA, optionsTwoA);
