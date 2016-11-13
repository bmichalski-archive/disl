#Load configuration
Allows to use a simple JS object to define services and parameters:
##Example:
```js
const Container = new Container()
const objectLoader = new ObjectLoader(container)

//arguments example
const args = [ new Reference('foobar'), new Parameter('bazqux') ]
//calls example
const calls = [
  [ 'aMethod', [ new Reference('aService'), new Parameter('aParameter') ] ],
  [ 'anotherMethod', [ new Reference('anotherService'), new Parameter('anotherParameter') ] ]
]

objectLoader.load(
  {
    parameters: {
      'foo': 'foo_value',
      'bar': 42,
      'baz': false,
      'qux': null
    },
    /**
     * Every service definition can have arguments and calls.
     * Arguments are passed either to the constructor or to the factory method.
     * Methods calls are applied to the service right after its instantiation.
     */
    services: {
      //using ServiceMethodFactoryDefinition
      'app.bar': {
        factory: [ '@app.bar_factory', 'instantiate' ],
        args: args,
        calls: calls
      },
      //using FunctionServiceFactoryDefinition
      'app.qux': {
        factory: '@app.qux_function_service',
        args: args,
        calls: calls
      },
      //using StaticMethodFactoryDefinition
      'app.baz': {
        factory: [ 'BazFactory', 'instantiate' ],
        args: args,
        calls: calls
      },
      //using ClassConstructorDefinition
      'app.foo': {
        class: 'AppFoo',
        args: args,
        calls: calls
      }
    }
  }
)
```

<hr />

Next: [Service definitions](service-definitions.md)
<br />
Previous: [Usage](usage.md)
<br />
[README.md](../README.md)
