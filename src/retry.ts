"use strict";

import _ from "lodash";
import retry from "retry";

type RetryError = {
  message: string;
  name: string;
  noretry?: boolean;
};

type RetryOptions = {
  retries: Number;
  minTimeout: Number;
  maxTimeout: Number;
  factor: Number;
  randomize: Boolean;
  forever: Boolean;
};

type RetryFunction = {
  //
};

const retryFunction = (
  fn: Function & { fname?: string },
  retries: Number,
  min: Number,
  max: Number,
  factor: Number,
  random: boolean
): RetryFunction => {
  const options: RetryOptions & object = {
    retries: retries ? retries : parseInt(process.env.RETRIES) || 5,
    minTimeout: min ? min : 50,
    maxTimeout: max ? max : 50,
    factor: factor ? factor : 2,
    randomize: random ? random : true,
    forever: false
  };

  return {
    fname: fn.fname || fn.name,
    ...function() {
      const parameters = Array.prototype.slice.call(
        arguments,
        0,
        arguments.length
      );
      const args = parameters.slice(0, -1);
      const cb = parameters[parameters.length - 1];

      if (retries === -1) options.forever = true;

      const op = retry.operation(options);

      const retryArgument = [
        function<CallbackValue>(err: RetryError, val: CallbackValue) {
          if (!(err && err.noretry) && op.retry(err)) return;

          const retryError = err.noretry ? err : op.errors()[0];
          const callbackError = err ? retryError : undefined;

          cb(callbackError, val);
        }
      ];

      op.attempt(function() {
        fn.apply(undefined, args.concat(retryArgument));
      });
    }
  };
};
