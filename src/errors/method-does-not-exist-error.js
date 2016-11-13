import DislError from './disl-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class MethodDoesNotExistError extends DislError {

  /**
   * @param {string} methodName
   *
   * @returns {MethodDoesNotExistError}
   */
  static createError(methodName: string): MethodDoesNotExistError {
    return new MethodDoesNotExistError(
      {
        methodName
      },
      'Method "%s" does not exist',
      methodName
    )
  }
}

export default MethodDoesNotExistError
