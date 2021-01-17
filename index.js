var webAudioPeakMeter = (function() {
  'use strict';
  var options = {
    borderSize: 2,
    fontSize: 9,
    backgroundColor: 'black',
    tickColor: '#ddd',
    labelColor: '#ddd',
    gradient: ['red 1%', '#ff0 16%', 'lime 45%', '#080 100%'],
    dbRange: 48,
    dbTickSize: 6,
    maskTransition: '0.1s',
    audioMeterStandard: 'peak-sample', // Could be "true-peak" (ITU-R BS.1770) or "peak-sample"
    showPerformance: false
  };
  var tickWidth;
  var elementWidth;
  var elementHeight;
  var meterHeight;
  var meterWidth;
  var meterTop;
  var vertical = true;
  var channelCount = 1;
  var channelMasks = [];
  var channelPeaks = [];
  var channelPeakLabels = [];
  var maskSizes = [];
  var textLabels = [];
  var refreshEveryApproxMs = 20;

  // Used for ITU-R BS.1770
  var lpfCoefficients = [];
  var lpfBuffer = undefined;
  var upsampleFactor = 4;
  var lastChannelTP = [];
  var decayFactor = 0.99999;

  var getBaseLog = function(x, y) {
    return Math.log(y) / Math.log(x);
  };

  var dbFromFloat = function(floatVal) {
    return getBaseLog(10, floatVal) * 20;
  };

  var setOptions = function(userOptions) {
    for (var k in userOptions) {
      if(userOptions.hasOwnProperty(k)) {
        options[k] = userOptions[k];
      }
    }
    tickWidth = options.fontSize * 2.0;
    meterTop = options.fontSize * 1.5 + options.borderSize;
  };

  var createMeterNode = function(sourceNode, audioCtx) {
    var c = sourceNode.channelCount;
    
    // Calculate refresh interval 
    var resfreshIntervalSamples = (refreshEveryApproxMs/1000 * sourceNode.sampleRate) * sourceNode.channelCount;

    var meterNode = audioCtx.createScriptProcessor(findAudioProcBufferSize(resfreshIntervalSamples), c, c);
    sourceNode.connect(meterNode).connect(audioCtx.destination);
    return meterNode;
  };

  var findAudioProcBufferSize = function (numSamplesIn) {
    return [256, 512, 1024, 2048, 4096, 8192, 16384].reduce((a, b) => {
      return Math.abs(b - numSamplesIn) < Math.abs(a - numSamplesIn) ? b : a;
    });
  };

  var createContainerDiv = function(parent) {
    var meterElement = document.createElement('div');
    meterElement.style.position = 'relative';
    meterElement.style.width = elementWidth + 'px';
    meterElement.style.height = elementHeight + 'px';
    meterElement.style.backgroundColor = options.backgroundColor;
    parent.appendChild(meterElement);
    return meterElement;
  };

  var createMeter = function(domElement, meterNode, optionsOverrides) {
    setOptions(optionsOverrides);
    elementWidth = domElement.clientWidth;
    elementHeight = domElement.clientHeight;
    var meterElement = createContainerDiv(domElement);
    if (elementWidth > elementHeight) {
      vertical = false;
    }
    meterHeight = elementHeight - meterTop - options.borderSize;
    meterWidth = elementWidth - tickWidth - options.borderSize;
    createTicks(meterElement);
    createRainbow(meterElement, meterWidth, meterHeight,
                  meterTop, tickWidth);
    channelCount = meterNode.channelCount;
    var channelWidth = meterWidth / channelCount;
    if (!vertical) {
      channelWidth = meterHeight / channelCount;
    }
    var channelLeft = tickWidth;
    if (!vertical) {
      channelLeft = meterTop;
    }
    for (var i = 0; i < channelCount; i++) {
      createChannelMask(meterElement, options.borderSize,
                        meterTop, channelLeft, false);
      channelMasks[i] = createChannelMask(meterElement, channelWidth,
                                          meterTop, channelLeft,
                                          options.maskTransition);
      channelPeaks[i] = 0.0;
      channelPeakLabels[i] = createPeakLabel(meterElement, channelWidth,
                                             channelLeft);
      channelLeft += channelWidth;
      maskSizes[i] = 0;
      textLabels[i] = '-∞';
    }
    meterNode.onaudioprocess = updateMeter;
    meterElement.addEventListener('click', function() {
      for (var i = 0; i < channelCount; i++) {
        channelPeaks[i] = 0.0;
        textLabels[i] = '-∞';
      }
    }, false);
    paintMeter();
  };

  var createTicks = function(parent) {
    var numTicks = Math.floor(options.dbRange / options.dbTickSize);
    var dbTickLabel = 0;
    if (vertical) {
      var dbTickTop = options.fontSize + options.borderSize;
      for (var i = 0; i < numTicks; i++) {
        var dbTick = document.createElement('div');
        parent.appendChild(dbTick);
        dbTick.style.width = tickWidth + 'px';
        dbTick.style.textAlign = 'right';
        dbTick.style.color = options.tickColor;
        dbTick.style.fontSize = options.fontSize + 'px';
        dbTick.style.position = 'absolute';
        dbTick.style.top = dbTickTop + 'px';
        dbTick.textContent = dbTickLabel + '';
        dbTickLabel -= options.dbTickSize;
        dbTickTop += meterHeight / numTicks;
      }
    } else {
      tickWidth = meterWidth / numTicks;
      var dbTickRight = options.fontSize * 2;
      for (var i = 0; i < numTicks; i++) {
        var dbTick = document.createElement('div');
        parent.appendChild(dbTick);
        dbTick.style.width = tickWidth + 'px';
        dbTick.style.textAlign = 'right';
        dbTick.style.color = options.tickColor;
        dbTick.style.fontSize = options.fontSize + 'px';
        dbTick.style.position = 'absolute';
        dbTick.style.right = dbTickRight + 'px';
        dbTick.textContent = dbTickLabel + '';
        dbTickLabel -= options.dbTickSize;
        dbTickRight += tickWidth;
      }
    }
  };

  var createRainbow = function(parent, width, height, top, left) {
    var rainbow = document.createElement('div');
    parent.appendChild(rainbow);
    rainbow.style.width = width + 'px';
    rainbow.style.height = height + 'px';
    rainbow.style.position = 'absolute';
    rainbow.style.top = top + 'px';
    if (vertical) {
      rainbow.style.left = left + 'px';
      var gradientStyle = 'linear-gradient(to bottom, ' +
        options.gradient.join(', ') + ')';
    } else {
      rainbow.style.left = options.borderSize + 'px';
      var gradientStyle = 'linear-gradient(to left, ' +
        options.gradient.join(', ') + ')';
    }
    rainbow.style.backgroundImage = gradientStyle;
    return rainbow;
  };

  var createPeakLabel = function(parent, width, left) {
    var label = document.createElement('div');
    parent.appendChild(label);
    label.style.textAlign = 'center';
    label.style.color = options.labelColor;
    label.style.fontSize = options.fontSize + 'px';
    label.style.position = 'absolute';
    label.textContent = '-∞';
    if (vertical) {
      label.style.width = width + 'px';
      label.style.top = options.borderSize + 'px';
      label.style.left = left + 'px';
    } else {
      label.style.width = options.fontSize * 2 + 'px';
      label.style.right = options.borderSize + 'px';
      label.style.top = (width * 0.25) + left + 'px';
    }
    return label;
  };

  var createChannelMask = function(parent, width, top, left, transition) {
    var channelMask = document.createElement('div');
    parent.appendChild(channelMask);
    channelMask.style.position = 'absolute';
    if (vertical) {
      channelMask.style.width = width + 'px';
      channelMask.style.height = meterHeight + 'px';
      channelMask.style.top = top + 'px';
      channelMask.style.left = left + 'px';
    } else {
      channelMask.style.width = meterWidth + 'px';
      channelMask.style.height = width + 'px';
      channelMask.style.top = left + 'px';
      channelMask.style.right = options.fontSize * 2 + 'px';
    }
    channelMask.style.backgroundColor = options.backgroundColor;
    if (transition) {
      if (vertical) {
        channelMask.style.transition = 'height ' + options.maskTransition;
      } else {
        channelMask.style.transition = 'width ' + options.maskTransition;
      }
    }
    return channelMask;
  };

  var maskSize = function(floatVal) {
    var meterDimension = vertical ? meterHeight : meterWidth;
    if (floatVal === 0.0) {
      return meterDimension;
    } else {
      var d = options.dbRange * -1;
      var returnVal = Math.floor(dbFromFloat(floatVal) * meterDimension / d);
      if (returnVal > meterDimension) {
        return meterDimension;
      } else {
        return returnVal;
      }
    }
  };

  var updateMeter = function(audioProcessingEvent) {
    var inputBuffer = audioProcessingEvent.inputBuffer;
    var channelMaxes = [];
    
    // Calculate peak levels
    const startTime = Date.now();
    if (options.audioMeterStandard == 'true-peak') {
      // This follows ITU-R BS.1770 (True Peak meter)
      channelMaxes = calculateTPValues(inputBuffer);
    }
    else {
      // Just get the peak level
      channelMaxes = calculateMaxValues(inputBuffer);
    }
    if (options.showPerformance) {
      console.log('Time to calculate peaks: ' + (Date.now() - startTime)+ 'ms')
    }
    // Update peak & text values
    for (var i = 0; i < channelCount; i++) {
      maskSizes[i] = maskSize(channelMaxes[i], meterHeight);
      if (channelMaxes[i] > channelPeaks[i]) {
        channelPeaks[i] = channelMaxes[i];
        textLabels[i] = dbFromFloat(channelPeaks[i]).toFixed(1);
      }
    }
  };

  var calculateMaxValues = function (inputBuffer) {
    var channelMaxes = [];
    var channelCount = inputBuffer.numberOfChannels;
    
    for (var c = 0; c < channelCount; c++) {
      channelMaxes[c] = 0.0;
      var channelData = inputBuffer.getChannelData(c);
      for (var s = 0; s < channelData.length; s++) {
          if (Math.abs(channelData[s]) > channelMaxes[c]) {
            channelMaxes[c] = Math.abs(channelData[s]);
          }
        }
    }
    return channelMaxes;
  };

  var calculateTPValues = function (inputBuffer) {
    var channelCount = inputBuffer.numberOfChannels;
    // Ini TP values
    if (lastChannelTP.length <= 0) {
      console.log('Initialing TP values for ' + channelCount + 'channels');
      lastChannelTP = createAndIniArray(channelCount, 0.0);
      // Decay time ms = 1700 and -20Db
      var attFactor = Math.pow (10.0, -20/10.0);
      var decayTimeS = 1700 / 1000;
      decayFactor = Math.pow(attFactor, 1.0/(inputBuffer.sampleRate * decayTimeS));
      console.log('Initialized with decayFactor ' + decayFactor);
    }
    if (lpfBuffer === undefined) {
      lpfBuffer = [];
      for (var c = 0; c < channelCount; c++) {
        lpfBuffer.push([]);
      }
    }
    for (var c = 0; c < channelCount; c++) {
      var channelData = inputBuffer.getChannelData(c);
      // Process according to ITU-R BS.1770
      var overSampledAndLPF = audioOverSampleAndFilter(channelData, inputBuffer.sampleRate, c);
      for (var s = 0; s < overSampledAndLPF.length; s++) {
        lastChannelTP[c] = lastChannelTP[c] * decayFactor;
        if (Math.abs(overSampledAndLPF[s]) > lastChannelTP[c]) {
          lastChannelTP[c] = Math.abs(overSampledAndLPF[s]);
        }
      }
    }
    return lastChannelTP;
  };

  var audioOverSampleAndFilter = function (channelData, inputFs, channelIndex) {
    var res = [];
    // Initialize filter coefficients and buffer
    if (lpfCoefficients.length <= 0) {
      console.log('Initialing filter components for ITU-R BS.1770, fs: ' + inputFs);
      if (inputFs >= 96000) {
        upsampleFactor = 2;
      }
      lpfCoefficients = calculateLPFCoefficients(33);
      console.log('Initialized lpfCoefficients lpfCoefficients=[' + lpfCoefficients.join(',') + '], and lpfBuffer');
    }
    if (lpfBuffer[channelIndex].length <= 0) {
      lpfBuffer[channelIndex] = createAndIniArray(lpfCoefficients.length, 0.0);
      console.log('Initialized lpfBuffer for channel index ' + channelIndex);
    }
    for (var ni = 0; ni < channelData.length; ni++) {
      var samplesOut = filterSample(channelData[ni], channelIndex); // 1 input sample -> generated upsampleFactor samples
      res = res.concat(samplesOut);
    }
    return res;
  };

  var calculateLPFCoefficients = function (numCoefficients) {
    var retCoefs = [];
    var fcRel = 1.0 / (4.0 * upsampleFactor);
    var coefsLim = Math.floor((numCoefficients - 1) / 2);
    for (var n = -coefsLim; n <= coefsLim; n++) {
      var wn = 0.54 + 0.46 * Math.cos(2.0 * Math.PI * n / numCoefficients);
      var hn = 0.0;
      if (n == 0) {
        hn = 2.0 * fcRel;
      }
      else {
        hn = Math.sin(2.0 * Math.PI * fcRel * n) / (Math.PI * n);
      }
      //Adapt windows & upsampler factor
      hn = (wn * hn) * upsampleFactor;
      retCoefs.push(hn);
    };
    return retCoefs;
  }

  var createAndIniArray = function (numElements, iniVal) {
    var ret = [];
    for (var n = 0; n < numElements; n++) {
      ret[n] = iniVal;
    }
    return ret;
  };

  var filterSample = function (sample, channelIndex) {
    var ret = [];
    var lpfChannelBuffer = lpfBuffer[channelIndex];
    
    lpfChannelBuffer.push(sample);
    if (lpfChannelBuffer.length >= lpfCoefficients.length) {
      lpfChannelBuffer.shift();
    }
    
    for (var nA = 0; nA < upsampleFactor; nA++)	{
      var nT = 0;
      var retVal = 0;
      for (var nc = nA; nc < lpfCoefficients.length; nc = nc + upsampleFactor) {
        retVal = retVal + (lpfCoefficients[nc] * lpfChannelBuffer[lpfChannelBuffer.length - 1 -nT]);
        nT++;
      }
      ret.push(retVal);
    }
    return ret;
  };

  var paintMeter = function() {
    for (var i = 0; i < channelCount; i++) {
      if (vertical) {
        channelMasks[i].style.height = maskSizes[i] + 'px';
      } else {
        channelMasks[i].style.width = maskSizes[i] + 'px';
      }
      channelPeakLabels[i].textContent = textLabels[i];
    }
    window.requestAnimationFrame(paintMeter);
  };

  return {
    createMeterNode: createMeterNode,
    createMeter: createMeter,
  };
})();

module.exports = webAudioPeakMeter;
