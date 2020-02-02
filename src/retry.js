"use strict";

const _ = require("lodash");
const convert = require("./convert.js");
const retry = require("retry");

const retryFn = (fn, retries, min, max, factor, random) => {
  const fnCb = convert.callbackify(fn);

  const options = {
    retries: retries ? retries : parseInt(process.env.RETRIES) || 5,
    minTimeout: min ? min : 50,
    maxTimeout: max ? max : 50,
    factor: factor ? factor : 2,
    randomize: random ? random : true,
    forever: false
  };

  const wrapper = _.extend(
    function() {
      const args = _.initial(arguments);
      const cb = _.last(arguments);

      if (retries === -1) options.forever = true;

      const op = retry.operation(options);

      op.attempt(function() {
        fnCb.apply(
          undefined,
          args.concat([
            function(err, val) {
              if (!(err && err.noretry) && op.retry(err)) return;

              const e = err ? (err.noretry ? err : op.errors()[0]) : undefined;
              cb(e, val);
            }
          ])
        );
      });
    },
    {
      fname: fnCb.fname || fnCb.name
    }
  );

  return wrapper;
};

const nameBind = (obj, key) =>
  _.extend(_.bind(obj[key], obj), {
    fname: obj[key].fname || (obj.fname || obj.name) + "." + key
  });

const retryWrapper = (fn, retries, min, max, factor, random) =>
  _.extend(
    retryFn(fn, retries, min, max, factor, random),
    _.fromPairs(_.toPairs(fn)),
    _.fromPairs(
      _.map(_.functions(fn), k => [
        k,
        retryFn(nameBind(fn, k), retries, min, max, factor, random)
      ])
    )
  );

module.exports = retryWrapper;
