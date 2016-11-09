#@bmichalski/disl
## A dependency injector / service locator hybrid component

### With a promise-based service container
Service retrieval is done via [promises](https://promisesaplus.com/).

It allows to parallelize in cases such as:
* when using a module loader such as [requirejs](https://github.com/requirejs/requirejs), in a web browser, to load multiple services at the same time
* when waiting for an I/O operation to finish, for example when connecting to a database

### Usage
#### Instantiation
```js
var container = new Container()
```
#### Service
##### Set
```js
var serviceInstance = {
  doSomething: function () {
    /* some logic */
  }
}

container.set('app.foo', serviceInstance)
```
##### Get
```js
container.get('app.foo').then(function (services) {
  //Then do something with the retrieved service
  services[0].doSomething()
}) 
```
###### Get multiple services
```js
container.get('app.foo', 'app.bar').then(function (services) {
  //Then do something with the retrieved services
  services[0].doSomething()
  services[1].doSomethingElse()
}) 
```
##### Check if container has service instance
```js
var hasInstance = container.hasInstance('app.bar')
```
hasInstance is set to true if container has service instance, false otherwise
#### Parameters
##### Set
```js
container.setParameter('foo_parameter', 42)
```
##### Get
```js
var parameter = container.getParameter('foo_parameter')
```
parameter is set to 42
##### Check if container has parameter
```js
var hasParameter = container.hasParameter('foo_parameter')
```
hasParameter is set to true if parameter has been defined, false otherwise
#### Service definition
##### Create definition
###### Using a factory method
```js
var definition = new FactoryDefinition(
  function factory() {
    return {
      doSomething: function () {
        /* some logic */
      }
    }
  }
)
```
###### Using a class constructor
```js
var definition = new ClassConstructorDefinition('barClass')
```
For this definition to work, the service container would need to know where to look for the class constructor.
###### Register a class constructor locator
```js
var BarClass = function () {}

BarClass.prototype = {
  doSomething: function () {
    /* some logic */
  }
}

container.registerClassConstructorLocator(function (classConstructorIdentifier) {
  if ('barClass' === classConstructorIdentifier) {
    return BarClass
  }
})
```
##### Set definition
```js
container.setDefinition('app.bar', definition)
```
##### Get definition
Example:
```js
var definition = new FactoryDefinition()
container.setDefinition('app.bar', definition)
var definition2 = container.getDefinition('app.bar', definition)
```
Here, definition2 === definition
##### Get service from definition
Similar to #set then #get except that service instantiation is done automatically when calling #get after #setDefinition:
```js
container.get('app.bar').then(function (services) {
  //Then do something with the retrieved service
  services[0].doSomething()
})
```
##### Check if container has service definition
```js
var hasDefinition = container.hasDefinition('app.bar')
```
hasDefinition is set to true if container has service definition, false otherwise
#### Other
##### Check if container has service
That is either if container has service instance or it is able to instantiate it:
```js
var has = container.has('app.bar')
```
has is set to:
* true if container either has service definition or has service instance
* false otherwise
### More examples
#### Integration with angular 1.x
See [test file](https://github.com/bmichalski-js/disl/blob/master/test/integration/angular-integration.spec.js).
#### Integration with requirejs
See [test file](https://github.com/bmichalski-js/disl/blob/master/test/integration/requirejs-integration.spec.js).

### TODO
* Improve error handling
  * with specific error types
* in More examples, add link to test files
* add a way to describe services using JSON

### Motivations
In the past, I have been working for a few years on a rather complex project using both [requirejs](http://requirejs.org/) and [angularjs](https://angularjs.org/) on the client side.
This is an attempt to implement a unified way to handle both dependency injection and service location in such environment.
  
### Project influences
This work has been influenced by my use the [Symfony dependency-injection component](https://github.com/symfony/dependency-injection).
