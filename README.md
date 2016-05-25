# analytics-counters

A node.js module implementing histogram-like counters over a sliding window, providing basic statistics calculations.

## Installation And Use

To install the analytics-counters module, use npm as follows:

```shell
npm install --save analytics-counter
```

The constructor of the SlidingHistogram class takes the following arguments:

```javascript
  new SlidingHistogram(attributeName, attributeType, slidingWindowSizeNumOfSlices, histogramSliceSizeMinutes, sliceTransitionCallback);
```

- attributeName: The name of the attribute being tracked.
- attributeType: The type of the attribute being tracked: "event" or "number".
- slidingWindowSizeNumOfSlices: The length in number of slices of the sliding window (minimum 1, and maximum 2048 slices)
- histogramSliceSizeMinutes: The duration in minutes of the histogram slice.
- sliceTransitionCallback: An optional callback function called when the sliding window histogram has transitioned to a new slice. The singnature of the callback is: callback(completedHistogramSlice), where, completedHistogramSlice is the completed slice, when a new slice has just started. The callback can be used to persist the completed slice in a different medium, such as a database.

Then, in your code, use the module as in the following example.

You can also call the method:
``` javascript
getHistogram();
```
at any time to get the entire array of slices (for example to send it to the browser for plotting and charting).


## Example

(copied from the mocha test case):

```javascript
let SlidingHistogram = require("analytics-counters");
...
let histoNumber = new SlidingHistogram(
    "numberCounter",
    "number",
    10,
    1,
    (statsSlice) => {
        console.log("\n\n Number Slice completed: ", statsSlice);
    }
);

let histoEvent = new SlidingHistogram(
    "numberCounter",
    "event",
    10,
    1,
    (statsSlice) => {
        console.log("\n\n Event Slice completed: ", statsSlice);
    }
);
```
