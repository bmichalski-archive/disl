import Definition from './definition'
import ClassConstructorDefinition from './class-constructor-definition'
import FactoryDefinition from './factory-definition'
import Reference from './reference'
import Parameter from './parameter'
import MethodCall from './method-call'

import {
  CircularDependencyError,
  UnsupportedArgumentTypeError,
  UndefinedServiceDefinitionAndInstanceError,
  UndefinedServiceDefinitionError,
  ServiceDefinitionAlreadyUsedError,
  UndefinedParameterError,
  FactoryMethodReturnsNothingError,
  MethodDoesNotExistError,
  CannotLocateServiceClassConstructorError
} from './errors'

import type {InjectableArguments} from './types/injectable-arguments'
type scalar = (string|number|boolean|null)
type LoadingObject = {
  obj: Object<string, boolean>,
  arr: Array<string>
}
type LocatorCallback = (identifier: string) => (?Function)

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class Container {

  /**
   * Constructor
   */
  constructor() {
    this._servicesByIdentifier = {}
    this._serviceDefinitionsByIdentifier = {}
    this._parametersByIdentifier = {}
    this._serviceDefinitionsAlreadyUsedToInstantiateByIdentifier = {}
    this._classConstructorLocators = []
    this._instanceLocators = []
  }

  /**
   * Gets service associated with identifier
   *
   * @param {...string} identifiers
   *
   * @promise
   * @resolve {Array<Object|Function>} a service
   * @reject {UndefinedServiceDefinitionAndInstanceError} in case the service is undefined
   * @reject {CircularDependencyError} in case of a circular dependency
   *
   * @public
   */
  get(...identifiers: Array<string>): Promise<Array<Object|Function>> {
    const promises = []

    identifiers.forEach((identifier) => {
      promises.push(
        this._doGetService(identifier, { obj: {}, arr: [] })
      )
    })

    return Promise.all(promises)
  }

  /**
   * Associates service with identifier
   *
   * @param {string} identifier
   * @param {Object|Function} instance service instance
   *
   * @returns {Container} current Container instance
   *
   * @public
   */
  set(identifier: string, instance: (Object|Function)): Container {
    this._servicesByIdentifier[identifier] = instance

    return this
  }

  /**
   * Returns true if container has service, that is either if:
   * * it has a {@link Definition}
   * * it has been instantiated
   *
   * @param {string} identifier
   *
   * @returns {boolean}
   */
  has(identifier: string): boolean {
    return this.hasDefinition(identifier) || this.hasInstance(identifier)
  }

  /**
   * Returns true if the service has a definition
   *
   * @param {string} identifier
   *
   * @returns {boolean}
   *
   * @public
   */
  hasDefinition(identifier: string): boolean {
    return undefined !== this._serviceDefinitionsByIdentifier[identifier]
  }

  /**
   * Returns true if the service has an instance, either because:
   * * it has been instantiated via its {@link Definition}
   * * it has been set directly via {@link set} method
   *
   * @param {string} identifier
   *
   * @returns {boolean}
   *
   * @public
   */
  hasInstance(identifier: string): boolean {
    return undefined !== this._servicesByIdentifier[identifier]
  }

  /**
   * Gets service {@link Definition} associated with identifier
   *
   * @param {string} identifier
   *
   * @returns {Definition}
   *
   * @throws {UndefinedServiceDefinitionError} if there is no service definition for given identifier
   *
   * @public
   */
  getDefinition(identifier: string): Definition {
    const definition = this._serviceDefinitionsByIdentifier[identifier]

    if (undefined === definition) {
      throw UndefinedServiceDefinitionError.createError(identifier)
    }

    return definition
  }

  /**
   * Associates service {@link Definition} with identifier
   *
   * @param {string} identifier service identifier
   * @param {Definition} definition service definition
   *
   * @returns {Container} current Container instance
   *
   * @throws {ServiceDefinitionAlreadyUsedError} if the service definition has already been used to instantiate a service
   *
   * @public
   */
  setDefinition(identifier: string, definition: Definition): Container {
    if (this._serviceDefinitionsAlreadyUsedToInstantiateByIdentifier[identifier]) {
      throw ServiceDefinitionAlreadyUsedError.createError(identifier)
    }

    this._serviceDefinitionsAlreadyUsedToInstantiateByIdentifier[identifier] = false
    this._serviceDefinitionsByIdentifier[identifier] = definition

    return this
  }

  /**
   * Gets parameter associated with identifier
   *
   * @param {string} identifier parameter identifier
   *
   * @returns {scalar} parameter value
   *
   * @throws {UndefinedParameterError} if there is no parameter for given identifier
   *
   * @public
   */
  getParameter(identifier: string): scalar {
    if (undefined === this._parametersByIdentifier[identifier]) {
      throw UndefinedParameterError.createError(identifier)
    }

    return this._parametersByIdentifier[identifier]
  }

  /**
   * Associates parameter with identifier
   *
   * @param {string} identifier
   * @param {scalar} value
   *
   * @returns {Container} current Container instance
   *
   * @public
   */
  setParameter(identifier: string, value: scalar): Container {
    this._parametersByIdentifier[identifier] = value

    return this
  }

  /**
   * Returns true if container has parameter, false otherwise
   *
   * @param {string} identifier
   *
   * @returns {boolean}
   */
  hasParameter(identifier: string): boolean {
    return undefined !== this._parametersByIdentifier[identifier]
  }

  /**
   * Registers 
   * 
   * @param {LocatorCallback} locator
   *
   * @returns {Container} current Container instance
   *
   * @public
   */
  registerClassConstructorLocator(locator: LocatorCallback): Container {
    this._classConstructorLocators.push(locator)

    return this
  }

  /**
   * @param {LocatorCallback} locator
   *
   * @returns {Container} current Container instance
   *
   * @public
   */
  registerInstanceLocator(locator: LocatorCallback): Container {
    this._instanceLocators.push(locator)

    return this
  }

  /**
   * Resolves service definition arguments, then uses them to instantiate the service.
   *
   * @param {string} identifier
   * @param {Definition} definition
   * @param {LoadingObject} loading an object that keeps track of service instantiations,
   * used to prevent circular dependency related infinite loops
   *
   * @promise
   * @resolve {Object}
   * @reject {FactoryMethodReturnsNothingError} in case a factory method returns nothing
   * @reject {MethodDoesNotExistError} in case a method call calls a method that does not exist
   *
   * @private
   */
  _instantiate(identifier: string, definition: Definition, loading: LoadingObject): Promise<Object> {
    return this
      ._resolveArgs(definition.args, loading)
      .then((args: Array): Promise => {
        let instance

        if (definition instanceof ClassConstructorDefinition) {
          const classConstructor = this._locateServiceClassConstructor(definition.classConstructorIdentifier)

          instance = new (Function.prototype.bind.apply(classConstructor, [ undefined ].concat(args)))
        } else if (definition instanceof FactoryDefinition) {
          instance = definition.factory.apply(undefined, args)

          if (undefined === instance) {
            return Promise.reject(
              FactoryMethodReturnsNothingError.createError(identifier)
            )
          }
        }

        return new Promise((resolve, reject) => {
          const methodCallsPromises = []

          let i, methodCall

          const callMethod = (methodToCall: Function) => {
            methodCallsPromises.push(
              this
                ._resolveArgs(methodCall.args, loading)
                .then((args: Array): ?(Promise|mixed) => {
                  return methodToCall.apply(instance, args)
                })
            )
          }

          function getMethodCall(i): MethodCall {
            return definition.methodCalls[i]
          }

          for (i in definition.methodCalls) {
            if (definition.methodCalls.hasOwnProperty(i)) {
              methodCall = getMethodCall(i)

              const methodName = methodCall.name
              const methodToCall = instance[methodName]

              if (undefined === methodToCall) {
                return reject(MethodDoesNotExistError.createError(methodName))
              }

              callMethod(methodToCall)
            }
          }

          return resolve(
            Promise
              .all(methodCallsPromises)
              .then((): Object => {
                return instance
              })
          )
        })
      })
  }

  /**
   * Used internally to locate a service class constructor, if it has been made available to the container instance.
   *
   * @param {string} identifier
   *
   * @returns {Function} a service class constructor
   *
   * @throws {CannotLocateServiceClassConstructorError} if the service class constructor cannot be found
   *
   * @private
   */
  _locateServiceClassConstructor(identifier: string): Function {
    let i, classConstructor

    for (i in this._classConstructorLocators) {
      if (this._classConstructorLocators.hasOwnProperty(i)) {
        classConstructor = this._classConstructorLocators[i](identifier)

        if (undefined !== classConstructor) {
          return classConstructor
        }
      }
    }

    throw CannotLocateServiceClassConstructorError.createError(identifier)
  }


  /**
   * @param {string} identifier
   *
   * @returns {Object|void}
   *
   * @private
   */
  _locateInstance(identifier: string): Object|void {
    let i
    let instance

    for (i in this._instanceLocators) {
      if (this._instanceLocators.hasOwnProperty(i)) {
        instance = this._instanceLocators[i](identifier)

        if (undefined !== instance) {
          return instance
        }
      }
    }
  }

  /**
   * Resolves given arguments.
   *
   * @param {InjectableArguments} args
   * @param {LoadingObject} loading an object that keeps track of service instantiations,
   * used to prevent circular dependency related infinite loops
   *
   * @promise {Array<any>} arguments of any type
   * @reject {UnsupportedArgumentTypeError}
   *
   * @private
   */
  _resolveArgs(args: InjectableArguments, loading: LoadingObject): Promise {
    const promises = []

    return new Promise((resolve, reject) => {
      let i, arg

      for (i in args) {
        if (args.hasOwnProperty(i)) {
          arg = args[i]

          if (arg instanceof Reference) {
            const id = arg.id

            promises.push(
              this._doGetService(id, Container._deepCopyLoading(loading))
            )
          } else if (arg instanceof Parameter) {
            promises.push(
              this.getParameter(arg.id)
            )
          } else {
            return reject(UnsupportedArgumentTypeError.createError(arg))
          }
        }
      }

      return resolve(
        Promise.all(promises)
      )
    })
  }

  /**
   * Used internally to retrieve a service by its identifier.
   *
   * @param {string} identifier the identifier of the service
   * @param {LoadingObject} loading an object that keeps track of service instantiations,
   * used to prevent circular dependency related infinite loops
   *
   * @promise
   * @resolve {Object|Function} a service
   * @reject {CircularDependencyError} in case of a circular dependency
   * @reject {UndefinedServiceDefinitionAndInstanceError} in case neither an instance nor a definition is found
   *
   * @private
   */
  _doGetService(identifier: string, loading: LoadingObject): Promise {
    if (undefined !== loading.obj[identifier]) {
      const services = []
        .concat(loading.arr)
        .concat([ identifier ])

      return Promise.reject(
        CircularDependencyError.createError(services)
      )
    }

    if (!this.hasInstance(identifier)) {
      if (!this.hasDefinition(identifier)) {
        const result = this._locateInstance(identifier)

        if (undefined !== result) {
          /**
           * In case locate instance returns a promise, resolve promise
           */
          return Promise.resolve(result).then((instance) => {
            if (undefined === instance) {
              return Promise.reject(UndefinedServiceDefinitionAndInstanceError.createError(identifier))
            }

            return Promise.resolve(instance)
          })
        }

        return Promise.reject(UndefinedServiceDefinitionAndInstanceError.createError(identifier))
      }

      loading.obj[identifier] = true
      loading.arr.push(identifier)

      try {
        const promise = this._instantiate(identifier, this.getDefinition(identifier), loading)

        this._serviceDefinitionsAlreadyUsedToInstantiateByIdentifier[identifier] = true

        this._servicesByIdentifier[identifier] = promise
      } catch(e) {
        return Promise.reject(e)
      }
    }

    return Promise.resolve(this._servicesByIdentifier[identifier])
  }

  /**
   * Makes a deep copy of loading object so as not to modify it by reference.
   *
   * @param {Object} loading
   *
   * @returns {Object} loading a deep copy of the original loading parameter
   * @returns {Object<string, boolean>} loading.obj
   * @returns {Array<string>} loading.arr
   *
   * @private
   */
  static _deepCopyLoading(loading: Object): Object {
    const newLoading = {
      obj: {},
      arr: [].concat(loading.arr)
    }

    for (let i in loading.obj) {
      if (loading.obj.hasOwnProperty(i)) {
        newLoading.obj[i] = loading.obj[i]
      }
    }

    return newLoading
  }
}

export default Container