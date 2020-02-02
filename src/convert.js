"use strict";

// Third-party dependencies.
const _ = require("lodash");

const isPromise = obj => _.has(obj, "then") && typeof obj.then === "function";

const callbackify = fn => {
  if (isPromise(fn))
    return _.extend(
      cb => fn.then(val => cb(null, val)).catch(err => cb(err, null)),
      {
        fname: fn.fname || fn.name
      }
    );

  return fn;
};

module.exports = {
  callbackify: callbackify
};
