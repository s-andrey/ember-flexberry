import Ember from 'ember';
//import userSettingsService from 'ember-flexberry/services/user-settings';
export default Ember.Controller.extend({

  objectlistviewEventsService: Ember.inject.service('objectlistview-events'),

  userSettingsService: Ember.inject.service('user-settings'),

  store: Ember.inject.service('store'),

  actions: {
    goCountFlops() {
      let profilerJS = window.profilerJS;
      let flops = profilerJS.currentComputerFlops();
      var finalRes = 0;
      var trueCount = 0;
      for (let i = 0; i< 100; i++) {
        profilerJS.start();
        this.get('userSettingsService').setDefaultDeveloperUserSettings(this.get('asd'));
        profilerJS.stop();
        let result = profilerJS.result();
        finalRes += result;
        trueCount++;
        if (result === 0) {trueCount--; }
      }
      let final = finalRes/trueCount;

      let userAgent = window.navigator.userAgent;

      let browser = '';
      if (userAgent.indexOf('Edge/') > 0) {
        browser = 'Edge';
      } else if (userAgent.indexOf('Firefox/') > 0) {
        browser = 'Firefox';
      } else if (userAgent.indexOf('Chrome/') > 0) {
        browser = 'Chrome';
      }

      let host = this.get('store').adapterFor('application').host;

      let data = {flops: flops, result: final, browser: browser};

      Ember.$.ajax({
        type: 'POST',
        xhrFields: { withCredentials: true},
        url: `${host}/SaveResult`,
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
      });
      this.set('thankYou', '<h2>Тест успешно пройден. Спасибо! PS: Если Вам не сложно запустите пожалуйста данный тест и в других браузерах.</h2>');
    }
  },

  buttonCaption: 'ТЕСТ',
  classButton: 'blue circular big',
  thankYou: '',
  asd: {
    suggestionUserVotesGroupEdit: {
      'DEFAULT': {
        'columnWidths': [
          { 'propName': 'OlvRowToolbar', 'fixed': true, 'width': 65 },
          { 'propName': 'voteType', 'width': 133 },
          { 'propName': 'author', 'width': 348 },
          { 'propName': 'author.eMail', 'width': 531 }
        ],
        'sorting': [{ 'propName': 'author', 'direction': 'asc', 'attributePath': 'author.name' }]
      }
    },
    filesGroupEdit: {
      'DEFAULT': {
        'columnWidths': [
          { 'propName': 'OlvRowToolbar', 'fixed': true, 'width': 65 },
          { 'propName': 'order', 'width': 140 },
          { 'propName': 'file', 'width': 893 }
        ],
        'colsOrder': [{ 'propName': 'file' }, { 'propName': 'order' }],
        'sorting': [{ 'propName': 'order', 'direction': 'desc' }]
      }
    },
    suggestionCommentsGroupEdit: {
      'DEFAULT': {
        'columnWidths': [{ 'propName': 'OlvRowToolbar', 'fixed': true, 'width': 65 }, { 'propName': 'votes', 'fixed': true }],
        'sorting': [
          { 'propName': 'votes', 'direction': 'asc' },
          { 'propName': 'moderated', 'direction': 'desc' },
          { 'propName': 'text', 'direction': 'asc' }
        ],
      }
    }
  },
  /**
    Flag: indicates whether current browser is internet explorer.

    @property browserIsInternetExplorer
    @type Boolean
  */
  browserIsInternetExplorer: Ember.computed(function() {
    let userAgent = window.navigator.userAgent;

    return userAgent.indexOf('MSIE ') > 0 || userAgent.indexOf('Trident/') > 0 || userAgent.indexOf('Edge/') > 0;
  }),

  /**
    Locales supported by application.

    @property locales
    @type String[]
    @default ['ru', 'en']
  */
  locales: ['ru', 'en'],

  /**
    Initializes controller.
  */
  init() {
    this._super(...arguments);

    let i18n = this.get('i18n');
    if (Ember.isNone(i18n)) {
      return;
    }

    // If i18n.locale is long value like 'ru-RU', 'en-GB', ... this code will return short variant 'ru', 'en', etc.
    let shortCurrentLocale = this.get('i18n.locale').split('-')[0];
    let availableLocales = Ember.A(this.get('locales'));

    // Force current locale to be one of available,
    // if browser's current language is not supported by dummy application,
    // or if browser's current locale is long value like 'ru-RU', 'en-GB', etc.
    if (!availableLocales.contains(shortCurrentLocale)) {
      i18n.set('locale', 'en');
    } else {
      i18n.set('locale', shortCurrentLocale);
    }
  },


});
