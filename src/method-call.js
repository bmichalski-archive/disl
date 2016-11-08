import type {InjectableArguments} from './types/injectable-arguments'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class MethodCall {

  /**
   * Constructor
   *
   * @param {string} name method name
   * @param {?InjectableArguments} [args=[]]
   *
   * @public
   */
  constructor(name: string, args: ?InjectableArguments = []) {
    this._name = name
    this._args = args
  }

  /**
   * Gets name
   *
   * @returns {string}
   *
   * @public
   */
  get name(): string {
    return this._name
  }

  /**
   * Gets args
   *
   * @returns {InjectableArguments}
   *
   * @public
   */
  get args(): InjectableArguments {
    return this._args
  }
}

export default MethodCall