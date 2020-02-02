"use strict";

// Third-party dependencies.
const chai = require("chai");
const moment = require("moment");
const nock = require("nock");
const sinon = require("sinon");

// File dependencies.
const retry = require("../src/retry.js");

// Setting up the environment.
const control = "The magic words are squeamish ossifrage";
const expect = chai.expect;
const spy = sinon.spy;

nock("https://www.example.com")
  .get("/")
  .reply(200, { body: control });

describe("Bucephalus Unit Test Suite", function() {
  describe("bucephalus-retry", () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers(
        moment.now(),
        "Date",
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval"
      );
    });

    afterEach(() => {
      clock.restore();
    });

    it("retries failed calls to functions with callback", () => {
      const cb = spy();
      let calls = 0;

      // Function should fail twice before succeeding on the third try.
      const sumCb = (x, y, cb) => {
        calls++;
        return calls < 3 ? cb(new Error(), undefined) : cb(undefined, x + y);
      };

      const retrySumCb = retry(sumCb);

      retrySumCb(3, 2, cb);

      clock.tick(1100);

      expect(calls).to.equal(1 + 2); // 1 success + 2 retries
      expect(cb.args.length).to.equal(1);
      expect(cb.args).to.deep.equal([[undefined, 5]]);
    });

    it("converts all functions in a module", () => {
      const cb = spy();
      let calls = 0;

      const sumCb = (x, y, cb) => {
        calls++;
        return calls < 3 ? cb(new Error(), undefined) : cb(undefined, x + y);
      };

      const sampleModule = { sumCb: sumCb };

      const retryModule = retry(sampleModule);

      retryModule.sumCb(3, 2, cb);

      clock.tick(1100);

      expect(calls).to.equal(1 + 2);
      expect(cb.args.length).to.equal(1);
      expect(cb.args).to.deep.equal([[undefined, 5]]);
    });

    it("returns an error after 5 retries", () => {
      // Call a regular function with a callback which always fails
      const cb = spy();
      const err = new Error("Sample error message");

      let calls = 0;

      const sumCb = function sumCb(x, y, cb) {
        calls++;
        cb(err, undefined);
      };
      const retrySumCb = retry(sumCb);
      retrySumCb(3, 2, cb);

      clock.tick(2000);

      // Expect 5 retries after the initial failure then an error
      expect(calls).to.equal(1 + 5);
      expect(cb.args.length).to.equal(1);
      expect(cb.args).to.deep.equal([[err, undefined]]);
    });

    it("returns an error without retrying", () => {
      // Call a regular function with a callback which always fails
      const cb = spy();
      const err = new Error("div");
      let calls = 0;
      const div = function div(x, y, cb) {
        calls++;
        cb(err, undefined);
      };
      const r = retry(div, 0);
      r(3, 2, cb);

      clock.tick(2000);

      // Expect 5 retries after the initial failure then an error
      expect(calls).to.equal(1);
      expect(cb.args.length).to.equal(1);
      expect(cb.args).to.deep.equal([[err, undefined]]);
    });

    it("returns an error marked as noretry", () => {
      // Call a regular function with a callback which always fails
      const cb = spy();
      const err = new Error("div");
      err.noretry = true;
      let calls = 0;
      const div = function div(x, y, cb) {
        calls++;
        cb(err, undefined);
      };
      const r = retry(div, 0);
      r(3, 2, cb);

      clock.tick(2000);

      // Expect 5 retries after the initial failure then an error
      expect(calls).to.equal(1);
      expect(cb.args.length).to.equal(1);
      expect(cb.args).to.deep.equal([[err, undefined]]);
    });
  });
});
