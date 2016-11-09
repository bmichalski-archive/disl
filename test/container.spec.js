"use strict"

if (typeof require !== 'undefined') {
  var assert = require('assert')

  var expect = require('chai').expect
  var sinon = require('sinon')

  var di = require('./di')

  var FactoryDefinition = di.FactoryDefinition
  var ClassConstructorDefinition = di.ClassConstructorDefinition
  var Reference = di.Reference
  var Parameter = di.Parameter
  var MethodCall = di.MethodCall
  var Container = di.Container
}

describe('Container', function () {
  let serviceContainer

  beforeEach(function () {
    serviceContainer = new Container()
  })

  function simpleGetSetTest() {
    const serviceInstance = {}

    serviceContainer.set('foo', serviceInstance)

    return expect(serviceContainer.get('foo'))
      .to.eventually
      .be.fulfilled
      .then(function (services) {
        expect(services).to.be.instanceOf(Array).and.to.be.lengthOf(1)
        expect(services[0]).to.be.equal(serviceInstance)
      })
  }

  describe('#get', function () {
    it('should get the service associated with identifier', simpleGetSetTest)

    context('a service definition is set', function () {
      context('and is an instance of FactoryDefinition', function () {
        it('should return the service instance', function () {
          const serviceInstance = {}

          const serviceDefinition = new FactoryDefinition(function () {
            return serviceInstance
          })

          serviceContainer.setDefinition('foo', serviceDefinition)

          return expect(serviceContainer.get('foo'))
            .to.eventually
            .be.fulfilled
            .then(function (services) {
              expect(services).to.be.instanceOf(Array).and.to.be.lengthOf(1)
              expect(services[0]).to.be.equal(serviceInstance)
            })
        })

        context('and its factory method returns nothing', function () {
          it('should throw an Error', function () {
            const definition = new FactoryDefinition(function () {})

            serviceContainer.setDefinition('foo', definition)

            return expect(serviceContainer.get('foo'))
              .to.eventually
              .be.an.instanceOf(Error)
              .and.be.rejectedWith(/^Expecting factory method to return a service$/)
          })
        })

        context('and it instantiate an object', function () {
          context('when retrieving the same service twice', function () {
            context('with one function call', function () {
              it('should return the same object instance', function () {
                const Foo = function () {}

                serviceContainer.setDefinition('foo', new FactoryDefinition(function () { return new Foo() }))

                return expect(serviceContainer.get('foo', 'foo'))
                  .to.eventually
                  .be.fulfilled
                  .then(function (services) {
                    expect(services)
                      .to.be.instanceOf(Array)
                      .and.be.lengthOf(2)
                    expect(services[0]).to.be.instanceOf(Foo)
                    expect(services[0]).to.equal(services[1])
                  })
              })
            })

            context('with two successive function calls', function () {
              it('should return the same object instance', function () {
                const Foo = function () {}

                serviceContainer.setDefinition('foo', new FactoryDefinition(function () { return new Foo() }))

                function expectServices(services) {
                  expect(services)
                    .to.be.instanceOf(Array)
                    .and.be.lengthOf(1)
                  expect(services[0]).to.be.instanceOf(Foo)
                }

                return expect(serviceContainer.get('foo'))
                  .to.eventually
                  .be.fulfilled
                  .then(function (services) {
                    expectServices(services)

                    const aInstance = services[0]

                    return expect(serviceContainer.get('foo'))
                      .to.eventually
                      .be.fulfilled
                      .then(function (services) {
                        expectServices(services)

                        expect(services[0]).to.be.equal(aInstance)
                      })
                  })
              })
            })
          })
        })
      })

      context('and is an instance of ClassConstructorDefinition', function () {
        it('should return the service instance', function () {
          //In a browser this could be the window object
          const testExternalServiceContainer = {}

          serviceContainer.registerClassConstructorLocator(function (serviceIdentifier) {
            return testExternalServiceContainer[serviceIdentifier]
          })

          const Foo = function () {}
          testExternalServiceContainer.Foo = Foo

          const serviceDefinition = new ClassConstructorDefinition('Foo')

          serviceContainer.setDefinition('foo', serviceDefinition)

          return expect(serviceContainer.get('foo')).to.be.fulfilled.then(function (services) {
            expect(services)
              .to.be.instanceOf(Array)
              .and.be.lengthOf(1)
            expect(services[0]).to.be.instanceOf(Foo)
          })
        })
      })
    })

    context('and it defines dependencies', function () {
      it('should return the service instance', function () {
        const barServiceInstance = {}
        const quxServiceInstance = {}

        serviceContainer.set('bar', barServiceInstance)
        serviceContainer.set('qux', quxServiceInstance)
        serviceContainer.setParameter('foo', 'foo_value')
        serviceContainer.setParameter('qux', 'qux_value')

        const Foo = function (bar, qux, fooParam, quxParam) {
          expect(bar).to.be.equal(barServiceInstance)
          expect(qux).to.be.equal(quxServiceInstance)
          expect(fooParam).to.be.equal('foo_value')
          expect(quxParam).to.be.equal('qux_value')
        }

        const serviceDefinition = new FactoryDefinition(
          function() {
            return new Foo(
              arguments[0],
              arguments[1],
              arguments[2],
              arguments[3]
            )
          },
          [
            new Reference('bar'),
            new Reference('qux'),
            new Parameter('foo'),
            new Parameter('qux')
          ]
        )

        serviceContainer.setDefinition('foo', serviceDefinition)

        return expect(serviceContainer.get('foo'))
          .to.eventually
          .be.fulfilled
          .then(function (services) {
            expect(services).to.be.instanceOf(Array).and.be.lengthOf(1)
            expect(services[0]).to.be.instanceOf(Foo)
          })
      })

      context('and there is a circular dependency', function () {
        context('to the same service', function () {
          it('should handle the situation by throwing an Error', function () {
            const fooServiceDefinition = new ClassConstructorDefinition('Foo', [ new Reference('foo') ])

            serviceContainer.setDefinition('foo', fooServiceDefinition)

            return expect(serviceContainer.get('foo'))
              .to.eventually
              .be.instanceOf(Error)
              .and.be.rejectedWith(/^Circular dependency detected foo => foo$/)
          })
        })

        context('via another service', function () {
          it('should handle the situation by throwing an Error', function () {
            const fooServiceDefinition = new FactoryDefinition(function () {}, [ new Reference('bar') ])
            const barServiceDefinition = new FactoryDefinition(function () {}, [ new Reference('foo') ])

            serviceContainer.setDefinition('foo', fooServiceDefinition)
            serviceContainer.setDefinition('bar', barServiceDefinition)

            return expect(serviceContainer.get('foo'))
              .to.eventually
              .be.instanceOf(Error)
              .and.be.rejectedWith(/^Circular dependency detected foo => bar => foo$/)
          })
        })
      })
    })

    context('and it defines method calls', function () {
      it('should call these methods', function () {
        const barInstance = {}

        serviceContainer.set('bar', barInstance)
        serviceContainer.setParameter('qux', 'qux_value')

        const spy = sinon.spy()
        const spy2 = sinon.spy()

        const definition = new FactoryDefinition(function () {
          return { spy: spy, spy2: spy2 }
        })

        definition.methodCalls = [
          new MethodCall('spy'),
          new MethodCall('spy2', [ new Reference('bar'), new Parameter('qux') ])
        ]

        serviceContainer.setDefinition('foo', definition)

        return serviceContainer.get('foo').then(function () {
          assert(spy.calledOnce)
          assert(spy.calledWithExactly())

          assert(spy2.calledOnce)
          assert(spy2.calledWithExactly(barInstance, 'qux_value'))
        })
      })

      context('but the called methods do not exist', function () {
        it('should throw an Error', function () {
          const definition = new FactoryDefinition(function () { return {} })

          const spy = sinon.spy()

          definition.methodCalls = [
            new MethodCall('spy')
          ]

          serviceContainer.setDefinition('foo', definition)

          return expect(serviceContainer.get('foo'))
            .to.eventually
            .be.instanceOf(Error)
            .and.be.rejectedWith(/^Method "spy" does not exist$/)
        })
      })

      context('and there is a circular dependency', function () {
        context('to same service', function () {
          it('should handle the situation by throwing an Error', function () {
            const definition = new FactoryDefinition(function () { return { meth: function () {} } })

            definition.methodCalls = [
              new MethodCall('meth', [ new Reference('foo') ])
            ]

            serviceContainer.setDefinition('foo', definition)

            return expect(serviceContainer.get('foo'))
              .to.eventually
              .be.instanceOf(Error)
              .and.be.rejectedWith(/^Circular dependency detected foo => foo$/)
          })
        })

        context('via another service', function () {
          it('should handle circular dependency by throwing an Error', function () {
            const barDefinition = new FactoryDefinition(function () { return { meth: function () {} } })

            const fooDefinition = new FactoryDefinition(function () { return {} }, [ new Reference('bar') ])

            barDefinition.methodCalls = [
              new MethodCall('meth', [ new Reference('foo') ])
            ]

            serviceContainer.setDefinition('foo', fooDefinition)
            serviceContainer.setDefinition('bar', barDefinition)

            return expect(serviceContainer.get('foo'))
              .to.eventually
              .be.instanceOf(Error)
              .and.be.rejectedWith(/^Circular dependency detected foo => bar => foo$/)
          })
        })
      })
    })

    context('multiple services have been set', function () {
      it('should return multiple service instances', function () {
        const fooInstance = {}
        const barInstance = {}

        serviceContainer
          .set('foo', fooInstance)
          .set('bar', barInstance)

        return expect(serviceContainer.get('foo', 'bar'))
          .to.eventually
          .be.fulfilled
          .then(function (services) {
            expect(services[0]).to.be.equal(fooInstance)
            expect(services[1]).to.be.equal(barInstance)
          })
      })
    })

    context('multiple service definitions have been set', function () {
      it('should return multiple service instances', function () {
        const fooInstance = {}
        const barInstance = {}

        serviceContainer.setDefinition('foo', new FactoryDefinition(function () { return fooInstance }))
        serviceContainer.setDefinition('bar', new FactoryDefinition(function () { return barInstance }))

        return expect(serviceContainer.get('foo', 'bar'))
          .to.eventually
          .be.fulfilled
          .then(function (services) {
            expect(services[0]).to.be.equal(fooInstance)
            expect(services[1]).to.be.equal(barInstance)
          })
      })
    })

    context('there is no service definition and no service instance defined for given service name', function () {
      it('should throw an Error', function () {
        return expect(serviceContainer.get('foo'))
          .to.eventually
          .be.instanceOf(Error)
          .and.be.rejectedWith(/^Missing service definition and instance for identifier "foo"$/)
      })

      context('but there is an instance locator returning something', function () {
        it('should return a service instance', function () {
          const fooInstance = {}

          serviceContainer.registerInstanceLocator(function (identifier) {
            if ('foo' === identifier) {
              return fooInstance
            }
          })

          return expect(serviceContainer.get('foo'))
            .to.eventually
            .be.fulfilled
            .then(function (services) {
              expect(services).to.be.instanceOf(Array).and.be.lengthOf(1)
              expect(services[0]).to.be.equal(fooInstance)
            })
        })
      })

      context('and even the instance locator does not return a service', function () {
        it('should return a service instance', function () {
          const fooInstance = {}

          serviceContainer.registerInstanceLocator(function (identifier) {
            if ('foo' === identifier) {
              return fooInstance
            }
          })

          return expect(serviceContainer.get('bar'))
            .to.eventually
            .be.instanceOf(Error)
            .and.be.rejectedWith(/^Missing service definition and instance for identifier "bar"$/)
        })
      })
    })

    /**
     * TODO
     * Assert priority between services defined / set with #set, #setDefinition and #registerInstanceLocator
     */
  })

  describe('#set', function () {
    it('should associate a service instance to its identifier', simpleGetSetTest)

    context('there is already one service instance associated to the identifier', function () {
      it('should replace previous service instance with a new one', function () {
        const serviceInstance = {}

        serviceContainer.set('foo', serviceInstance)

        const serviceInstance2 = {}

        serviceContainer.set('foo', serviceInstance2)

        return expect(serviceContainer.get('foo'))
          .to.eventually
          .be.fulfilled
          .then(function (services) {
            expect(services).to.be.instanceOf(Array).and.to.be.lengthOf(1)
            expect(services[0]).to.be.equal(serviceInstance2)
          })
      })
    })
  })

  function simpleGetDefinitionSetDefinitionTest() {
    const serviceDefinition = new FactoryDefinition(function () {})

    serviceContainer.setDefinition('foo', serviceDefinition)

    expect(serviceContainer.getDefinition('foo')).to.be.equal(serviceDefinition)
  }

  describe('#getDefinition', function () {
    it('should get the service definition associated with identifier', simpleGetDefinitionSetDefinitionTest)
  })

  describe('#setDefinition', function () {
    it('should associate a service definition to its identifier', simpleGetDefinitionSetDefinitionTest)

    context('the service definition has already been set', function () {
      context('the service definition has already been used to instantiate a service', function () {
        it('should throw an Error', function () {
          const serviceDefinition = new FactoryDefinition(function () {
            return {}
          })

          serviceContainer.setDefinition('foo', serviceDefinition)

          return serviceContainer.get('foo').then(function () {
            expect(function () {
              serviceContainer.setDefinition('foo', serviceDefinition)
            }).to.throw(Error, /^Service definition for "foo" has already been used to instantiate a service, refusing to modify it$/)
          })
        })
      })
    })
  })

  function simpleGetSetParameterTest() {
    serviceContainer.setParameter('foo', 'bar')

    expect(serviceContainer.getParameter('foo')).to.be.equal('bar')
  }

  describe('#getParameter', function () {
    it('should get parameter with identifier', simpleGetSetParameterTest)

    it('should throw an error if parameter does not exist', function () {
      expect(function () {
        serviceContainer.getParameter('foo')
      }).to.throw(Error, /^Undefined parameter "foo"$/)
    })
  })

  describe('#setParameter', function () {
    it('should associate a parameter to its name', simpleGetSetParameterTest)

    context('there is already one parameter with the name', function () {
      it('should replace previous parameter with a new one ', function () {
        serviceContainer.setParameter('foo', 'bar')

        serviceContainer.setParameter('foo', 'qux')

        expect(serviceContainer.getParameter('foo')).to.be.equal('qux')
      })
    })
  })

  describe('#hasParameter', function () {
    context('parameter is not set', function () {
      it('should return false', function () {
        expect(serviceContainer.hasParameter('foo')).to.be.equal(false)
      })
    })

    context('parameter is set', function () {
      it('should return true', function () {
        serviceContainer.setParameter('foo', 42)

        expect(serviceContainer.hasParameter('foo')).to.be.equal(true)
      })
    })
  })

  describe('#hasDefinition', function () {
    context('the service has no definition', function () {
      it('should return false', function () {
        expect(serviceContainer.hasDefinition('foo')).to.be.equal(false)
      })
    })

    context('the service has no definition', function () {
      it('should return true', function () {
        const definition = new FactoryDefinition(function () {})

        serviceContainer.setDefinition('foo', definition)

        expect(serviceContainer.hasDefinition('foo')).to.be.equal(true)
      })
    })
  })

  describe('#hasInstance', function () {
    context('the service has no instance', function () {
      it('should return false', function () {
        expect(serviceContainer.hasInstance('foo')).to.be.equal(false)
      })
    })

    context('the service has an instance', function () {
      it('should return true', function () {
        serviceContainer.set('foo', {})

        expect(serviceContainer.hasInstance('foo')).to.be.equal(true)
      })
    })
  })

  describe('#has', function () {
    context('the service has no instance and no definition', function () {
      it('should return false', function () {
        expect(serviceContainer.has('foo')).to.be.equal(false)
      })
    })

    context('the service has an instance and no definition', function () {
      it('should return false', function () {
        serviceContainer.set('foo', {})

        expect(serviceContainer.has('foo')).to.be.equal(true)
      })
    })

    context('the service has no instance but a definition', function () {
      it('should return false', function () {
        serviceContainer.setDefinition('foo', new FactoryDefinition(function() {}))

        expect(serviceContainer.has('foo')).to.be.equal(true)
      })
    })
  })
})