import Definition from './definition'
import ClassConstructorDefinition from './class-constructor-definition'
import FactoryDefinition from './factory-definition'
import Reference from './reference'
import Parameter from './parameter'
import MethodCall from './method-call'

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
   * @resolve {Object|Function} service identified by identifier
   * @reject {Error} in case the service is undefined
   * @reject {Error} in case of a circular dependency
   *
   * @public
   */
  get(...identifiers: Array<string>): Promise<Object|Function> {
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
   * @throws {Error} if there is no service definition for given identifier
   *
   * @public
   */
  getDefinition(identifier: string): Definition {
    const definition = this._serviceDefinitionsByIdentifier[identifier]

    if (undefined === definition) {
      throw new Error('Missing service definition for identifier "' + identifier + '"')
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
   * @public
   */
  setDefinition(identifier: string, definition: Definition): Container {
    if (this._serviceDefinitionsAlreadyUsedToInstantiateByIdentifier[identifier]) {
      throw new Error(
        'Service definition for "'
          + identifier
          + '" has already been used to instantiate a service, refusing to modify it'
      )
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
   * @public
   */
  getParameter(identifier: string): scalar {
    if (undefined === this._parametersByIdentifier[identifier]) {
      throw new Error('Undefined parameter "' + identifier + '"')
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
   * @param {Definition} definition
   * @param {LoadingObject} loading an object that keeps track of service instantiations,
   * used to prevent circular dependency related infinite loops
   *
   * @promise
   * @resolve {Object}
   * @reject {Error} in case a factory method returns nothing
   * @reject {Error} in case a method call calls a method that does not exist
   * @reject {Error} in case the service definition
   *
   * @private
   */
  _instantiate(definition: Definition, loading: LoadingObject): Promise<Object> {
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
            throw new Error('Expecting factory method to return a service')
          }
        } else {
          //Theoretically, can't happen with current Definition implementation.
          throw new Error('Unsupported')
        }

        const methodCallsPromises = []

        definition.methodCalls.forEach((methodCall: MethodCall): void => {
          const methodName = methodCall.name
          const method = instance[methodName]

          if (undefined === method) {
            throw new Error('Method "' + methodName + '" does not exist')
          }

          methodCallsPromises.push(
            this
              ._resolveArgs(methodCall.args, loading)
              .then((args: Array): ?(Promise|mixed) => {
                return method.apply(instance, args)
              })
          )
        })

        return Promise
          .all(methodCallsPromises)
          .then((): Object => {
            return instance
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
   * @throws {Error} if the class constructor could not be found
   *
   * @private
   */
  _locateServiceClassConstructor(identifier: string): Function {
    let i
    let classConstructor

    for (i in this._classConstructorLocators) {
      if (this._classConstructorLocators.hasOwnProperty(i)) {
        classConstructor = this._classConstructorLocators[i](identifier)

        if (undefined !== classConstructor) {
          break;
        }
      }
    }

    if (undefined === classConstructor) {
      throw new Error('Could not locate service class constructor for identifier "' + identifier + '"')
    }

    return classConstructor
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
          break;
        }
      }
    }

    return instance
  }

  /**
   * Resolves given arguments.
   *
   * @param {InjectableArguments} args
   * @param {LoadingObject} loading an object that keeps track of service instantiations,
   * used to prevent circular dependency related infinite loops
   *
   * @promise
   *
   * @private
   */
  _resolveArgs(args: InjectableArguments, loading: LoadingObject): Promise {
    const promises = []

    args.forEach((arg) => {
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
        throw new Error('Unsupported arg of type "' + (typeof arg) + '"');
      }
    })

    return Promise.all(promises)
  }


  /**
   * @param {string} identifier
   *
   * @returns {Error}
   *
   * @private
   */
  static _createMissingServiceDefinitionAndInstanceForIdentifierError(identifier: string): Error {
    return new Error('Missing service definition and instance for identifier "' + identifier + '"')
  }

  /**
   * Used internally to retrieve a service by its identifier.
   *
   * @param {string} identifier the identifier of the service
   * @param {LoadingObject} loading an object that keeps track of service instantiations,
   * used to prevent circular dependency related infinite loops
   *
   * @promise
   * @resolve {*} a service that could be of any type
   * @reject {Error} in case the service is undefined
   * @reject {Error} in case of a circular dependency
   *
   * @private
   */
  _doGetService(identifier: string, loading: LoadingObject): Promise {
    if (undefined !== loading.obj[identifier]) {
      const path = []
        .concat(loading.arr)
        .concat([ identifier ])
        .reverse()
        .join(' <- ')

      return Promise.reject(
        new Error('Circular dependency found: ' + path + '')
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
            return new Promise((resolve, reject) => {
              if (undefined === instance) {
                reject(Container._createMissingServiceDefinitionAndInstanceForIdentifierError(identifier))
              } else {
                resolve(instance)
              }
            })
          })
        }

        return Promise.reject(Container._createMissingServiceDefinitionAndInstanceForIdentifierError(identifier))
      }

      loading.obj[identifier] = true
      loading.arr.push(identifier)

      const promise = this._instantiate(this.getDefinition(identifier), loading)

      this._serviceDefinitionsAlreadyUsedToInstantiateByIdentifier[identifier] = true

      this._servicesByIdentifier[identifier] = promise
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