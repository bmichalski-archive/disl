"use strict"

if (typeof require !== 'undefined') {
  var expect = require('chai').expect

  var di = require('./di')

  var ClassConstructorDefinition = di.ClassConstructorDefinition
  var Reference = di.Reference
}

describe('ClassConstructorDefinition', function () {
  describe('#constructor', function () {
    context('only classConstructorIdentifier is given', function () {
      it('should expose serviceIdentifier and args', function () {
        const classConstructorIdentifier = 'Foo'

        const definition = new ClassConstructorDefinition(classConstructorIdentifier)

        expect(definition.classConstructorIdentifier).to.be.equal(classConstructorIdentifier)
        expect(definition.args).to.be.instanceOf(Array)
        expect(definition.args).to.have.lengthOf(0)
      })
    })

    context('both classConstructorIdentifier and args are given', function () {
      it('should expose serviceIdentifier and dependencies', function () {
        const classConstructorIdentifier = 'Foo'
        const args = [ new Reference('foo'), new Reference('bar') ]

        const definition = new ClassConstructorDefinition(classConstructorIdentifier, args)

        expect(definition.classConstructorIdentifier).to.be.equal(classConstructorIdentifier)
        expect(definition.args).to.be.instanceOf(Array)
        expect(definition.args).to.equal(args)
      })
    })
  })
})