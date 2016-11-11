"use strict"

if (typeof require !== 'undefined') {
  const origRequire = require

  var expect = origRequire('chai').expect

  var { Container } = require('../di')

  var require = origRequire('requirejs')
  var define = require.define
}

describe('Integration with requirejs', function () {
  beforeEach(function () {
    require.undef('foo')
  })

  it('should be able to get a requirejs module as a service', function () {
    const container = new Container()

    const fooInstance = {}

    define('foo', function () { return fooInstance })

    container.registerInstanceLocator(function (identifier) {
      return new Promise(function (resolve) {
        require(
          [
            identifier
          ],
          function (service) {
            resolve(service)
          }
        )
      })
    })

    return expect(container.get('foo'))
      .to.eventually
      .be.fulfilled
      .then(function (services) {
        expect(services).to.be.instanceOf(Array).and.to.be.lengthOf(1)
        expect(services[0]).to.be.equal(fooInstance)
      })
  })

  it('should throw an UndefinedServiceDefinitionAndInstanceError if requirejs service does not exist', function () {
    const container = new Container()

    container.registerInstanceLocator(
      function (identifier) {
        return new Promise(
          function (resolve, reject) {
            require(
              [
                identifier
              ],
              function (service) {
                resolve(service)
              },
              //Don't forget to add error handing
              function (err) {
                if (err.requireModules) {
                  resolve()
                } else {
                  reject(err)
                }
              }
            )
          })
      }
    )

    return expect(container.get('foo'))
      .to.eventually
      .be.instanceOf(UndefinedServiceDefinitionAndInstanceError)
      .be.rejectedWith(/^Undefined service definition and instance for identifier "foo"$/)
  })

  context('get has already been used once to get the requirejs module', function () {
    it('should return the same instance', function () {
      const container = new Container()

      const Foo = function () {}

      define('foo', function () { return new Foo() })

      container.registerInstanceLocator(function (identifier) {
        return new Promise(function (resolve) {
          require(
            [
              identifier
            ],
            function (service) {
              resolve(service)
            }
          )
        })
      })

      function assertServices(services) {
        expect(services).to.be.instanceOf(Array).and.to.be.lengthOf(1)
        expect(services[0]).to.be.instanceOf(Foo)
      }

      return expect(container.get('foo'))
        .to.eventually
        .be.fulfilled
        .then(function (services) {
          assertServices(services)

          const aInstance = services[0]

          return expect(container.get('foo'))
            .be.fulfilled
            .then(function (services) {
              assertServices(services)

              expect(services[0]).to.be.equal(aInstance)
            })
        })
    })
  })
})