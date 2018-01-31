import Ember from 'ember';
import { executeTest} from './execute-folv-test';
import { addRecords, deleteRecords, refreshListByFunction } from './folv-tests-functions';

import generateUniqueId from 'ember-flexberry-data/utils/generate-unique-id';

executeTest('check paging dropdown', (store, assert, app) => {
  assert.expect(6);
  let path = 'components-acceptance-tests/flexberry-objectlistview/folv-paging';
  let modelName = 'ember-flexberry-dummy-suggestion-type';
  let uuid = generateUniqueId();

  // Add records for paging.
  Ember.run(() => {

    addRecords(store, modelName, uuid).then(function(resolvedPromises) {
      assert.ok(resolvedPromises, 'All records saved.');

      visit(path);
      andThen(function() {
        assert.equal(currentPath(), path);

        let $choosedIthem;
        let trTableBody;
        let activeItem;

        // Refresh function.
        let refreshFunction =  function() {
          let $folvPerPageButton = Ember.$('.flexberry-dropdown.compact');
          let $menu = Ember.$('.menu', $folvPerPageButton);
          trTableBody = () => { return $(Ember.$('table.object-list-view tbody tr')).length.toString(); };

          activeItem =  () => { return $(Ember.$('.item.active.selected', $menu)).attr('data-value'); };

          // The list should be more than 5 items.
          assert.equal(activeItem(), trTableBody(), 'equal perPage and visible element count');
          $folvPerPageButton.click();
          let timeout = 500;
          Ember.run.later((() => {
            let menuIsVisible = $menu.hasClass('visible');
            assert.strictEqual(menuIsVisible, true, 'menu is visible');
            $choosedIthem = Ember.$('.item', $menu);
            $choosedIthem[1].click();
          }), timeout);
        };

        let controller = app.__container__.lookup('controller:' + currentRouteName());
        let done = assert.async();
        refreshListByFunction(refreshFunction, controller).then(() => {
          assert.equal(activeItem(), $($choosedIthem[1]).attr('data-value'), 'equal');

          // The list should be more than 10 items
          assert.equal(activeItem(), trTableBody(), 'equal perPage and visible element count');
        }).catch((reason) => {
          throw new Error(reason);
        }).finally(() => {
          deleteRecords(store, modelName, uuid, assert);
          done();
        });
      });
    });
  });
});
