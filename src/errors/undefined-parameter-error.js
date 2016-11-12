import DislError from './disl-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class UndefinedParameterError extends DislError {

  /**
   * @param {string} identifier
   *
   * @returns {UndefinedParameterError}
   */
  static createError(identifier: string): UndefinedParameterError {
    return new UndefinedParameterError(
      {
        identifier
      },
      'Undefined parameter for identifier "%s"',
      identifier
    )
  }
}

export default UndefinedParameterError
