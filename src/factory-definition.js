import Definition from './definition'

import type {InjectableArguments} from './types/injectable-arguments'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class FactoryDefinition extends Definition {
  
  /**
   * Constructor
   *
   * @param {Function} factory
   * @param {?InjectableArguments} [args=[]]
   */
  constructor(factory: Function, args: ?InjectableArguments = []) {
    super(args)

    this._factory = factory
  }

  /**
   * Gets factory
   *
   * @returns {Function}
   */
  get factory(): Function {
    return this._factory
  }
}

export default FactoryDefinition