import DislError from './disl-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class FactoryMethodReturnsNothingError extends DislError {

  /**
   * @param {string} identifier
   *
   * @returns {FactoryMethodReturnsNothingError}
   */
  static createError(identifier: string): FactoryMethodReturnsNothingError {
    return new FactoryMethodReturnsNothingError(
      {
        identifier
      },
      'Factory method for identifier "%s" returns nothing',
      identifier
    )
  }
}

export default FactoryMethodReturnsNothingError
