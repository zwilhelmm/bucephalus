"use strict";

const _ = require("lodash");

const createException = res => {
  const message =
    (res.body && res.body.message) ||
    (res.body && res.body.error) ||
    `HTTP response status code ${res.statusCode}`;

  return _.extend(new Error(message), res.body, {
    code: res.statusCode,
    statusCode: statusCode,
    headers: res.headers
  });
};

module.exports = createException;
