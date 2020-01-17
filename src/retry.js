"use strict";

const processOptions = (retries, min, max, factor, random) => {
  return {
    retries: retries || parseInt(process.env.RETRIES) || 5,
    minTimeout: min || parseInt(process.env.MIN) || 50,
    maxTimeout: max || parseInt(process.env.MAX) || 500,
    factor: factor || parseInt(process.env.FACTOR) || 2,
    randomize: random || parseInt(process.env.RANDOMIZE) || true
  };
};

const retry = (fn, retries, min, max, factor, random) => {
  const name = fn.fname || fn.name;

  const options = processOptions(retries, min, max, factor, random);

  return _.extend(
    () => {
      const args = initial(arguments);
      const cb = last(arguments);
      
    },
    {
      fname: fn.fname || fn.name
    }
  );
};

module.exports = {
  retry: retry
};
