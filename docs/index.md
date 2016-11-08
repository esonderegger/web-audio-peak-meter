---
layout: default
title: Web Audio Peak Meters
---

# Web Audio Peak Meters

Customizable peak meters, using the web audio API.

## Demo

{% include demo.html %}

## Usage (basic)

To use these meters, first create a `<div>` with a width and height and an `<audio>` element:

    <div id="my-peak-meter" style="width: 5em; height: 20em; margin: 1em 0;">
    </div>
    <audio id="my-audio" preload="metadata" controls="controls">
      <source src="audio/marines_hymn.mp3" type="audio/mpeg">
    </audio>

Then, at the bottom of your `<body>` tag, add the script tag for these meters. Next, create an `AudioContext` if you don't have one already and create an [AudioNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode) from the `<audio>` element, connecting it to the destination node. Finally, create a meter node and call the `createMeter` function, passing in the Element object, the meter node, and an optional object for configuration options, like so:

    <script src="https://assets.rpy.xyz/web-audio-peak-meter.min.js"></script>
    <script>
      var myMeterElement = document.getElementById('my-peak-meter');
      var myAudio = document.getElementById('my-audio');
      var audioCtx = new window.AudioContext();
      var sourceNode = audioCtx.createMediaElementSource(myAudio);
      sourceNode.connect(audioCtx.destination);
      var meterNode = webAudioPeakMeter.createMeterNode(sourceNode, audioCtx);
      webAudioPeakMeter.createMeter(myMeterElement, meterNode, {});
    </script>

In this example we used an HTML5 audio element, but these meters can work with any web audio API source node. This example was just meant to show the simplest possible use case. If you are already familiar with the web audio API adapting this example to your needs should be fairly self-explanatory, but please reach out if anything isn't working or doesn't make sense.

## Usage (advanced)

If you are compiling your javascript with a tool like browserify, webpack, or rollup, you can integrate these meters into your site using the CommonJS `require()` syntax.

First, add web-audio-peak-meter as a dev dependency to your project:

    npm install --save-dev web-audio-peak-meter

Next, import the webAudioPeakMeter module into your javascript:

    var webAudioPeakMeter = require('web-audio-peak-meter');

Finally, use as you would in the above example:

    var myMeterElement = document.getElementById('my-peak-meter');
    var myAudio = document.getElementById('my-audio');
    var audioCtx = new window.AudioContext();
    var sourceNode = audioCtx.createMediaElementSource(myAudio);
    sourceNode.connect(audioCtx.destination);
    var meterNode = webAudioPeakMeter.createMeterNode(sourceNode, audioCtx);
    webAudioPeakMeter.createMeter(myMeterElement, meterNode, {});

(Note: the markup remains the same as in the basic example)

## Contributing

Contributions are welcome! I'd love to hear any ideas for how these meters could be more user-friendly as well as about any bugs or unclear documentation. If you are at all interested in this project, please create an issue or pull request on this project's [github page](https://github.com/esonderegger/web-audio-peak-meter).

## Copyright and license

Code and documentation copyright 2016 [Evan Sonderegger](https://rpy.xyz) and released under the [MIT License](https://github.com/esonderegger/web-audio-peak-meter/blob/master/LICENSE).
