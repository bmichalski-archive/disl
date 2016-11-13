import Definition from './definition'

import type {InjectableArguments} from '../types/injectable-arguments'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class StaticMethodFactoryDefinition extends Definition {
  
  /**
   * Constructor
   *
   * @param {[string, string]} factory
   * @param {?InjectableArguments} [args=[]]
   */
  constructor(factory: [string, string], args: ?InjectableArguments = []) {
    super(args)

    this._factory = factory
  }

  /**
   * Gets factory
   *
   * @returns {[string, string]}
   */
  get factory(): [string, string] {
    return this._factory
  }
}

export default StaticMethodFactoryDefinition
