const audioCtx = new AudioContext();

const ctxStatus = document.getElementById('ctx-status');
const buttonElement = document.getElementById('ctx-button');

function updateAudioCtxStatus() {
  ctxStatus.innerText = audioCtx.state;
  if (audioCtx.state === 'suspended') {
    buttonElement.innerText = 'Resume';
  } else {
    buttonElement.innerText = 'Suspend';
  }
}

setInterval(updateAudioCtxStatus, 1000);

buttonElement.addEventListener('click', () => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(updateAudioCtxStatus);
  } else {
    audioCtx.suspend().then(updateAudioCtxStatus);
  }
});

const videoElement = document.getElementById('the-video');
const meterElement = document.getElementById('peak-meter');
const sourceNode = audioCtx.createMediaElementSource(videoElement);
const gainNode = audioCtx.createGain();
gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

sourceNode.connect(gainNode);
gainNode.connect(audioCtx.destination);

const unused = new webAudioPeakMeter.WebAudioPeakMeter(sourceNode, meterElement);

const gainSlider = document.getElementById('gain');
gainSlider.addEventListener('change', (evt) => {
  gainNode.gain.setValueAtTime(evt.target.value, audioCtx.currentTime);
});
