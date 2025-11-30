/**
 * Result Type for Functional Error Handling
 * 
 * A functional approach to error handling that makes success and failure explicit.
 * Instead of throwing exceptions, functions return a Result that can be either
 * a success with a value or a failure with an error.
 * 
 * @example
 * // Success case
 * const result = Result.success([1, 2, 3]);
 * if (result.isSuccess()) {
 *   console.log(result.value); // [1, 2, 3]
 * }
 * 
 * @example
 * // Failure case
 * const result = Result.failure(new Error('Something went wrong'));
 * if (result.isFailure()) {
 *   console.log(result.error.message); // 'Something went wrong'
 * }
 */
export class Result {
  /**
   * @private
   * @param {*} value - The success value
   * @param {Error} error - The error object
   * @param {boolean} _isSuccess - Whether this is a success result
   */
  constructor(value, error, _isSuccess) {
    this._value = value;
    this._error = error;
    this._isSuccess = _isSuccess;
  }

  /**
   * Create a successful Result
   * @template T
   * @param {T} value - The success value
   * @returns {Result} A successful Result containing the value
   */
  static success(value) {
    return new Result(value, null, true);
  }

  /**
   * Create a failed Result
   * @template E
   * @param {E} error - The error object
   * @returns {Result} A failed Result containing the error
   */
  static failure(error) {
    return new Result(null, error, false);
  }

  /**
   * Check if this Result is a success
   * @returns {boolean} True if this is a success Result
   */
  isSuccess() {
    return this._isSuccess;
  }

  /**
   * Check if this Result is a failure
   * @returns {boolean} True if this is a failure Result
   */
  isFailure() {
    return !this._isSuccess;
  }

  /**
   * Get the success value
   * @throws {Error} If called on a failure Result
   * @returns {*} The success value
   */
  get value() {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from a failed Result');
    }
    return this._value;
  }

  /**
   * Get the error
   * @throws {Error} If called on a success Result
   * @returns {Error} The error object
   */
  get error() {
    if (this._isSuccess) {
      throw new Error('Cannot get error from a successful Result');
    }
    return this._error;
  }

  /**
   * Map the success value to a new value
   * @template T, U
   * @param {function(T): U} fn - Function to transform the value
   * @returns {Result} A new Result with the transformed value, or the same failure
   */
  map(fn) {
    if (this.isFailure()) {
      return this;
    }
    try {
      return Result.success(fn(this._value));
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Chain multiple Result-returning operations
   * @template T, U
   * @param {function(T): Result<U>} fn - Function that returns a Result
   * @returns {Result} The Result from the function, or the same failure
   */
  flatMap(fn) {
    if (this.isFailure()) {
      return this;
    }
    try {
      return fn(this._value);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Get the value or a default if this is a failure
   * @template T
   * @param {T} defaultValue - The default value to return on failure
   * @returns {T} The success value or the default value
   */
  getOrElse(defaultValue) {
    return this.isSuccess() ? this._value : defaultValue;
  }

  /**
   * Get the value or compute a default if this is a failure
   * @template T
   * @param {function(Error): T} fn - Function to compute default value from error
   * @returns {T} The success value or the computed default
   */
  getOrElseGet(fn) {
    return this.isSuccess() ? this._value : fn(this._error);
  }
}
