import Container from './container'
import Reference from './reference'
import Parameter from './parameter'
import MethodCall from './method-call'
import ClassConstructorDefinition from './definition/class-constructor-definition'
import ServiceMethodFactoryDefinition from './definition/service-method-factory-definition'
import StaticMethodFactoryDefinition from './definition/static-method-factory-definition'
import FunctionServiceFactoryDefinition from './definition/function-service-factory-definition'
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
    const objParameters = obj.parameters

    if (undefined !== objParameters) {
      this._doLoadParameters(objParameters)
    }

    const objServices = obj.services

    if (undefined !== objServices) {
      this._doLoadServices(objServices)
    }
  }

  /**
   * @param {Object} objParameters
   *
   * @private
   */
  _doLoadParameters(objParameters: Object): void {
    for (let parameterIdentifier in objParameters) {
      if (objParameters.hasOwnProperty(parameterIdentifier)) {
        const parameterValue = objParameters[parameterIdentifier]

        this._serviceContainer.setParameter(parameterIdentifier, parameterValue)
      }
    }
  }

  /**
   * @param {Object} objServices
   *
   * @private
   */
  _doLoadServices(objServices: Object): void {
    for (let serviceIdentifier in objServices) {
      if (objServices.hasOwnProperty(serviceIdentifier)) {
        const serviceObjDefinition = objServices[serviceIdentifier]

        let args

        if (undefined !== serviceObjDefinition.args) {
          args = serviceObjDefinition.args.map(ObjectLoader._getArgumentFromString)
        } else {
          args = []
        }

        let definition

        if (undefined !== serviceObjDefinition.class) {
          definition = new ClassConstructorDefinition(serviceObjDefinition.class, args)
        }

        if (undefined !== serviceObjDefinition.factory) {
          if (serviceObjDefinition.factory instanceof Array) {
            /**
             * Case when given an array and first element of this array is a reference to a service
             */
            if (0 === serviceObjDefinition.factory[0].indexOf('@')) {
              definition = new ServiceMethodFactoryDefinition(
                [
                  ObjectLoader._getServiceReferenceFromString(serviceObjDefinition.factory[0]),
                  serviceObjDefinition.factory[1]
                ],
                args
              )
            } else {
              definition = new StaticMethodFactoryDefinition(serviceObjDefinition.factory, args)
            }
          } else {
            definition = new FunctionServiceFactoryDefinition(
              ObjectLoader._getServiceReferenceFromString(serviceObjDefinition.factory),
              args
            )
          }
        }

        if (undefined !== serviceObjDefinition.calls) {
          definition.methodCalls = serviceObjDefinition.calls.map(ObjectLoader._getMethodCallFromMethodCallArrayDefinition)
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