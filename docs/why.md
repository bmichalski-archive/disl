#Why promises?
Service retrieval is done via [promises](https://promisesaplus.com/).

The Promise object is used for asynchronous computations. It can be useful in cases such as:
* when using a module loader such as [requirejs](http://requirejs.org/), in a web browser, to load multiple services at the same time
* when waiting for an input or output operation to finish, for example when connecting to a database

# Motivations
I have been working for a few years on a rather complex project using both [requirejs](http://requirejs.org/) and [angularjs](https://angularjs.org/) on the client side.
<br />
This is an attempt to implement a unified way to handle both dependency injection and service location in such an environment.

# Project influences
This work has mainly been influenced by the [Symfony dependency-injection component](https://github.com/symfony/dependency-injection).

<hr />

Previous: [More examples](more-examples.md)
<br />
[README.md](../README.md)
