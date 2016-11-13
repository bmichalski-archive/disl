import Definition from './definition'
import Reference from '../reference'

import type {InjectableArguments} from '../types/injectable-arguments'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class FunctionServiceFactoryDefinition extends Definition {
  
  /**
   * Constructor
   *
   * @param {Reference} factory
   * @param {?InjectableArguments} [args=[]]
   */
  constructor(factory: Reference, args: ?InjectableArguments = []) {
    super(args)

    this._factory = factory
  }

  /**
   * Gets factory
   *
   * @returns {Reference}
   */
  get factory(): Reference {
    return this._factory
  }
}

export default FunctionServiceFactoryDefinition
