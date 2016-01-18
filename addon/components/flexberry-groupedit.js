/**
 * @module ember-flexberry
 */

import FlexberryBaseComponent from './flexberry-base-component';

/**
 * Component for create, edit and delete detail objects.
 *
 * @class FlexberryGroupedit
 * @extends FlexberryBaseComponent
 */

var FlexberryGroupedit = FlexberryBaseComponent.extend({
  /**
   * Projection for detail object's model.
   *
   * @property modelProjection
   * @type Object
   * @default null
   */
  modelProjection: null,

  /**
   * Array of models for detail objects.
   *
   * @property content
   * @type ManyArray
   * @default null
   */
  content: null,

  /**
   * Function to get names of components to use for display
   * attributes of detail object's model.
   *
   * @property cellComponent
   * @type Function
   * @default null
   */
  cellComponent: null,

  /**
   * Setting to true enables row ordering by clicking on column headers.
   *
   * @property orderable
   * @type Boolean
   * @default false
   */
  orderable: false,
  _showCheckBoxInRow: true,
  _showDeleteButtonInRow: true,
  _rowClickable: false
});

export default FlexberryGroupedit;