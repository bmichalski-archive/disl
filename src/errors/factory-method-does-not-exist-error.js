import DislError from './disl-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class FactoryMethodDoesNotExistError extends DislError {

  /**
   * @param {string} methodName
   * @param {string} serviceIdentifier
   *
   * @returns {FactoryMethodDoesNotExistError}
   */
  static createError(methodName: string, serviceIdentifier: string): FactoryMethodDoesNotExistError {
    return new FactoryMethodDoesNotExistError(
      {
        serviceIdentifier,
        methodName
      },
      'Factory method "%s" in factory service "%s" does not exist',
      methodName,
      serviceIdentifier
    )
  }
}

export default FactoryMethodDoesNotExistError
