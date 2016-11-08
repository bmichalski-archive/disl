import Definition from './definition'

import type {InjectableArguments} from './types/injectable-arguments'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class ClassConstructorDefinition extends Definition {

  /**
   * Constructor
   *
   * @param {string} classConstructorIdentifier
   * @param {?InjectableArguments} [args=[]]
   */
  constructor(classConstructorIdentifier: string, args: ?InjectableArguments = []) {
    super(args)

    this._classConstructorIdentifier = classConstructorIdentifier
  }

  /**
   * Gets classConstructorIdentifier
   *
   * @returns {string}
   */
  get classConstructorIdentifier(): string {
    return this._classConstructorIdentifier
  }
}

export default ClassConstructorDefinition