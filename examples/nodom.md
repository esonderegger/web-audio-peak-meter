# Usage without a DOM node

For users who desire the metering functionality of this library but not the visual presentation, it's possible to create an instance without providing a DOM node as a second argument.

To get the peaks at the current moment, as well as the maximum values for each channel, since the last time `clearPeaks()` was called, call the instance's `getPeaks()` method.
