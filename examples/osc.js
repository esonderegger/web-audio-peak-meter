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

const oscillatorNode = audioCtx.createOscillator();
const gainNode = audioCtx.createGain();
const panNode = audioCtx.createStereoPanner();

oscillatorNode.type = 'sine';
oscillatorNode.frequency.setValueAtTime(440, audioCtx.currentTime);
gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
panNode.pan.setValueAtTime(0, audioCtx.currentTime);
oscillatorNode.connect(gainNode);
gainNode.connect(panNode);
panNode.connect(audioCtx.destination);
oscillatorNode.start();

const meterElement1 = document.getElementById('peak-meter-1');
const meter1 = new webAudioPeakMeter.WebAudioPeakMeter(gainNode, meterElement1);
const meterElement2 = document.getElementById('peak-meter-2');
const meter2 = new webAudioPeakMeter.WebAudioPeakMeter(panNode, meterElement2);

const gainSlider = document.getElementById('gain');
gainSlider.addEventListener('change', (evt) => {
  gainNode.gain.setValueAtTime(evt.target.value, audioCtx.currentTime);
});

const panningSlider = document.getElementById('panning');
panningSlider.addEventListener('change', (evt) => {
  panNode.pan.setValueAtTime(evt.target.value, audioCtx.currentTime);
});
