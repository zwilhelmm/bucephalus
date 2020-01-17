"use strict";

const co = require("co");

const isGeneratorFunction = fn => {
  const constructor = fn.constructor;
  if (!constructor) return false;
  if (
    "GeneratorFunction" === constructor.name ||
    "GeneratorFunction" === constructor.displayName
  )
    return true;
  return (
    typeof constructor.prototype.next === "function" &&
    typeof constructor.prototype.throw === "function"
  );
};

const isPromise = fn => typeof fn.then === "function";

const isAsyncAwait = fn => fn instanceof (async () => {}).constructor;

const asCallback = fn => {
  if (isGeneratorFunction(fn))
    return {
      ...co(fn),
      fname: fn.fname || fn.name
    };

  if (isPromise(fn))
    return {
      ...cb => fn.then(val => cb(null, val)).catch(err => cb(err)),
      fname: fn.fname || fn.name
    };

  if (isAsyncAwait(fn)) return;

  return fn;
};

module.exports = {
  asCallback: asCallback
};
