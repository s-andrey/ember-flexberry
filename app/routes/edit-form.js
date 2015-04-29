import Ember from 'ember';
import FetchModelRoute from 'prototype-ember-cli-application/routes/fetch-model';

export default FetchModelRoute.extend({
    view: Ember.required(),
    modelTypeKey: Ember.required(),

    model: function(params, transition) {
        this._super(params, transition);

        var store = this.store;

        // :id param defined in router.js

        // Because fetchById don't setup preload if hasRecordForId returns true.
        if (store.hasRecordForId(this.modelTypeKey, params.id)) {
            var record = store.getById(this.modelTypeKey, params.id);
            if (record.get('_view') !== this.view) {
                record.set('_view', this.view);
                return record.reload();
            } else {
                //return record;
                // Fetch always, refresh record.
                return record.reload();
            }
        } else {
            return store.find(this.modelTypeKey, params.id, { _view: this.view });
        }
    },

    resetController: function(controller, isExisting, transition) {
        this._super.apply(arguments);

        controller.send('dismissErrorMessages');
        var model = controller.get('model');
        if (model && model.get('isDirty')) {
            model.rollback();
        }
    }
});
