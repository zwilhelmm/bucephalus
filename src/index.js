"use strict";
const request = require("request");
const _ = require("lodash");

const defaultRequest = request.defaults({
  forever: false,
  json: true,
  rejectUnauthorized: true,
  pool: {
    maxSockets: parseInt(process.env.MAX_SOCKETS) || 1000
  }
});

const target = (m, uri, opt, cb) => {
  const resolveRoute = (template, parms) => {
    return template.replace(/:[a-z_][a-z0-9_]*/gi, name => {
      const k = name.substr(1);
      return parms[k] === undefined ? name : parms[k];
    });
  };

  const resolveOptions = (uri, opt) => {
    if (typeof opt === "object") return _.extend({}, opt, { route: uri });
    if (typeof uri === "string") return { route: uri };

    return _.extend({}, uri, { route: uri.route || uri.uri });
  };

  const resolveURI = opts =>
    _.extend({}, opts, {
      uri: resolveRoute(opts.route, opts)
    });

  // Determine the target method
  const resolveMethod = (m, opts) => _.extend({}, opts, m ? { method: m } : {});

  // Return the request target configuration
  const options = resolveMethod(m, resolveURI(resolveOptions(uri, opt)));

  const callback = typeof opt === "function" && !cb ? opt : cb;

  return {
    // uri: opts.uri,
    uri: opts.baseUrl ? opts.baseUrl + opts.uri : opts.uri,
    options: options,
    callback: callback
  };
};
/*
  Wrapper around the request module.
*/
const createRequest = (uri, opts, cb) => {
  //
};

const extendRequest = fn => {
  return _.extend(createRequest(), {
    get: httpVerb("GET", opts),
    head: httpVerb("HEAD", opts),
    patch: httpVerb("PATCH", opts),
    put: httpVerb("PUT", opts),
    post: httpVerb("POST", opts),
    delete: httpVerb("DELETE", opts),
    params: params,
    route: route,
    fname: fn.fname || fn.name
  });
};
