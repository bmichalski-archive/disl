"use strict"

describe('Integration with angular', function () {
  beforeEach(function () {
    if (typeof window === 'undefined') {
      this.skip()
    }
  })

  function makeTest(addServices, makeExpect) {
    return function () {
      //Declaration of angular modules and services
      const fooInstance = {}
      const barInstance = {}

      const fooModule = angular.module('foo', [])

      addServices(fooModule, fooInstance, barInstance)

      //Done declaring angular modules and services

      const exposeAngularServicesModule = angular.module('exposeAngularServices', [])

      const container = new Container()

      exposeAngularServicesModule.run([ '$injector', function ($injector) {
        container.registerInstanceLocator(function (identifier) {
          return new Promise(function (resolve) {
            /**
             * Use $injector to inject / instantiate services on-demand
             */
            resolve($injector.get(identifier))
          })
        })
      }])

      //exposeAngularServices is loaded last to be able to access other modules services

      angular.bootstrap(undefined, [ 'foo', 'exposeAngularServices' ])

      return makeExpect(container, fooInstance, barInstance)
    }
  }

  it(
    'should be able to get an angular service as a container service',
    makeTest(
      function (fooModule, fooInstance, barInstance) {
        fooModule.service('foo', [function () {
          return fooInstance
        }])

        fooModule.service('bar', [ 'foo', function () {
          return barInstance
        }])
      },
      function (container, fooInstance, barInstance) {
        return Promise.all([
          expect(container.get('foo'))
            .to.eventually
            .be.fulfilled
            .then(function (services) {
              expect(services).to.be.instanceOf(Array).and.to.be.lengthOf(1)
              expect(services[0]).to.be.equal(fooInstance)
            }),
          expect(container.get('bar'))
            .be.fulfilled
            .then(function (services) {
              expect(services).to.be.instanceOf(Array).and.to.be.lengthOf(1)
              expect(services[0]).to.be.equal(barInstance)
            })
        ])
      }
    )
  )

  it('should throw an UndefinedServiceDefinitionAndInstanceError if angular service does not exist', function () {
    const container = new Container()

    const exposeAngularServicesModule = angular.module('exposeAngularServices', [])

    exposeAngularServicesModule.run([ '$injector', function ($injector) {
      container.registerInstanceLocator(function (identifier) {
        return new Promise(function (resolve) {
          if ($injector.has(identifier)) {
            resolve($injector.get(identifier))
          } else {
            resolve()
          }
        })
      })
    }])

    angular.bootstrap(undefined, [ 'exposeAngularServices' ])

    return expect(container.get('unknown_service'))
      .to.eventually
      .be.instanceOf(UndefinedServiceDefinitionAndInstanceError)
      .and.be.rejectedWith(/^Undefined service definition and instance for identifier "unknown_service"$/)
  })

  context('there is a circular dependency between angular services', function () {
    it(
      'should be rejected with a CircularDependencyError',
      makeTest(
        function (fooModule, fooInstance, barInstance) {
          fooModule.service('foo', [ 'bar', function () {
            return fooInstance
          }])

          fooModule.service('bar', [ 'foo', function () {
            return barInstance
          }])
        },
        function (container) {
          return expect(container.get('foo'))
            .to.eventually
            .be.instanceOf(CircularDependencyError)
            .and.to.be.rejectedWith('Circular dependency found: foo <- bar <- foo')
        }
      )
    )
  })
})