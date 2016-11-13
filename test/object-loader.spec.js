'use strict'

if (typeof require !== 'undefined') {
  var assert = require('assert')

  var expect = require('chai').expect

  var {
    ClassConstructorDefinition,
    ServiceMethodFactoryDefinition,
    StaticMethodFactoryDefinition,
    FunctionServiceFactoryDefinition,
    Reference,
    Parameter,
    MethodCall,
    Container,
    ObjectLoader,
    UnknownArgumentFormatError
  } = require('./di')
}

describe('ObjectLoader', function () {
  let args = [
    '@app.bar',
    '%foo_parameter'
  ]

  let calls = [
    [ 'foo', [ '@foo_call_service', '%foo_call_parameter' ] ],
    [ 'bar', [ '@bar_call_service', '%bar_call_parameter' ] ]
  ]

  function assertArgs(definition) {
    var args = definition.args

    expect(args).to.be.lengthOf(2)

    expect(args[0]).to.be.instanceOf(Reference)
    expect(args[0].id).to.be.equal('app.bar')

    expect(args[1]).to.be.instanceOf(Parameter)
    expect(args[1].id).to.be.equal('foo_parameter')
  }

  function assertCalls(definition) {
    var methodCalls = definition.methodCalls

    expect(methodCalls[0]).to.be.instanceOf(MethodCall)
    expect(methodCalls[0].name).to.be.equal('foo')
    expect(methodCalls[0].args).to.be.lengthOf(2)
    expect(methodCalls[0].args[0]).to.be.instanceOf(Reference)
    expect(methodCalls[0].args[0].id).to.be.equal('foo_call_service')
    expect(methodCalls[0].args[1]).to.be.instanceOf(Parameter)
    expect(methodCalls[0].args[1].id).to.be.equal('foo_call_parameter')

    expect(methodCalls[1]).to.be.instanceOf(MethodCall)
    expect(methodCalls[1].name).to.be.equal('bar')
    expect(methodCalls[1].args).to.be.lengthOf(2)
    expect(methodCalls[1].args[0]).to.be.instanceOf(Reference)
    expect(methodCalls[1].args[0].id).to.be.equal('bar_call_service')
    expect(methodCalls[1].args[1]).to.be.instanceOf(Parameter)
    expect(methodCalls[1].args[1].id).to.be.equal('bar_call_parameter')
  }

  describe('#load', function () {
    context('a class constructor based definition is defined', function () {
      it('should load service definitions', function() {
        var container = new Container()
        var objectLoader = new ObjectLoader(container)

        objectLoader.load(
          {
            'app.foo': {
              class: 'AppFoo',
              args: args,
              calls: calls
            }
          }
        )

        var definition = container.getDefinition('app.foo')

        expect(definition).to.be.instanceOf(ClassConstructorDefinition)

        expect(definition.classConstructorIdentifier).to.be.equal('AppFoo')

        assertArgs(definition)
        assertCalls(definition)
      })
    })

    context('a factory based definition is defined', function () {
      context('and the factory uses a service instance method', function () {
        it('should load service definitions', function() {
          var container = new Container()
          var objectLoader = new ObjectLoader(container)

          objectLoader.load(
            {
              'app.foo': {
                factory: [ '@app.foo_factory', 'instantiate' ],
                args: args,
                calls: calls
              }
            }
          )

          var definition = container.getDefinition('app.foo')

          expect(definition).to.be.instanceOf(ServiceMethodFactoryDefinition)
          expect(definition.factory[0]).to.be.instanceOf(Reference)
          expect(definition.factory[0].id).to.be.equal('app.foo_factory')
          expect(definition.factory[1]).to.be.equal('instantiate')

          assertArgs(definition)
          assertCalls(definition)
        })
      })

      context('and the factory uses a static method', function () {
        it('should load service definitions', function() {
          var container = new Container()
          var objectLoader = new ObjectLoader(container)

          objectLoader.load(
            {
              'app.foo': {
                factory: [ 'FooFactory', 'instantiate' ],
                args: args,
                calls: calls
              }
            }
          )

          var definition = container.getDefinition('app.foo')

          expect(definition).to.be.instanceOf(StaticMethodFactoryDefinition)
          expect(definition.factory[0]).to.be.equal('FooFactory')
          expect(definition.factory[1]).to.be.equal('instantiate')

          assertArgs(definition)
          assertCalls(definition)
        })
      })

      context('and the factory uses a function service', function () {
        it('should load service definitions', function () {
          var container = new Container()
          var objectLoader = new ObjectLoader(container)

          objectLoader.load(
            {
              'app.foo': {
                factory: '@app.foo_function_service',
                args: args,
                calls: calls
              }
            }
          )

          var definition = container.getDefinition('app.foo')

          expect(definition).to.be.instanceOf(FunctionServiceFactoryDefinition)
          expect(definition.factory).to.be.instanceOf(Reference)
          expect(definition.factory.id).to.be.equal('app.foo_function_service')

          assertArgs(definition)
          assertCalls(definition)
        })
      })
    })

    context('one of the arguments is of an unknown format', function () {
      it('should throw an UnknownArgumentFormatError', function () {
        var container = new Container()
        var objectLoader = new ObjectLoader(container)

        expect(function () {
          objectLoader.load(
            {
              'app.foo': {
                class: 'AppFoo',
                args: [
                  'app.bar'
                ]
              }
            }
          )
        }).to.throw(UnknownArgumentFormatError)
      })
    })
  })
})