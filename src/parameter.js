/**
 * @author Benjamin Michalski <benjamin.michalski@gmail.com>
 *
 * @public
 */
class Parameter {

  /**
   * Constructor
   *
   * @param {string} id
   *
   * @public
   */
  constructor(id: string) {
    this._id = id
  }

  /**
   * Gets id
   *
   * @returns {string}
   *
   * @public
   */
  get id(): string {
    return this._id
  }
}

export default Parameter