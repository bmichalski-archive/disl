"use strict"

if (typeof require !== 'undefined') {
  var assert = require('assert')

  var { expect } = require('chai')
  var sinon = require('sinon')

  var {
    FactoryDefinition,
    ClassConstructorDefinition,
    Reference,
    Parameter,
    MethodCall,
    Container
  } = require('./di')
}

describe('Container', function () {
  let serviceContainer

  beforeEach(function () {
    serviceContainer = new Container()
  })

  describe('#set and #get', function () {
    it('should associate a service instance to its name', function () {
      const serviceInstance = {}

      serviceContainer.set('foo', serviceInstance)

      return expect(serviceContainer.get('foo')).to.eventually.equal(serviceInstance)
    })

    context('there is already one service instance with the name', function () {
      beforeEach(function () {
        const serviceInstance = {}

        serviceContainer.set('foo', serviceInstance)
      })

      it('should replace previous service instance with a new one ', function () {
        const serviceInstance2 = {}

        serviceContainer.set('foo', serviceInstance2)

        return expect(serviceContainer.get('foo')).to.eventually.equal(serviceInstance2)
      })
    })
  })

  describe('#getDefinition', function () {
    it('should return the service definition', function () {
      const serviceDefinition = new FactoryDefinition(function () {
        return
      })

      serviceContainer.setDefinition('foo', serviceDefinition)

      expect(serviceContainer.getDefinition('foo')).to.be.equal(serviceDefinition)
    })
  })

  describe('#setDefinition and #get', function () {
    context('definition argument is a factory method', function () {
      it('should return the service instance', function () {
        const serviceInstance = {}

        const serviceDefinition = new FactoryDefinition(function () {
          return serviceInstance
        })

        serviceContainer.setDefinition('foo', serviceDefinition)

        return expect(serviceContainer.get('foo')).to.eventually.equal(serviceInstance)
      })

      context('service definition returns nothing', function () {
        it('should throw an Error', function () {
          const definition = new FactoryDefinition(() => {})

          serviceContainer.setDefinition('foo', definition)

          return expect(serviceContainer.get('foo'))
            .to.eventually
            .be.an.instanceOf(Error)
            .and.be.rejectedWith(/^Expecting factory method to return a service$/)
        })
      })
    })

    context('definition argument is a service identifier', function () {
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

        return expect(serviceContainer.get('foo')).to.eventually.be.instanceOf(Foo)
      })
    })

    context('has already been called once and returned a service instance', function () {
      it('should return the same service instance', function () {
        const serviceInstance = {}

        const serviceDefinition = new FactoryDefinition(() => { return serviceInstance })

        serviceContainer.setDefinition('foo', serviceDefinition)

        return expect(serviceContainer.get('foo'))
          .to.eventually
          .to.be.equal(serviceInstance)
          .then(() => {
            return expect(serviceContainer.get('foo')).to.eventually.be.equal(serviceInstance)
          })
      })
    })

    context('the definition defines dependencies', function () {
      it('should return the service instance', function () {
        const barServiceInstance = {}
        const quxServiceInstance = {}

        serviceContainer.set('bar', barServiceInstance)
        serviceContainer.set('qux', quxServiceInstance)
        serviceContainer.setParameter('foo', 'foo_value')
        serviceContainer.setParameter('qux', 'qux_balue')

        const serviceInstance = {}

        const serviceDefinition = new FactoryDefinition(
          function() {
            expect(arguments[0]).to.be.equal(barServiceInstance)
            expect(arguments[1]).to.be.equal(quxServiceInstance)

            return serviceInstance
          },
          [ new Reference('bar'), new Reference('qux'), new Parameter('foo'), new Parameter('qux') ]
        )

        serviceContainer.setDefinition('foo', serviceDefinition)

        return expect(serviceContainer.get('foo')).to.eventually.be.equal(serviceInstance)
      })

      context('there is a circular dependency', function () {
        context('to the same service', function () {
          it('should handle circular dependency by throwing an Error', function () {
            const fooServiceDefinition = new ClassConstructorDefinition('Foo', [ new Reference('foo') ])

            serviceContainer.setDefinition('foo', fooServiceDefinition)

            return expect(serviceContainer.get('foo'))
              .to.eventually
              .be.instanceOf(Error)
              .and.be.rejectedWith(/^Circular dependency detected foo => foo$/)
          })
        })

        context('via another service', function () {
          it('should handle circular dependency by throwing an Error', function () {
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

    context('the service definition defines method calls', function () {
      it('should call those methods', function () {
        const barInstance = {}

        serviceContainer.set('bar', barInstance)
        serviceContainer.setParameter('qux', 'qux_value')

        const spy = sinon.spy()
        const spy2 = sinon.spy()

        const definition = new FactoryDefinition(() => {
          return { spy: spy, spy2: spy2 }
        })

        definition.methodCalls = [
          new MethodCall('spy'),
          new MethodCall('spy2', [ new Reference('bar'), new Parameter('qux') ])
        ]

        serviceContainer.setDefinition('foo', definition)

        return serviceContainer.get('foo').then(() => {
          assert(spy.calledOnce)
          assert(spy.calledWithExactly())

          assert(spy2.calledOnce)
          assert(spy2.calledWithExactly(barInstance, 'qux_value'))
        })
      })

      context('the called method does not exists', function () {
        it('should throw an Error', function () {
          const definition = new FactoryDefinition(() => { return {} })

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

      context('there is a circular dependency', function () {
        context('to same service', function () {
          it('should handle circular dependency by throwing an Error', function () {
            const definition = new FactoryDefinition(() => { return { meth: () => {} } })

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
            const barDefinition = new FactoryDefinition(() => { return { meth: () => {} } })

            const fooDefinition = new FactoryDefinition(() => { return {} }, [ new Reference('bar') ])

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

  describe('#get', function () {
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

          serviceContainer.registerInstanceLocator((identifier) => {
            if ('foo' === identifier) {
              return fooInstance
            }
          })

          return expect(serviceContainer.get('foo'))
            .to.eventually
            .be.equal(fooInstance)
        })
      })
    })
  })

  //Todo assert get priorities

  describe('#setParameter and #getParameter', function () {
    it('should associate a parameter to its name', function () {
      serviceContainer.setParameter('foo', 'bar')

      expect(serviceContainer.getParameter('foo')).to.be.equal('bar')
    })

    context('there is already one parameter with the name', function () {
      beforeEach(function () {
        serviceContainer.setParameter('foo', 'bar')
      })

      it('should replace previous parameter with a new one ', function () {
        serviceContainer.setParameter('foo', 'qux')

        expect(serviceContainer.getParameter('foo')).to.be.equal('qux')
      })
    })

    it('should thrown an error if parameter does not exist', function () {
      expect(function () {
        serviceContainer.getParameter('foo')
      }).to.throw(Error, /^Undefined parameter "foo"$/)
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
        const definition = new FactoryDefinition(() => {})

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
        serviceContainer.setDefinition('foo', new FactoryDefinition(() => {}))

        expect(serviceContainer.has('foo')).to.be.equal(true)
      })
    })
  })
})