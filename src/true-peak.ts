export function calculateLPFCoefficients(numCoefficients:number, upsampleFactor: number):number[] {
  const retCoefs = [];
  const fcRel = 1.0 / (4.0 * upsampleFactor);
  const minCoefN = 1 - Math.ceil(numCoefficients / 2);
  const maxCoefN = Math.floor(numCoefficients / 2);
  for (let n = minCoefN; n <= maxCoefN; n++) {
    const wn = 0.54 + 0.46 * Math.cos(2.0 * Math.PI * n / numCoefficients);
    let hn = 0.0;
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


export function filterSample(lpfBuffer:number[], lpfCoefficients: number[], upsampleFactor: number): number[]{
  const upsampled = [];
  for (let nA = 0; nA < upsampleFactor; nA += 1) {
    let nT = 0;
    let retVal = 0;
    for (let nc = nA; nc < lpfCoefficients.length; nc += upsampleFactor) {
      retVal += (lpfCoefficients[nc] * lpfBuffer[lpfBuffer.length - 1 - nT]);
      nT += 1;
    }
    upsampled.push(retVal);
  }
  return upsampled;
}

export function truePeakValues(input:Float32Array[], lpfBuffers:number[][], lpfCoefficients: number[], upsampleFactor: number): number[] {
  return input.map((channel, i) => {
    const lpfBuffer = lpfBuffers[i];
    let max = 0;
    for (let s = 0; s < channel.length; s++) {
      const sample = channel[s];
      lpfBuffer.push(sample);
      lpfBuffer.shift();
      const upSampled = filterSample(lpfBuffer, lpfCoefficients, upsampleFactor);
      for (let u = 0; u < upSampled.length; u++) {
        const uAbs = Math.abs(upSampled[u]);
        if (uAbs > max) {
          max = uAbs;
        }
      }
    }
    return max;
  });
}
