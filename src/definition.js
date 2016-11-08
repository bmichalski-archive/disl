import MethodCall from './method-call'

import type {InjectableArguments} from './types/injectable-arguments'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @private
 */
class Definition {

  /**
   * Constructor
   *
   * @param {?InjectableArguments} [args=[]]
   */
  constructor(args: ?InjectableArguments = []) {
    this._methodCalls = []
    this._args = args
  }

  /**
   * Sets methodCalls
   *
   * @param {Array<MethodCall>} methodCalls
   */
  set methodCalls(methodCalls: Array<MethodCall>): void {
    this._methodCalls = methodCalls
  }

  /**
   * Gets methodCalls
   *
   * @returns {Array<MethodCall>}
   */
  get methodCalls(): Array<MethodCall> {
    return this._methodCalls
  }

  /**
   * Gets args
   *
   * @returns {InjectableArguments}
   */
  get args(): InjectableArguments {
    return this._args
  }
}

export default Definition