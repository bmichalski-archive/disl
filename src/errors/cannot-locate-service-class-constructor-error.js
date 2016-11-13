import DislError from './disl-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class CannotLocateServiceClassConstructorError extends DislError {

  /**
   * @param {string} className
   *
   * @returns {CannotLocateServiceClassConstructorError}
   */
  static createError(className: string): CannotLocateServiceClassConstructorError {
    return new CannotLocateServiceClassConstructorError(
      {
        className
      },
      'Cannot locate service class constructor for class "%s"',
      className
    )
  }
}

export default CannotLocateServiceClassConstructorError
