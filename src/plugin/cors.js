const get = require('lodash.get');
const set = require('lodash.set');
const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

const extractOrigins = (allowedOrigins, kwargs) => (Array.isArray(allowedOrigins)
  ? allowedOrigins
  : allowedOrigins(kwargs));

class Cors extends Plugin {
  constructor(options) {
    super(options);
    this.allowedHeaders = get(options, 'allowedHeaders', []);
    this.allowedOrigins = get(options, 'allowedOrigins', []);
  }

  static schema() {
    return {
      cors: Joi.object().keys({
        allowedHeaders: Joi.alternatives(Joi.array().items(Joi.string()), Joi.function()).optional(),
        allowedOrigins: Joi.alternatives(Joi.array().items(Joi.string()), Joi.function()).optional()
      }).optional()
    };
  }

  static weight() {
    return 0;
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  onRegister() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async onUnhandled(kwargs) {
    const { event, router, response } = kwargs;
    if (event.httpMethod !== 'OPTIONS') {
      return;
    }

    Object.assign(response, { statusCode: 403, body: '' });

    const {
      origin,
      'access-control-request-method': accessControlRequestMethod,
      'access-control-request-headers': accessControlRequestHeaders
    } = event.headers;
    if ([
      accessControlRequestMethod,
      accessControlRequestHeaders
    ].some((h) => h === undefined)) {
      return;
    }

    const allowedOrigins = await extractOrigins(this.allowedOrigins, kwargs);
    if (!allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
      Object.assign(response, {
        statusCode: 403,
        body: ''
      });
      return;
    }
    if (!router.recognize(`${accessControlRequestMethod}${get(event, 'path', '')}`)) {
      return;
    }
    const allowedHeaders = [
      'Content-Type',
      'Accept',
      ...(Array.isArray(this.allowedHeaders) ? this.allowedHeaders : await this.allowedHeaders(kwargs))
    ].map((h) => h.toLowerCase());
    if (!accessControlRequestHeaders.split(',').map((h) => h
      .trim().toLowerCase()).every((h) => allowedHeaders.includes(h))) {
      return;
    }

    Object.assign(response, {
      statusCode: 200,
      body: '',
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': allowedHeaders.join(','),
        'Access-Control-Allow-Methods': accessControlRequestMethod
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async after() {}

  async finalize(kwargs) {
    const { event, response } = kwargs;
    if (event.httpMethod === 'OPTIONS') {
      return;
    }
    const origin = get(event, 'headers.origin');
    if (origin === undefined) {
      return;
    }
    const allowedOrigins = await extractOrigins(this.allowedOrigins, kwargs);
    if (!allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
      return;
    }
    set(response, ['headers', 'Access-Control-Allow-Origin'], origin);
  }
}
module.exports = Cors;
