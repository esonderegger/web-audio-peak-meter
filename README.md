# Web Audio Peak Meters
Customizable peak meters, using the web audio API. It can measure peak or true peak based on ITU-R BS.1770

[![Build Status](https://travis-ci.org/esonderegger/web-audio-peak-meter.svg?branch=master)](https://travis-ci.org/esonderegger/web-audio-peak-meter)

## Demo

See [https://esonderegger.github.io/web-audio-peak-meter](https://esonderegger.github.io/web-audio-peak-meter) for a demo.

## Usage (basic)

To use these meters, first create a `<div>` with a width and height and an `<audio>` element:
```html
<div id="my-peak-meter" style="width: 5em; height: 20em; margin: 1em 0;">
</div>
<audio id="my-audio" preload="metadata" controls="controls">
  <source src="audio/marines_hymn.mp3" type="audio/mpeg">
</audio>
```

Then, at the bottom of your `<body>` tag, add the script tag for these meters. Next, create an `AudioContext` if you don't have one already and create an [AudioNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode) from the `<audio>` element, connecting it to the destination node. Finally, create a meter node and call the `createMeter` function, passing in the Element object, the meter node, and an optional object for configuration options, like so:

Note: for this to work in Google Chrome, we have to resume the audio context after a user gesture ([more info](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio)). Adding a listener to the audio element's `play` event is one way to do this.
```html
<script src="https://assets.rpy.xyz/web-audio-peak-meter.min.js"></script>
<script>
  var myMeterElement = document.getElementById('my-peak-meter');
  var myAudio = document.getElementById('my-audio');
  var audioCtx = new window.AudioContext();
  var sourceNode = audioCtx.createMediaElementSource(myAudio);
  sourceNode.connect(audioCtx.destination);
  var meterNode = webAudioPeakMeter.createMeterNode(sourceNode, audioCtx);
  webAudioPeakMeter.createMeter(myMeterElement, meterNode, {});
  myAudio.addEventListener('play', function() {
    audioCtx.resume();
  });
</script>
```

In this example we used an HTML5 audio element, but these meters can work with any web audio API source node. This example was just meant to show the simplest possible use case. If you are already familiar with the web audio API adapting this example to your needs should be fairly self-explanatory, but please reach out if anything isn't working or doesn't make sense.

## Usage (advanced)

If you are compiling your javascript with a tool like browserify, webpack, or rollup, you can integrate these meters into your site using the CommonJS `require()` syntax.

First, add web-audio-peak-meter as a dev dependency to your project:

```bash
npm install --save-dev web-audio-peak-meter
```

Next, import the webAudioPeakMeter module into your javascript:
```js
var webAudioPeakMeter = require('web-audio-peak-meter');
```

Finally, use as you would in the above example:
```js
var myMeterElement = document.getElementById('my-peak-meter');
var myAudio = document.getElementById('my-audio');
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var sourceNode = audioCtx.createMediaElementSource(myAudio);
sourceNode.connect(audioCtx.destination);
var meterNode = webAudioPeakMeter.createMeterNode(sourceNode, audioCtx);
webAudioPeakMeter.createMeter(myMeterElement, meterNode, {});
myAudio.addEventListener('play', function() {
  audioCtx.resume();
});
```

(Note: the markup remains the same as in the basic example)

## Options

The following options options are supported (the third parameter of createMeter)

- dbRange (number): the decibel level of the floor of the metter (default: 48)
- peakHoldDuration (number - optional): the number, in milliseconds, to hold the peak value before resetting (default: null, meaning never reset)

## Local Development

The minified javascript is built using rollup. There's no difference (for now) between the development version and the production version. To start a local server for debugging, run:

```
npm ci
npm run start
```

And open a browser to [http://localhost:6080/index.html](http://localhost:6080/index.html) to see a local version of the docs page.

## Contributing

Contributions are welcome! I'd love to hear any ideas for how these meters could be more user-friendly as well as about any bugs or unclear documentation. If you are at all interested in this project, please create an issue or pull request on this project's [github page](https://github.com/esonderegger/web-audio-peak-meter).

## Copyright and license

Code and documentation copyright 2016 [Evan Sonderegger](https://rpy.xyz) and released under the [MIT License](https://github.com/esonderegger/web-audio-peak-meter/blob/master/LICENSE).
