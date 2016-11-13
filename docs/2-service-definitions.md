# Service definitions
## Create definition
### Using a ServiceMethodFactoryDefinition
####Factory example:
```js
var factory = {
  instantiate: function (someService, someParameter) {
    /* some logic */
    return serviceInstance
  }
}
//In this case, factory is a known service
container.set('app.foo_factory', factory)
```
####Instantiate definition:
```js
var definition = new FunctionServiceFactoryDefinition(
  [ new Reference('app.foo_factory'), 'instantiate' ],
  [ new Reference('some_service_reference'), new Parameter('some_parameter') ]
)
```
### Using a FunctionServiceFactoryDefinition
####Factory example:
```js
var factory = function (someService, someParameter) {
  /* some logic */
  return serviceInstance
}
//In this case, factory is a known service
container.set('app.foo_factory_function', factory)
```
####Instantiate definition:
```js
var definition = new FunctionServiceFactoryDefinition(
  new Reference('app.foo_factory_function'),
  [ new Reference('some_service_reference'), new Parameter('some_parameter') ]
)
```
### Using a StaticMethodFactoryDefinition
####Declare factory:
```js
var BarClass = function () {}
BarClass.instantiate = function () {
  /* some logic */
  return serviceInstance
}
```
####Instantiate definition:
```js
var definition = new StaticMethodFactoryDefinition([ 'BarClass', 'instantiate' ])
```
For this definition to work, the service container would need to know where to look for the class.
<br />
See [Register a class locator](#register-a-class-locator).
### Using a ClassConstructorDefinition
####Declare class:
```js
var BarClass = function () {}
```
####Instantiate definition:
```js
var definition = new ClassConstructorDefinition('BarClass')
```
For this definition to work, the service container would need to know where to look for the class.
<br />
See [Register a class locator](#register-a-class-locator).
## Register a class locator
```js
container.registerClassLocator(function (classIdentifier) {
  if ('barClass' === classIdentifier) {
    return BarClass
  }
})
```
## Set definition
```js
container.setDefinition('app.bar', definition)
```
## Get definition
Example:
```js
var definition = new ClassConstructorDefinition('BarClass')
container.setDefinition('app.bar', definition)
var definition2 = container.getDefinition('app.bar', definition)
```
Here, definition2 === definition
## Get service from definition
Similar to #set then #get except that service instantiation is done automatically when calling #get after #setDefinition:
```js
container.get('app.bar').then(function (services) {
  //Then do something with the retrieved service
  services[0].doSomething()
})
```

<hr />

Next: [More examples](3-more-examples.md)
<br />
Previous: [Usage](1-usage.md)
<br />
[README.md](../README.md)
