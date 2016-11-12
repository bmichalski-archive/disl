'use strict'

if (typeof require !== 'undefined') {
  var assert = require('assert')

  var expect = require('chai').expect

  var {
    ClassConstructorDefinition,
    Reference,
    Parameter,
    MethodCall,
    Container,
    ObjectLoader,
    UnknownArgumentFormatError
  } = require('./di')
}

describe('ObjectLoader', function () {
  describe('#load', function () {
    it('should load service definitions', function() {
      var container = new Container()
      var objectLoader = new ObjectLoader()

      objectLoader.load(
        container,
        {
          'app.foo': {
            class: 'AppFoo',
            args: [
              '@app.bar',
              '%foo_parameter'
            ],
            calls: [
              [ 'foo', [ '@foo_call_service', '%foo_call_parameter' ] ],
              [ 'bar', [ '@bar_call_service', '%bar_call_parameter' ] ]
            ]
          }
        }
      )

      var definition = container.getDefinition('app.foo')

      expect(definition).to.be.instanceOf(ClassConstructorDefinition)

      expect(definition.classConstructorIdentifier).to.be.equal('AppFoo')

      var args = definition.args

      expect(args).to.be.lengthOf(2)

      expect(args[0]).to.be.instanceOf(Reference)
      expect(args[0].id).to.be.equal('app.bar')

      expect(args[1]).to.be.instanceOf(Parameter)
      expect(args[1].id).to.be.equal('foo_parameter')

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
    })

    context('one of the arguments is of an unknown format', function () {
      it('should throw an UnknownArgumentFormatError', function () {
        var container = new Container()
        var objectLoader = new ObjectLoader()

        expect(function () {
          objectLoader.load(
            container,
            {
              'app.foo': {
                class: 'AppFoo',
                args: [
                  'app.bar',
                ]
              }
            }
          )
        }).to.throw(UnknownArgumentFormatError)
      })
    })
  })
})