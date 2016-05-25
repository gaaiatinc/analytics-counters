/**
 *
 * @author Ali Ismael <ali@gaaiat.com>
 * @since 2016-05-02
 *
 */
"use strict";

class SlidingHistogram {

    /**
     * [constructor description]
     * @param  {[string]} attributeName            The name of the attribute being tracked.
     * @param  {[string]} attributeType            The type of the attribute being tracked: "event" or "number".
     * @param  {[number]} slidingWindowSizeNumOfSlices   The length in number of slices of the sliding window (between 1 and 2048)
     * @param  {[number]} histogramSliceSizeMinutes  The length in minutes of the histogram slice.
     * @param  {[function]} sliceTransitionCallback    An optional callback function called when the sliding
     *                                             window histogram has transitioned to a new slice.
     *                                             The singnature of the callback is:
     *                                             callback(completedHistogramSlice).  The completed slice, when
     *                                             a new slice has just started.
     *
     * @return {[type]}                            none.
     */
    constructor(attributeName, attributeType, slidingWindowSizeNumOfSlices, histogramSliceSizeMinutes, sliceTransitionCallback) {

        if ((attributeType !== "event") && (attributeType !== "number")) {
            throw new Error("attributeType must be a string value \"event\" or \"number\"");
        }

        if ((typeof histogramSliceSizeMinutes !== "number") || (histogramSliceSizeMinutes <= 0)) {
            throw new Error("histogramSliceSizeMinutes must be a positive integer (> 0)");
        }

        if ((typeof slidingWindowSizeNumOfSlices !== "number") || (slidingWindowSizeNumOfSlices <= 0) || (slidingWindowSizeNumOfSlices > 2048)) {
            throw new Error("slidingWindowSizeNumOfSlices must be a positive integer between 1 and 2048 slices.");
        }

        this.attributeName = attributeName;
        this.attributeType = attributeType;

        this.slidingWindowSizeNumOfSlices = slidingWindowSizeNumOfSlices;
        this.histogramSliceSizeMillis = histogramSliceSizeMinutes * 60 * 1000;
        this.sliceTransitionCallback = sliceTransitionCallback;

        this.sliceHistogram = [];
        this.currentSlice = this.__createNewSlice();
    }

    /**
     * Create a new sliceHistogram
     *
     * @return {[object]} new empty slice
     */
    __createNewSlice() {
        let nowTime = (new Date()).getTime();
        let newSlice = {};

        newSlice.sliceStartTimeMillis = nowTime;
        newSlice.sliceLastUpdateTimeMillis = nowTime;
        newSlice.sliceCounter = 0;
        newSlice.sliceRate = 0;

        if (this.attributeType === "number") {
            newSlice.sliceAccumulator = 0;
            newSlice.sliceMinValue = Number.POSITIVE_INFINITY;
            newSlice.sliceMaxValue = Number.NEGATIVE_INFINITY;
            newSlice.sliceAverageValue = 0;
        }

        this.sliceHistogram.push(newSlice);
        return newSlice;
    }

    /**
     * This is a utility "private" function to check if the current slice is over,
     * and to transition to another one.
     *
     * @return none.
     */
    __checkForAndPerformSliceTransition() {
        let nowTime = (new Date()).getTime();

        if ((nowTime - this.currentSlice.sliceStartTimeMillis) >= this.histogramSliceSizeMillis) {
            let tempSlice = this.currentSlice;
            this.currentSlice = this.__createNewSlice();

            if (this.sliceHistogram.length >= this.slidingWindowSizeNumOfSlices) {
                this.sliceHistogram.shift();
            }

            if (typeof this.sliceTransitionCallback === "function") {
                this.sliceTransitionCallback(tempSlice);
            }
        }
    }

    /**
     * [__updateStatsInCurrentSlice description]
     * @param  {[type]} newAttributeValue new value to update the current slice
     *                                    statistics with.
     *
     * @return {[type]}                   none.
     */
    __updateStatsInCurrentSlice(newAttributeValue) {

        let currentSliceDurationMinutes = (this.currentSlice.sliceLastUpdateTimeMillis - this.currentSlice.sliceStartTimeMillis) / 60000;
        if (currentSliceDurationMinutes < 1) {
            currentSliceDurationMinutes = 1;
        }

        this.currentSlice.sliceCounter++;
        this.currentSlice.sliceLastUpdateTimeMillis = (new Date()).getTime();

        if (this.attributeType === "number") {
            if (typeof newAttributeValue !== "number") {
                throw new Error("newAttributeValue must be a number.");
            }
            //the event type is a number:
            //
            if (this.currentSlice.sliceMinValue > newAttributeValue) {
                this.currentSlice.sliceMinValue = newAttributeValue;
            }

            if (this.currentSlice.sliceMaxValue < newAttributeValue) {
                this.currentSlice.sliceMaxValue = newAttributeValue;
            }

            this.currentSlice.sliceAccumulator += newAttributeValue;
            this.currentSlice.sliceAverageValue = this.currentSlice.sliceAccumulator / this.currentSlice.sliceCounter;
        }

        this.currentSlice.sliceRate = this.currentSlice.sliceCounter / currentSliceDurationMinutes;
    }

    /**
     * [count description]
     * @param  {[type]} newAttributeValue new value to update the current slice
     *                                    statistics with.
     *
     * @return {[type]}                   none.
     */
    count(newAttributeValue) {
        this.__checkForAndPerformSliceTransition();
        this.__updateStatsInCurrentSlice(newAttributeValue);
    }

    /**
     *
     * @return {[object]} an object with the attributeName and the sliceArray.
     */
    getHistogram() {
        return {
            "attributeName": this.attributeName,
            "sliceArray": this.sliceHistogram
        };
    }
}

/**
 * [exports description]
 * @type {[type]}
 */
module.exports = SlidingHistogram;
