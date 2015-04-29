//import DS from 'ember-data';
import ApplicationSerializer from 'prototype-ember-cli-application/serializers/application';

// TODO? or override extractArray in ApplicationSerializer.
// (http://emberjs.com/api/data/classes/DS.RESTSerializer.html#method_extractArray)
export default ApplicationSerializer.extend(/*DS.EmbeddedRecordsMixin,*/ {
    /*attrs: {
        employee1: { embedded: 'always' },
        employees1: { serialize: 'ids', deserialize: 'records' }
    },*/

    // Раньше можно было определить primaryKey как функцию, и задать один алгоритм для всех сериализаторов.
    // Щас либо по отдельности для каждого задавать это свойство, либо переопределять функции,
    // в которых задействован primaryKey (нужно иметь ввиду, что Ember Data в бете).
    primaryKey: 'EmployeeID',

    normalizePayload: function(payload) {
        // TODO: refactor using extractSingle and extractArray.
        if (payload.value) {
            payload.employees = payload.value;
            delete payload.value;
        } else {
            payload = { employee: payload };
        }

        return payload;
    }
});
