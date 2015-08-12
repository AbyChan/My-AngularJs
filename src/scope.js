'use strict';

function Scope() {
  this.$$watchers = [];
}

function initWatchVal() {}

Scope.prototype.$watch = function(watchFn, listenerFn){
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn || function() {},//put an empty no-op function in its place
    last: initWatchVal //add init so digest awary have their listener functions invoked
                       //ex. value is undefined
                       //initWatchval just a value
  };
  this.$$watchers.push(watcher);
};

Scope.prototype.$$digestOnce = function(){
  var self = this;
  var newValue, oldValue, dirty;
  _.forEach(this.$$watchers, function(watcher){
    newValue = watcher.watchFn(self); //watchFn return new value
    oldValue = watcher.last;
    if( newValue !== oldValue ) {
      watcher.last = newValue;
      watcher.listenerFn(newValue,
                         (oldValue === initWatchVal ? newValue : oldValue),
                         self); //when first changed shoudln't return initwatchval;
      dirty = true;
    }
  });
  return dirty;
};

Scope.prototype.$digest = function(){
  var ttl = 10;
  var dirty;
  do{
    dirty = this.$$digestOnce();
    if ( dirty && !(ttl--) ) {

    }

  } while (dirty);
};


