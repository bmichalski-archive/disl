import DislError from './disl-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class UnknownArgumentFormatError extends DislError {

  /**
   * @param {string} argument
   *
   * @returns {UnknownArgumentFormatError}
   */
  static createError(argument: string): UnknownArgumentFormatError {
    return new UnknownArgumentFormatError(
      {
        argument
      },
      'Unknown argument format, given argument was "%s"',
      argument
    )
  }
}

export default UnknownArgumentFormatError
