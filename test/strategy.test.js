var Auth0Strategy = require('../lib');
var assert = require('assert');
var should = require('should');
var pkg = require('../package.json');

describe('auth0 strategy', function () {
  before(function () {
    this.strategy = new Auth0Strategy({
       domain:       'test.auth0.com',
       clientID:     'testid',
       clientSecret: 'testsecret',
       callbackURL:  '/callback'
      },
      function(accessToken, idToken, profile, done) {}
    );
  });

  it('authorizationURL should have the domain', function () {
    this.strategy.options
      .authorizationURL.should.eql('https://test.auth0.com/authorize');
  });

  it('tokenURL should have the domain', function () {
    this.strategy.options
      .tokenURL.should.eql('https://test.auth0.com/oauth/token');
  });

  it('userInfoURL should have the domain', function () {
    this.strategy.options
      .userInfoURL.should.eql('https://test.auth0.com/userinfo');
  });

  it('should include a telemetry header by default', function() {
    var headers = this.strategy.options.customHeaders;
    should.exist(headers['Auth0-Client']);
  });

  it('should include a correct telemetry values', function() {
    var telemetryValue = new Buffer( this.strategy.options.customHeaders['Auth0-Client'], 'base64' ).toString('ascii');
    var telemetryJson = JSON.parse(telemetryValue)

    telemetryJson.name.should.eql('passport-auth0');
    telemetryJson.version.should.eql(pkg.version);
    should.exist(telemetryJson.env);
    should.exist(telemetryJson.env.node);
  });

  it('state should be true by default', function() {
    this.strategy.options.state.should.be.true();
  });

  it('should copy options object without mutating', function () {
    var options = {
      domain:       'test.auth0.com',
      clientID:     'testid',
      clientSecret: 'testsecret',
      callbackURL:  '/callback'
    };
    var strategy = new Auth0Strategy(
      options,
      function(accessToken, idToken, profile, done) {}
    );

    strategy.options.should.be.not.equal(options);
    options.should.not.have.property('authorizationURL');
  });

  describe('authorizationParams', function () {

    it('should map the connection field', function () {
      var extraParams = this.strategy.authorizationParams({connection: 'foo'});
      extraParams.connection.should.eql('foo');
    });

    it('should not map the connection field if its not a string', function () {
      var extraParams = this.strategy.authorizationParams({connection: 42});
      should.not.exist(extraParams.connection);
    });

    it('should map the connection_scope field', function () {
      var extraParams = this.strategy.authorizationParams({
        connection: 'foo',
        connection_scope: 'foo'
      });
      extraParams.connection_scope.should.eql('foo');
    });

    it('should not map the connection_scope field if connection is not set', function () {
      var extraParams = this.strategy.authorizationParams({
        connection_scope: 'foo'
      });
      should.not.exist(extraParams.connection_scope);
    });

    it('should not map the connection_scope field if its not a string', function () {
      var extraParams = this.strategy.authorizationParams({
        connection: 'foo',
        connection_scope: 42
      });
      should.not.exist(extraParams.connection_scope);
    });

    it('should map the audience field', function () {
      var extraParams = this.strategy.authorizationParams({audience: 'foo'});
      extraParams.audience.should.eql('foo');
    });

    it('should not map the audience field if its not a string', function () {
      var extraParams = this.strategy.authorizationParams({audience: 42});
      should.not.exist(extraParams.audience);
    });

    it('should map the prompt field', function () {
      var extraParams = this.strategy.authorizationParams({prompt: 'foo'});
      extraParams.prompt.should.eql('foo');
    });

    it('should not map the prompt field if its not a string', function () {
      var extraParams = this.strategy.authorizationParams({prompt: 42});
      should.not.exist(extraParams.prompt);
    });

    it("shouldn't map any fields if non were specified", function () {
      var extraParams = this.strategy.authorizationParams({});
      Object.keys(extraParams).length.should.eql(0);
    });

    it("should treat no options as empty options", function () {
      var extraParams = this.strategy.authorizationParams(undefined);
      Object.keys(extraParams).length.should.eql(0);
    });

    it('should map the login_hint field', function () {
      var extraParams = this.strategy.authorizationParams({login_hint: 'test.user@auth0.com'});
      extraParams.login_hint.should.eql('test.user@auth0.com');
    });

    it('should not map the login_hint field if its not a string', function () {
      var extraParams = this.strategy.authorizationParams({login_hint: 42});
      should.not.exist(extraParams.login_hint);
    });

    it('should map the acr_values field', function () {
      var extraParams = this.strategy.authorizationParams({acr_values: 'dummy:1'});
      extraParams.acr_values.should.eql('dummy:1');
    });

    it('should not map the acr_values field if its not a string', function () {
      var extraParams = this.strategy.authorizationParams({acr_values: 1});
      should.not.exist(extraParams.acr_values);
    });

    it('should not map the acr_values field when not specified in options', function () {
      var extraParams = this.strategy.authorizationParams({});
      should.not.exist(extraParams.acr_values);
    });
  });

  describe('authenticate', function () {
    it('when there is an error querystring propagate', function (done) {

      this.strategy.fail = function (challenge, status) {
        challenge.should.eql('domain_mismatch');
        done();
      };

      this.strategy.authenticate({
        query: {
          error: 'domain_mismatch'
        }
      });
    });
  });
});

describe('auth0 strategy with a custom header', function () {
  var strategy = new Auth0Strategy(
    {
      domain:       'test.auth0.com',
      clientID:     'testid',
      clientSecret: 'testsecret',
      callbackURL:  '/callback',
      customHeaders: {
        testCustomHeader: 'Test Custom Header'
      }
    },
    function(accessToken, idToken, profile, done) {}
  );

  it('should not override a custom header', function() {
    should.exist(strategy.options.customHeaders);
    should.exist(strategy.options.customHeaders.testCustomHeader);
    strategy.options.customHeaders.testCustomHeader.should.eql('Test Custom Header');
  });

  it('should keep the telemetry header', function() {
    should.exist(strategy.options.customHeaders['Auth0-Client']);
  });
});

describe('auth0 strategy with state parameter disabled', function () {
  var strategy = new Auth0Strategy({
    domain:       'test.auth0.com',
    clientID:     'testid',
    clientSecret: 'testsecret',
    callbackURL:  '/callback',
    state: false
   },
   function(accessToken, idToken, profile, done) {}
  );

 it('state parameter should remain disabled', function() {
  strategy.options.state.should.be.false();
 });
});

describe('auth0 strategy with state parameter enabled explicitly', function () {
  var strategy = new Auth0Strategy({
    domain:       'test.auth0.com',
    clientID:     'testid',
    clientSecret: 'testsecret',
    callbackURL:  '/callback',
    state: true
   },
   function(accessToken, idToken, profile, done) {}
  );

 it('state parameter should be enabled', function() {
  strategy.options.state.should.be.true();
 });
});
