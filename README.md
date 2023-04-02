# Web Audio Peak Meters

Customizable peak meters, using the web audio API. It can measure peak or true peak based on [ITU-R BS.1770](https://www.itu.int/rec/R-REC-BS.1770)

## Examples

- [Single audio element](https://esonderegger.github.io/web-audio-peak-meter/examples/audio.html)
- [Single video element](https://esonderegger.github.io/web-audio-peak-meter/examples/video.html)
- [An oscillator node](https://esonderegger.github.io/web-audio-peak-meter/examples/osc.html)
- [Variations using configuration](https://esonderegger.github.io/web-audio-peak-meter/examples/variations.html)
- [Dynamic creation and cleanup](https://esonderegger.github.io/web-audio-peak-meter/examples/cleanup.html)
- [Usage without a DOM node](https://esonderegger.github.io/web-audio-peak-meter/examples/nodom.html)

## Usage (basic)

To use these meters, first create a `<div>` with a width and height and an `<audio>` element:

```html
<div id="my-peak-meter" style="width: 5em; height: 20em; margin: 1em 0;"></div>
<audio id="my-audio" preload="metadata" controls="controls">
  <source src="audio/marines_hymn.mp3" type="audio/mpeg" />
</audio>
```

Then, at the bottom of your `<body>` tag, add the script tag for these meters. I recommend copying the latest `web-audio-peak-meter-<version>.min.js` file from the `docs` directory and self-hosting it, or installing via [npm](https://www.npmjs.com/package/web-audio-peak-meter) and bundling it with your application. Next, create an `AudioContext` if you don't have one already and create an [AudioNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode) from the `<audio>` element, connecting it to the destination node. Finally, create a meter node and call the `createMeter` function, passing in the Element object, the meter node, and an optional object for configuration options, like so:

```html
<script>
  const myMeterElement = document.getElementById('my-peak-meter');
  const myAudio = document.getElementById('my-audio');
  const audioCtx = new window.AudioContext();
  const sourceNode = audioCtx.createMediaElementSource(myAudio);
  sourceNode.connect(audioCtx.destination);
  const myMeter = new webAudioPeakMeter.WebAudioPeakMeter(sourceNode, myMeterElement);
  myAudio.addEventListener('play', function () {
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
const webAudioPeakMeter = require('web-audio-peak-meter');
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
myAudio.addEventListener('play', function () {
  audioCtx.resume();
});
```

(Note: the markup remains the same as in the basic example)

## Options

The following options options are supported (the third parameter of the constructor)

- vertical (boolean): if set to `true`, displays a vertical meter (default: `false`)
- borderSize (number): the number of pixels to use as a border (default: `2`)
- fontSize (number): the font size in pixels used by the labels (default: `9`)
- backgroundColor (string): the background of the meter - can take any css format, for example `#123456`, `rgba(0,0,0, 0.5)`, or `slategray` (default: `black`),
- tickColor (string): the color of the ticks - can take any css format (default: `lightgray`),
- labelColor (string): the color of the held peak labels - can take any css format (default: `lightgray`),
- gradient (string[]): an array of space delimited color/percentage pairs to be used by the meter bars (default: `['red 1%', '#ff0 16%', 'lime 45%', '#080 100%']`),
- dbRangeMin (number): the decibel level of the floor of the metter (default: `-48`)
- dbRangeMax (number): the decibel level of the ceiling of the metter (default: `0`)
- dbTickSize (number): the number of decibels to have between ticks (default: `6`)
- maskTransition (string): value used for the `transition` property of the meter bars. Use a longer value for a smoother animation and a shorter value for faster updates (default: `0.1s`)
- audioMeterStandard (string): Can be either `peak-sample`, or `true-peak` (default: `peak-sample`)
- peakHoldDuration (number): the number, in milliseconds, to hold the peak value before resetting (default: `0`, meaning never reset)

## Frequently encountered problems

### The AudioContext was not allowed to start

In an effort to prevent unwanted auto-playing audio, some browsers do not allow the web audio API's `AudioContext` to start when it is first created. It must be started by calling `resume()` on the context after the user interacts with the page. Different browsers implement this requirement differently, however:

- Chrome: `AudioContext` is initially paused. Can be resumed by either a callback attached to a click event or by adding a listener to an audio/video element's `play` event. ([more information](https://developer.chrome.com/blog/autoplay/#webaudio))
- Firefox: `AudioContext` is initially running
- Webkit/Safari: `AudioContext` is initially paused. Can be resumed only by a callback attached to a click event - listening for `play` events on HTML media elements does not work.

### MediaElementAudioSource outputs zeroes due to CORS access restrictions

If using `<audio>` or `<video>` elements and the source media is not on the same domain as the web site, the server serving the media must add an `access-control-allow-origin` header with the domain of the web site to the response. ([more information](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin))

## Local Development

The minified javascript is built using rollup. There's no difference (for now) between the development version and the production version. To start a local server for debugging, run:

```
npm ci
npm run start
```

And open a browser to [http://localhost:6080/web-audio-peak-meter/index.html](http://localhost:6080/web-audio-peak-meter/index.html) to see a local version of the docs page.

## Contributing

Contributions are welcome! I'd love to hear any ideas for how these meters could be more user-friendly as well as about any bugs or unclear documentation. If you are at all interested in this project, please create an issue or pull request on this project's [github page](https://github.com/esonderegger/web-audio-peak-meter).

## Copyright and license

Code and documentation copyright 2016 [Evan Sonderegger](https://rpy.xyz) and released under the [MIT License](https://github.com/esonderegger/web-audio-peak-meter/blob/master/LICENSE).
