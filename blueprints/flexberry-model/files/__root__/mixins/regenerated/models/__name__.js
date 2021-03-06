import Ember from 'ember';
import DS from 'ember-data';
<%if(projections) {%>import { Projection } from 'ember-flexberry-data';<%}%>
export let Model = Ember.Mixin.create({
<%= model %>
});<%if(parentModelName) {%>
export let defineBaseModel = function (modelClass) {
  modelClass.reopenClass({
    _parentModelName: '<%= parentModelName %>'
  });
};
<%}%>
<%if(projections) {%>export let defineProjections = function (modelClass) {<%}%><%= projections %><%if(projections) {%>};
<%}%>