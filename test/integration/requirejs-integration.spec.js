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

    container.registerInstanceLocator((identifier) => {
      return new Promise((resolve) => {
        require(
          [
            identifier
          ],
          (service) => {
            resolve(service)
          }
        )
      })
    })

    return expect(container.get('foo'))
      .to.eventually
      .deep.equal([fooInstance])
  })

  it('should throw an error if requirejs service does not exist', function () {
    const container = new Container()

    container.registerInstanceLocator(
      (identifier) => {
        return new Promise(
          (resolve, reject) => {
            require(
              [
                identifier
              ],
              (service) => {
                resolve(service)
              },
              //Don't forget to add error handing
              (err) => {
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
      .be.instanceOf(Error)
      .be.rejectedWith(/^Missing service definition and instance for identifier "foo"$/)
  })

  context('get has already been used once to get the requirejs module', function () {
    it('should return the same instance', function () {
      const container = new Container()

      const fooInstance = {}

      define('foo', function () { return fooInstance })

      container.registerInstanceLocator((identifier) => {
        return new Promise((resolve) => {
          require(
            [
              identifier
            ],
            (service) => {
              resolve(service)
            }
          )
        })
      })

      return expect(container.get('foo'))
        .to.eventually
        .deep.equal([fooInstance])
        .then(() => {
          return expect(container.get('foo'))
            .to.eventually
            .deep.equal([fooInstance])
        })
    })
  })
})