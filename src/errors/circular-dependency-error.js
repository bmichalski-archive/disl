import DislError from './disl-error'

/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class CircularDependencyError extends DislError {
  
  /**
   * @param {Array<string>} services
   *
   * @returns {CircularDependencyError}
   */
  static createError(services: Array<string>): CircularDependencyError {
    const path = [].concat(services)
      .reverse()
      .join(' <- ')

    return new CircularDependencyError(
      {
        services
      },
      'Circular dependency found: %s',
      path
    )
  }
}

export default CircularDependencyError