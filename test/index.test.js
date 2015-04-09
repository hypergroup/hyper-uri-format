/**
 * Module dependencies
 */

var should = require('should');
var format = require('..');

var roots = {
  'http://example.com': {
    passes: {
      'L2FwaS91cmw': '/api/url',
      'fi9hcGkvdXNlcnM': 'http://example.com/api/users',
      'fi9hcGkvdXNlcnM': 'ws://example.com/api/users',
      'aHR0cDovL3d3dy5leGFtcGxlLmNvbS9hcGk': 'http://www.example.com/api'
    },
    fails: [
      'fi9xdwl6emvzlzI0oty1'
    ]
  },
  'http://example.com/api': {
    passes: {
      'L2FwaS91cmw': '/api/url',
      'fi91c2Vycw': 'http://example.com/api/users',
      'fi91c2Vycw': 'ws://example.com/api/users',
      'aHR0cDovL3d3dy5leGFtcGxlLmNvbS9hcGk': 'http://www.example.com/api'
    },
    fails: [
      'fi9xdwl6emvzlzI0oty1'
    ]
  }
};

roots['http://example.com/'] = roots['http://example.com'];

describe('hyper-uri-format', function() {
  Object.keys(roots).forEach(function(root) {
    var passes = roots[root].passes;
    var fails = roots[root].fails;

    describe(root, function() {
      var context;
      beforeEach(function() {
        context = format(root);
      });

      Object.keys(passes).forEach(function(input) {
        var output = passes[input];
        it('should encode "' + output + '" to "' + input + '"', function() {
          context.encode({href: output}).should.eql(input);
        });
        it('should decode "' + input + '" to "' + output.replace(/^ws/, 'http') + '"', function() {
          context.decode(input).should.eql({href: output.replace(/^ws/, 'http')});
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
          acc[i] = {href: passes[key].replace(/^ws/, 'http')};
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
  });
});
