'use strict';

function Scope() {
  this.$$watchers = [];
  this.$$lastDirtyWatch = null;
}

function initWatchVal() {}

Scope.prototype.$watch = function(watchFn, listenerFn, valueEq){
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn || function() {},//put an empty no-op function in its place
    valueEq: !!valueEq,
    last: initWatchVal //add init so digest awary have their listener functions invoked
                       //ex. value is undefined
                       //initWatchval just a value
  };
  this.$$watchers.push(watcher);
  this.$$lastDirtyWatch = null;
};

Scope.prototype.$$digestOnce = function(){
  var self = this;
  var newValue, oldValue, dirty;
  _.forEach(this.$$watchers, function(watcher){
    newValue = watcher.watchFn(self); //watchFn return new value
    oldValue = watcher.last;
    if (!self.$$areEqual(newValue, oldValue, watcher.valueEq)) {
      self.$$lastDirtyWatch = watcher;
      watcher.last = (watcher.valueEq ? _.cloneDeep(newValue) : newValue);
      watcher.listenerFn(newValue,
                         (oldValue === initWatchVal ? newValue : oldValue),
                         self); //when first changed shoudln't return initwatchval;
      dirty = true;
    } else if (self.$$lastDirtyWatch === watcher) {
      return false;
    }
  });
  return dirty;
};

Scope.prototype.$digest = function(){
  var ttl = 10;
  var dirty;
  this.$$lastDirtyWatch = null;
  do{
    dirty = this.$$digestOnce();
    if ( dirty && !(ttl--) ) {
      throw "10 digest iterations readched";
    }
  } while (dirty);
};

Scope.prototype.$$areEqual = function(newValue, oldValue, valueEq) {
  if ( valueEq ) {
    return _.isEqual(newValue, oldValue);
  } else {
    return newValue === oldValue ||
      (typeof newValue === 'number' && typeof oldValue === 'number'
       && isNaN(newValue) && isNaN(oldValue));
  }
};
