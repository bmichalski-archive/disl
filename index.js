import Container from './src/container'
import ClassConstructorDefinition from './src/class-constructor-definition'
import FactoryDefinition from './src/factory-definition'
import Reference from './src/reference'
import Parameter from './src/parameter'
import MethodCall from './src/method-call'
import errors from './src/errors'

const exports = {
  Container,
  ClassConstructorDefinition,
  FactoryDefinition,
  Reference,
  Parameter,
  MethodCall
}

for (let i in errors) {
  if (errors.hasOwnProperty(i)) {
    exports[i] = errors[i]
  }
}

module.exports = exports
