import DislError from './disl-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class UndefinedServiceDefinitionError extends DislError {

  /**
   * @param {string} identifier
   *
   * @returns {UndefinedServiceDefinitionError}
   */
  static createError(identifier: string): UndefinedServiceDefinitionError {
    return new UndefinedServiceDefinitionError(
      {
        identifier
      },
      'Undefined service definition for identifier "%s"',
      identifier
    )
  }
}

export default UndefinedServiceDefinitionError
