"use strict";

// Third-party dependencies.
import _ from "lodash";

interface WrappedFunction extends Function {
  fname?: string;
}

const callbackToGenerator: Generator<Function, Function, Error> = function(fn: WrappedFunction) {
  const args = Array.prototype.slice.call(arguments, 0, arguments.length);
  return {
    fname: fn.fname || fn.name,
    ...function*() {
      return yield fn.apply(null, ...args);
    }
  };
};

const promiseToCallback: WrappedFunction = function<CallbackValue>(
  fn: Promise<CallbackValue> & WrappedFunction
) {
  return {
    fname: fn.fname || fn.name,
    ...function(cb: Function) {
      return fn
        .then((val: CallbackValue) => cb(null, val))
        .catch((err: Error) => cb(err, null));
    }
  };
};

const callbackToPromise: Promise<PromisedValue> = function(
  fn: WrappedFunction
) {
  return {
    fname: fn.fname || fn.name,
    ...function<CallbackValue>() {
      const args = [...arguments].slice(0, -1);
      return new Promise((resolve, reject) => {
        const callbackValue = (err: Error, val: CallbackValue) =>
          err ? reject(err) : resolve(val);
        promiseToCallback(fn).apply(null, args.concat([callbackValue]));
      });
    }
  };
};

module.exports = {
  promiseToCallback,
  callbackToPromise,
  callbackToGenerator
};
