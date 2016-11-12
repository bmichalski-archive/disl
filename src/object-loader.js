import Container from './container'
import Reference from './reference'
import Parameter from './parameter'
import MethodCall from './method-call'
import ClassConstructorDefinition from './class-constructor-definition'
import UnknownArgumentFormatError from './errors/unknown-argument-format-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class ObjectLoader {

  /**
   * @param {Container} serviceContainer
   * @param {Object} obj
   *
   * @public
   */
  load(serviceContainer: Container, obj: Object): void {
    for (let serviceIdentifier in obj) {
      if (obj.hasOwnProperty(serviceIdentifier)) {
        const objDefinition = obj[serviceIdentifier]

        let args

        if (undefined !== objDefinition.args) {
          args = objDefinition.args.map(ObjectLoader._getArgumentFromString)
        } else {
          args = []
        }

        const definition = new ClassConstructorDefinition(objDefinition.class, args)

        if (undefined !== objDefinition.calls) {
          definition.methodCalls = objDefinition.calls.map(ObjectLoader._getMethodCallFromMethodCallArrayDefinition)
        }

        serviceContainer.setDefinition(serviceIdentifier, definition)
      }
    }
  }

  /**
   * @param {string} strArgument
   *
   * @returns {Reference|Parameter}
   *
   * @private
   */
  static _getArgumentFromString(strArgument: string): Reference|Parameter {
    if (0 === strArgument.indexOf('@')) {
      return new Reference(strArgument.slice(1))
    }

    if (0 === strArgument.indexOf('%')) {
      return new Parameter(strArgument.slice(1))
    }

    throw UnknownArgumentFormatError.createError(strArgument)
  }

  /**
   * @param {Array} methodCallArrayDefinition
   *
   * @returns {MethodCall}
   *
   * @private
   */
  static _getMethodCallFromMethodCallArrayDefinition(methodCallArrayDefinition: Array): MethodCall {
    const methodName = methodCallArrayDefinition[0]
    const methodArguments = undefined === methodCallArrayDefinition[1] ? [] : methodCallArrayDefinition[1]

    return new MethodCall(
      methodName,
      methodArguments.map(ObjectLoader._getArgumentFromString)
    )
  }
}

export default ObjectLoader