import DislError from './disl-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class GetServiceError extends DislError {

  /**
   * @param {string} identifier
   * @param {Error} cause
   *
   * @returns {MethodDoesNotExistError}
   */
  static createError(identifier: string, cause: Error): GetServiceError {
    return new GetServiceError(
      {
        cause,
        info: {
          identifier
        }
      },
      'Error getting service "%s"',
      identifier
    )
  }
}

export default GetServiceError
