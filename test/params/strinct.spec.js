const expect = require('chai').expect;
const api = require('../../src/index').Api();

describe('Testing Strinct Parameter', () => {
  describe('Testing query param', () => {
    const queryParam = api.Strinct('value', 'query');
    it('Testing valid query parameter', () => {
      expect(queryParam.get({
        queryStringParameters: {
          value: 'value'
        }
      })).to.equal('value');
    });

    it('Testing invalid query parameter (rejected string)', () => {
      expect(() => queryParam.get({
        queryStringParameters: {
          value: ''
        }
      })).to.throw('Invalid Value for query-Parameter "value" provided.');
    });
  });

  describe('Testing json param', () => {
    const jsonParam = api.Strinct('value', 'json');
    it('Testing valid json parameter', () => {
      expect(jsonParam.get({
        body: {
          value: 'value'
        }
      })).to.equal('value');
    });

    it('Testing invalid json parameter (rejected string)', () => {
      expect(() => jsonParam.get({
        body: {
          value: 'undefined'
        }
      })).to.throw('Invalid Value for json-Parameter "value" provided.');
    });
  });

  describe('Testing optional param', () => {
    const jsonParamOptional = api.Strinct('value', 'json', { required: false });
    it('Testing optional json parameter', () => {
      expect(jsonParamOptional.get({
        body: {}
      })).to.equal(undefined);
    });
  });
});
