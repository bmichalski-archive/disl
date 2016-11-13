import DislError from './disl-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class UndefinedServiceDefinitionAndInstanceError extends DislError {
  
  /**
   * @param {string} identifier
   *
   * @returns {UndefinedServiceDefinitionAndInstanceError}
   */
  static createError(identifier: string): UndefinedServiceDefinitionAndInstanceError {
    return new UndefinedServiceDefinitionAndInstanceError(
      {
        identifier
      },
      'Undefined service definition and instance for identifier "%s"',
      identifier
    )
  }
}

export default UndefinedServiceDefinitionAndInstanceError