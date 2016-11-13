import DislError from './disl-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class ServiceDefinitionAlreadyUsedError extends DislError {

  /**
   * @param {string} identifier
   *
   * @returns {ServiceDefinitionAlreadyUsedError}
   */
  static createError(identifier: string): ServiceDefinitionAlreadyUsedError {
    return new ServiceDefinitionAlreadyUsedError(
      {
        identifier
      },
      'Service definition for "%s" has already been used to instantiate a service, refusing to modify it',
      identifier
    )
  }
}

export default ServiceDefinitionAlreadyUsedError
