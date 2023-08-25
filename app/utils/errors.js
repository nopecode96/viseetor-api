const ExtendableError = require('es6-error');

/**
 * ViseetorError
 *
 * The ViseetorError is the base class for all errors which will get special
 * 
 *
 * @class ViseetorError
 * @extends {ExtendableError}
 */
class ViseetorError extends ExtendableError {

  /**
   * Creates an instance of ViseetorError.
   *
   * All Jenius Errors have a message an a code. The code is set to specific
   * values in base classes only.
   * @param {string} message - the error message, defaults to: 'Downstream Error'.
   * @param {string} code - the error code, defaults to: 'VISEETOR_ERROR'.
   * @param {number} statusCode - the HTTP status code, defaults to: '500'.
   * @param {Object} data - the error object and/or additional data.
   * @memberof ViseetorError
   */
  constructor(message = 'Viseetor error occurred', code = 500, statusCode = 500, success = false, data) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.success = success;
    this.data = data;
  }
}

module.exports = { ViseetorError };
