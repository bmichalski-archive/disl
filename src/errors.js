import CannotLocateServiceClassConstructorError from './errors/cannot-locate-service-class-constructor-error'
import CircularDependencyError from './errors/circular-dependency-error'
import DislError from './errors/disl-error'
import FactoryMethodReturnsNothingError from './errors/factory-method-returns-nothing-error'
import MethodDoesNotExistError from './errors/method-does-not-exist-error'
import ServiceDefinitionAlreadyUsedError from './errors/service-definition-already-used-error'
import UndefinedParameterError from './errors/undefined-parameter-error'
import UndefinedServiceDefinitionAndInstanceError from './errors/undefined-service-definition-and-instance-error'
import UndefinedServiceDefinitionError from './errors/undefined-service-definition-error'
import UnsupportedArgumentTypeError from './errors/unsupported-argument-type-error'

module.exports = {
  CannotLocateServiceClassConstructorError,
  CircularDependencyError,
  DislError,
  FactoryMethodReturnsNothingError,
  MethodDoesNotExistError,
  ServiceDefinitionAlreadyUsedError,
  UndefinedParameterError,
  UndefinedServiceDefinitionAndInstanceError,
  UndefinedServiceDefinitionError,
  UnsupportedArgumentTypeError
}