/* globals module */
module.exports = {
  afterInstall: function() {
    var _this = this;

    /*
      Following packages should be installed as dependencies of `ember-flexberry-data`:
      `localforage`, `ember-browserify`, `ember-localforage-adapter`, `dexie`.
	  Also `app/browserify.js` should be removed when check this.
    */

    return this.addBowerPackagesToProject([
      { name: 'semantic-ui-daterangepicker', target: '5d46ed2e6e5a0bf398bb6a5df82e06036dfc46be' },
      { name: 'blueimp-file-upload', target: '9.11.2' },
      { name: 'devicejs', target: '0.2.7' }
    ]).then(function() {
      return _this.addAddonsToProject({
        packages: [
          { name: 'semantic-ui-ember', target: '0.9.3' },
          { name: 'ember-moment', target: '6.0.0' },
          { name: 'ember-link-action', target: '0.0.34' },
          { name: 'broccoli-jscs', target: '1.2.2' },
          { name: 'ember-flexberry-data', target: 'https://github.com/Flexberry/ember-flexberry-data.git#develop' }
        ]
      });
    });
  },

  normalizeEntityName: function() {}
};
