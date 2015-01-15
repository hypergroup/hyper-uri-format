/**
 * Module dependencies
 */

var should = require('should');
var format = require('..');

var passes = {
  'L2FwaS91cmw': '/api/url',
  'fi9hcGkvdXNlcnM': 'http://example.com/api/users'
};

var fails = [
  'fi9xdwl6emvzlzI0oty1'
];

describe('hyper-uri-format', function() {
  var context;
  beforeEach(function() {
    context = format('http://example.com');
  });

  Object.keys(passes).forEach(function(input) {
    var output = passes[input];
    it('should encode "' + output + '" to "' + input + '"', function() {
      context.encode({href: output}).should.eql(input);
    });
    it('should decode "' + input + '" to "' + output + '"', function() {
      context.decode(input).should.eql({href: output});
    });
  });

  fails.forEach(function(input) {
    it('should fail to decode "' + input + '"', function() {
      context.decode(input).should.eql(input);
    });
  });

  it('should pass through non-href strings', function() {
    context.encode('thingy').should.eql('thingy');
    context.decode('kljasdf').should.eql('kljasdf');
  });

  describe('params', function() {
    var params = Object.keys(passes).reduce(function(acc, key, i) {
      acc[i] = {href: passes[key]};
      return acc;
    }, {});

    var expected = Object.keys(passes).reduce(function(acc, key, i) {
      acc[i] = key;
      return acc;
    }, {});

    it('should encode params', function() {
      context.encodeParams(params).should.eql(expected);
    });

    it('should decode params', function() {
      context.decodeParams(expected).should.eql(params);
    });

    it('should bail when encoding null values', function() {
      should.not.exist(context.encodeParams({foo: null}));
    });
  });
});
