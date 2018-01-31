/**
  @module ember-flexberry
*/

import Ember from 'ember';
import LimitedRouteMixin from '../mixins/limited-route';
import SortableRouteMixin from '../mixins/sortable-route';
import PaginatedRouteMixin from '../mixins/paginated-route';
import ProjectedModelFormRoute from '../routes/projected-model-form';
import FlexberryObjectlistviewRouteMixin from '../mixins/flexberry-objectlistview-route';
import FlexberryObjectlistviewHierarchicalRouteMixin from '../mixins/flexberry-objectlistview-hierarchical-route';
import ReloadListMixin from '../mixins/reload-list-mixin';

/**
  Base route for the List Forms.

  This class re-exports to the application as `/routes/list-form`.
  So, you can inherit from `./list-form`, even if file `app/routes/list-form.js` is not presented in the application.

  @example
    ```javascript
    // app/routes/employees.js
    import ListFormRoute from './list-form';
    export default ListFormRoute.extend({
    });
    ```

    If you want to add some common logic on all List Forms, you can override `app/routes/list-form.js` as follows:
    ```javascript
    // app/routes/list-form.js
    import ListFormRoute from 'ember-flexberry/routes/list-form';
    export default ListFormRoute.extend({
    });
    ```

  @class ListFormRoute
  @extends ProjectedModelFormRoute
  @uses PaginatedRouteMixin
  @uses SortableRouteMixin
  @uses LimitedRouteMixin
  @uses ReloadListMixin
  @uses FlexberryObjectlistviewRouteMixin
*/
export default ProjectedModelFormRoute.extend(
PaginatedRouteMixin,
SortableRouteMixin,
LimitedRouteMixin,
ReloadListMixin,
FlexberryObjectlistviewRouteMixin,
FlexberryObjectlistviewHierarchicalRouteMixin, {
  /**
    Link on {{#crossLink FormLoadTimeTrackerService}}{{/crossLink}}.

    @property formLoadTimeTracker
    @type FormLoadTimeTrackerService
    @private
  */
  formLoadTimeTracker: Ember.inject.service(),

  /**
    Current sorting.

    @property sorting
    @type Array
    @default []
  */
  sorting: [],

  /**
    @property colsConfigMenu
    @type Service
  */
  colsConfigMenu: Ember.inject.service(),

  /**
    Service that triggers objectlistview events.

    @property objectlistviewEventsService
    @type Service
  */
  objectlistviewEventsService: Ember.inject.service('objectlistview-events'),

  /**
    A hook you can implement to convert the URL into the model for this route.
    [More info](http://emberjs.com/api/classes/Ember.Route.html#method_model).

    @method model
    @param {Object} params
    @param {Object} transition
  */
  model: function(params, transition) {
    this.get('formLoadTimeTracker').set('startLoadTime', performance.now());

    let controller = this.controllerFor(this.routeName);
    this.get('objectlistviewEventsService').setLoadingState('loading');

    let modelName = this.get('modelName');
    let webPage = transition.targetName;
    let projectionName = this.get('modelProjection');
    let filtersPredicate = this._filtersPredicate();
    let limitPredicate =
      this.objectListViewLimitPredicate({ modelName: modelName, projectionName: projectionName, params: params });
    let userSettingsService = this.get('userSettingsService');
    userSettingsService.setCurrentWebPage(webPage);
    let developerUserSettings = this.get('developerUserSettings');
    Ember.assert('Property developerUserSettings is not defined in /app/routes/' + transition.targetName + '.js', developerUserSettings);

    let nComponents = 0;
    let componentName;
    for (componentName in developerUserSettings) {
      let componentDesc = developerUserSettings[componentName];
      switch (typeof componentDesc) {
        case 'string':
          developerUserSettings[componentName] = JSON.parse(componentDesc);
          break;
        case 'object':
          break;
        default:
          Ember.assert('Component description ' + 'developerUserSettings.' + componentName +
            'in /app/routes/' + transition.targetName + '.js must have types object or string', false);
      }
      nComponents += 1;
    }

    if (nComponents === 0) {
      Ember.assert('Developer MUST DEFINE component settings in /app/routes/' + transition.targetName + '.js', false);
    }

    Ember.assert('Developer MUST DEFINE SINGLE components settings in /app/routes/' + transition.targetName + '.js' + nComponents + ' defined.',
      nComponents === 1);
    userSettingsService.setDefaultDeveloperUserSettings(developerUserSettings);
    let userSettingPromise = userSettingsService.setDeveloperUserSettings(developerUserSettings);
    let listComponentNames = userSettingsService.getListComponentNames();
    componentName = listComponentNames[0];
    userSettingPromise
      .then(currectPageUserSettings => {
        if (params) {
          userSettingsService.setCurrentParams(componentName, params);
        }

        let hierarchicalAttribute;
        if (controller.get('inHierarchicalMode')) {
          hierarchicalAttribute = controller.get('hierarchicalAttribute');
        }

        this.sorting = userSettingsService.getCurrentSorting(componentName);
        this.perPage = userSettingsService.getCurrentPerPage(componentName);
        if (this.perPage !== params.perPage) {
          if (params.perPage !== 5) {
            this.perPage = params.perPage;
            userSettingsService.setCurrentPerPage(componentName, undefined, this.perPage);
          } else {
            if (this.sorting.length === 0) {
              this.transitionTo(this.currentRouteName, { queryParams: { sort: null, perPage: this.perPage || 5 } }); // Show page without sort parameters
            } else {
              this.transitionTo(this.currentRouteName, { queryParams: { perPage: this.perPage || 5 } });  //Reload current page and records (model) list
            }
          }
        }

        let queryParameters = {
          modelName: modelName,
          projectionName: projectionName,
          perPage: this.perPage,
          page: params.page,
          sorting: this.sorting,
          filter: params.filter,
          filterCondition: this.get('controller.filterCondition'),
          filters: filtersPredicate,
          predicate: limitPredicate,
          hierarchicalAttribute: hierarchicalAttribute,
        };

        this.onModelLoadingStarted(queryParameters);
        this.get('colsConfigMenu').updateNamedSettingTrigger();

        // Find by query is always fetching.
        // TODO: support getting from cache with "store.all->filterByProjection".
        // TODO: move includeSorting to setupController mixins?
        return this.reloadList(queryParameters);
      }).then((records) => {
        this.get('formLoadTimeTracker').set('endLoadTime', performance.now());
        this.onModelLoadingFulfilled(records);
        this.includeSorting(records, this.sorting);
        this.get('controller').set('model', records);
        return records;
      }).catch((errorData) => {
        this.onModelLoadingRejected(errorData);
      }).finally((data) => {
        this.onModelLoadingAlways(data);
        if (this.get('objectlistviewEventsService.loadingState') === 'loading') {
          this.get('objectlistviewEventsService').setLoadingState('');
        }
      });

    if (this.get('controller') === undefined) {
      return { isLoading: true };
    }

    // TODO: Check controller loaded model loading parameters and return it without reloading if there is same backend query was executed.
    let model = this.get('controller.model');

    if (model !== null) {
      return model;
    } else {
      return { isLoading: true };
    }
  },

  actions: {
    /**
      Event handler for processing promise model rejecting.
      [More info](https://emberjs.com/api/ember/2.4/classes/Ember.Route/events/error?anchor=error).

      @method actions.error
      @param {Object} error
      @param {Object} transition
    */
    error: function(error, transition) {
      this.onModelLoadingRejected(error);
    }
  },

  /**
    This method will be invoked before model loading operation will be called.
    Override this method to add some custom logic on model loading operation start.

    @example
      ```javascript
      onModelLoadingStarted(queryParameters) {
        alert('Model loading operation started!');
      }
      ```
    @method onModelLoadingStarted.
    @param {Object} queryParameters Query parameters used for model loading operation.
  */
  onModelLoadingStarted(queryParameters) {
  },

  /**
    This method will be invoked when model loading operation successfully completed.
    Override this method to add some custom logic on model loading operation success.

    @example
      ```javascript
      onModelLoadingFulfilled() {
        alert('Model loading operation succeed!');
      }
      ```
    @method onModelLoadingFulfilled.
    @param {Object} model Loaded model data.
  */
  onModelLoadingFulfilled(model) {
  },

  /**
    This method will be invoked when model loading operation completed, but failed.
    Override this method to add some custom logic on model loading operation fail.
    By default showing error form.

    @example
      ```javascript
      onModelLoadingRejected() {
        alert('Model loading operation failed!');
      }
      ```
    @method onModelLoadingRejected.
    @param {Object} errorData Data about model loading operation fail.
  */
  onModelLoadingRejected(errorData) {
    errorData = errorData || {};
    this._updateErrorToDisplay(errorData);
    if (!this.get('controller') || !this.get('controller.model') || this.get('controller.model.isLoading')) {
      this.get('objectlistviewEventsService').setLoadingState('error');
      errorData.retryRoute = this.routeName;
      this.intermediateTransitionTo('error', errorData);
    } else {
      this.controller.send('error', errorData);
    }
  },

  /**
    This method will be invoked always when model loading operation completed,
    regardless of model loading promise's state (was it fulfilled or rejected).
    Override this method to add some custom logic on model loading operation completion.

    @example
      ```js
      onModelLoadingAlways(data) {
        alert('Model loading operation completed!');
      }
      ```

    @method onModelLoadingAlways.
    @param {Object} data Data about completed model loading operation.
  */
  onModelLoadingAlways(data) {
  },

  /**
    A hook you can use to setup the controller for the current route.
    [More info](http://emberjs.com/api/classes/Ember.Route.html#method_setupController).

    @method setupController
    @param {<a href="http://emberjs.com/api/classes/Ember.Controller.html">Ember.Controller</a>} controller
    @param {Object} model
  */
  setupController: function(controller, model) {
    this._super(...arguments);
    this.get('formLoadTimeTracker').set('startRenderTime', performance.now());

    // Define 'modelProjection' for controller instance.
    // TODO: remove that when list-form controller will be moved to this route.
    let modelClass = this.store.modelFor(this.get('modelName'));
    let proj = modelClass.projections.get(this.get('modelProjection'));
    controller.set('userSettings', this.userSettings);
    controller.set('modelProjection', proj);
    controller.set('developerUserSettings', this.get('developerUserSettings'));
    controller.set('resultPredicate', this.get('resultPredicate'));
    if (Ember.isNone(controller.get('defaultDeveloperUserSettings'))) {
      controller.set('defaultDeveloperUserSettings', Ember.$.extend(true, {}, this.get('developerUserSettings')));
    }
  },

  /**
    This method checks error message and makes some messages more appropriate for perception.

    @method _updateErrorToDisplay.
    @param {Object} errorData Data with error description and details.
    @private
  */
  _updateErrorToDisplay(errorData) {
    let message = errorData.message ? errorData.message.replace(/\n/g, ' ') : '';
    if (message.indexOf('Ember Data Request') !== -1 && message.indexOf('returned a 0 Payload (Empty Content-Type)') !== -1) {
      errorData.name = this.get('i18n').t('forms.error-form.error').string.toString();
      errorData.message = this.get('i18n').t('forms.error-form.ember-data-request').string.toString();
    }
  }
});
