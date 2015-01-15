/**
 * Module dependencies
 */

var base64 = require('urlsafe-base64');
var LRU = require('lru-cache');

/**
 * Create a global cache for non-context functions
 */

var globalCache = new LRU(1000);

/**
 * Create a url context
 *
 * @param {String} API_URL
 * @return {Object}
 */

exports = module.exports = function(API_URL) {
  var cache = new LRU(1000);
  return {
    encode: encode.bind(null, cache, API_URL),
    encodeParams: encodeParams.bind(null, cache, API_URL),
    decode: decode.bind(null, cache, API_URL),
    decodeParams: decodeParams.bind(null, cache, API_URL)
  };
};

/**
 * Expose the raw encode function
 */

exports.encode = encode.bind(null, globalCache);

/**
 * Expose the raw encode params function
 */

exports.encodeParams = encodeParams.bind(null, globalCache);

/**
 * Expose the raw decode function
 */

exports.decode = decode.bind(null, globalCache);

/**
 * Expose the raw decode params function
 */

exports.encodeParams = decodeParams.bind(null, globalCache);

/**
 * Encode an href object
 */

function encode(cache, API_URL, obj) {
  if (!obj) return null;
  if (!obj.href) return obj;

  var href = API_URL ?
    obj.href.replace(API_URL, '~') :
    obj.href;

  var cached = cache.get(href);
  if (cached) return cached;

  var encoded = base64.encode(new Buffer(href)).toString();
  cache.set(href, encoded);
  return encoded;
}

/**
 * Encode a set of params
 */

function encodeParams(cache, API_URL, params) {
  var obj = {}, v;
  for (var k in params) {
    if (!params.hasOwnProperty(k)) continue;
    v = obj[k] = encode(cache, API_URL, params[k]);
    if (!v) return;
  }
  return obj;
}

/**
 * Decode an encoded uri component
 */

function decode(cache, API_URL, str) {
  var cached = cache.get(str);
  if (typeof cached !== 'undefined') return cached;
  if (typeof str !== 'string') return null;

  var decoded = base64.decode(str).toString().replace(/\0/g, '');

  var out = validate(decoded) ?
    {href: decoded.replace(/^~/, API_URL)} :
    str;

  // cache the decoded value since this ends up being pretty expensive
  cache.set(str, out);

  return out;
}

/**
 * Decode a set of params
 */

function decodeParams(cache, API_URL, params) {
  var obj = {}, v;
  for (var k in params) {
    if (!params.hasOwnProperty(k)) continue;
    obj[k] = decode(cache, API_URL, params[k]);
  }
  return obj;
}

var IS_URL = /^(~|http|\/)/;
var INVALID_URL_CHARS = /[^a-z0-9\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\.\-\_\~\%]/i;

/**
 * Validate url values
 */

function validate(str) {
  return IS_URL.test(str) && !INVALID_URL_CHARS.test(str);
}
