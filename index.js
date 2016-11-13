import Container from './src/container'
import ClassConstructorDefinition from './src/class-constructor-definition'
import ServiceMethodFactoryDefinition from './src/service-method-factory-definition'
import StaticMethodFactoryDefinition from './src/static-method-factory-definition'
import FunctionServiceFactoryDefinition from './src/function-service-factory-definition'
import Reference from './src/reference'
import Parameter from './src/parameter'
import MethodCall from './src/method-call'
import ObjectLoader from './src/object-loader'
import errors from './src/errors'

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
