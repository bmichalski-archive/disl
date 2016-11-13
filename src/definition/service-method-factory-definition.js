import Definition from './definition'
import Reference from '../reference'

import type {InjectableArguments} from '../types/injectable-arguments'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class ServiceMethodFactoryDefinition extends Definition {
  
  /**
   * Constructor
   *
   * @param {[Reference, string]} factory
   * @param {?InjectableArguments} [args=[]]
   */
  constructor(factory: [Reference, string], args: ?InjectableArguments = []) {
    super(args)

    this._factory = factory
  }

  /**
   * Gets factory
   *
   * @returns {[Reference, string]}
   */
  get factory(): [Reference, string] {
    return this._factory
  }
}

export default ServiceMethodFactoryDefinition
