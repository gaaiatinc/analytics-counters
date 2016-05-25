"use strict";

let assert = require("assert");

let SlidingHistogram = require("../lib/SlidingHistogram");

describe("analytics-counter tests", function () {

    this.timeout(300000);

    before(function (done) {
        done();
    });

    it("should collect stats of two types: event and number", function (done) {

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

        for (let i = 0; i < 1000000; i++) {
            let aRand = Math.random();
            histoEvent.count();
            histoNumber.count(aRand);
        }


        console.log("\n\nevent histogram:", histoEvent.getHistogram());
        console.log("\n\nnumber histogram:", histoNumber.getHistogram());
        done();
    });
});
