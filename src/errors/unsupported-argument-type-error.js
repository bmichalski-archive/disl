import DislError from './disl-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class UnsupportedArgumentTypeError extends DislError {

  /**
   * @param {any} arg
   *
   * @returns {UnsupportedArgumentTypeError}
   */
  static createError(arg: any): UnsupportedArgumentTypeError {
    return new UnsupportedArgumentTypeError(
      {
        arg
      },
      'Unsupported arg of type "%s"',
      typeof arg
    )
  }
}

export default UnsupportedArgumentTypeError
