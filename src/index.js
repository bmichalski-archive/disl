import Container from './container'
import ClassConstructorDefinition from './definition/class-constructor-definition'
import ServiceMethodFactoryDefinition from './definition/service-method-factory-definition'
import StaticMethodFactoryDefinition from './definition/static-method-factory-definition'
import FunctionServiceFactoryDefinition from './definition/function-service-factory-definition'
import Reference from './reference'
import Parameter from './parameter'
import MethodCall from './method-call'
import ObjectLoader from './object-loader'
import errors from './errors'

const exports = {
  Container,
  ClassConstructorDefinition,
  ServiceMethodFactoryDefinition,
  StaticMethodFactoryDefinition,
  FunctionServiceFactoryDefinition,
  Reference,
  Parameter,
  MethodCall,
  ObjectLoader
}

for (let i in errors) {
  if (errors.hasOwnProperty(i)) {
    exports[i] = errors[i]
  }
}

module.exports = exports
