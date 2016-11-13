import Container from './container'
import Reference from './reference'
import Parameter from './parameter'
import MethodCall from './method-call'
import ClassConstructorDefinition from './class-constructor-definition'
import ServiceMethodFactoryDefinition from './service-method-factory-definition'
import StaticMethodFactoryDefinition from './static-method-factory-definition'
import FunctionServiceFactoryDefinition from './function-service-factory-definition'
import UnknownArgumentFormatError from './errors/unknown-argument-format-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class ObjectLoader {

  /**
   * Constructor
   *
   * @param {Container} serviceContainer
   */
  constructor(serviceContainer: Container) {
    this._serviceContainer = serviceContainer
  }

  /**
   * Loads service definitions from JS object
   *
   * @param {Object} obj
   *
   * @public
   */
  load(obj: Object): void {
    for (let serviceIdentifier in obj) {
      if (obj.hasOwnProperty(serviceIdentifier)) {
        const objDefinition = obj[serviceIdentifier]

        let args

        if (undefined !== objDefinition.args) {
          args = objDefinition.args.map(ObjectLoader._getArgumentFromString)
        } else {
          args = []
        }

        let definition

        if (undefined !== objDefinition.class) {
          definition = new ClassConstructorDefinition(objDefinition.class, args)
        }

        if (undefined !== objDefinition.factory) {
          if (objDefinition.factory instanceof Array) {
            /**
             * Case when given an array and first element of this array is a reference to a service
             */
            if (0 === objDefinition.factory[0].indexOf('@')) {
              definition = new ServiceMethodFactoryDefinition(
                [
                  ObjectLoader._getServiceReferenceFromString(objDefinition.factory[0]),
                  objDefinition.factory[1]
                ],
                args
              )
            } else {
              definition = new StaticMethodFactoryDefinition(objDefinition.factory, args)
            }
          } else {
            definition = new FunctionServiceFactoryDefinition(
              ObjectLoader._getServiceReferenceFromString(objDefinition.factory),
              args
            )
          }
        }

        if (undefined !== objDefinition.calls) {
          definition.methodCalls = objDefinition.calls.map(ObjectLoader._getMethodCallFromMethodCallArrayDefinition)
        }

        this._serviceContainer.setDefinition(serviceIdentifier, definition)
      }
    }
  }

  /**
   * @param {string} strArgument
   *
   * @returns {Reference}
   *
   * @throws {UnknownArgumentFormatError}
   *
   * @private
   */
  static _getServiceReferenceFromString(strArgument: string): Reference {
    if (0 === strArgument.indexOf('@')) {
      return new Reference(strArgument.slice(1))
    }

    throw UnknownArgumentFormatError.createError(strArgument)
  }

  /**
   * @param {string} strArgument
   *
   * @returns {Reference|Parameter}
   *
   * @throws {UnknownArgumentFormatError}
   *
   * @private
   */
  static _getArgumentFromString(strArgument: string): Reference|Parameter {
    if (0 === strArgument.indexOf('@')) {
      return ObjectLoader._getServiceReferenceFromString(strArgument)
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