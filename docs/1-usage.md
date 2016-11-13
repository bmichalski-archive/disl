# Usage
## Container instantiation
```js
var container = new Container()
```
## Services
### Set
```js
var serviceInstance = {
  doSomething: function () {
    /* some logic */
  }
}
container.set('app.foo', serviceInstance)
```
### Get
```js
container.get('app.foo').then(function (services) {
  //Then do something with the retrieved service
  services[0].doSomething()
})
```
#### Get multiple services
```js
container.get('app.foo', 'app.bar').then(function (services) {
  //Then do something with the retrieved services
  services[0].doSomething()
  services[1].doSomethingElse()
})
```
### Check if container has service instance
```js
var hasInstance = container.hasInstance('app.bar')
```
hasInstance is set to true if container has service instance, false otherwise
## Parameters
### Set
```js
container.setParameter('foo_parameter', 42)
```
### Get
```js
var parameter = container.getParameter('foo_parameter')
```
parameter is set to 42
### Check if container has parameter
```js
var hasParameter = container.hasParameter('foo_parameter')
```
hasParameter is set to true if parameter has been defined, false otherwise
### Check if container has service definition
```js
var hasDefinition = container.hasDefinition('app.bar')
```
hasDefinition is set to true if container has service definition, false otherwise
### Check if container has service
That is either if container has service instance or it is able to instantiate it:
```js
var has = container.has('app.bar')
```
has is set to:
* true if container either has service definition or has service instance
* false otherwise

<hr />

Next: [Service definitions](2-service-definition.md)
<br />
[README.md](../README.md)
