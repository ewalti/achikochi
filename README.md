
Native HTML5 Drag and Drop API jQuery plugin for sortable items.

## Forward

This is a plug-in based on [bgrin's](https://github.com/bgrins/ "Github user: bgrins")
[nativesortable](https://github.com/bgrins/nativesortable "nativesortable") native HTML5 drag and drop plugin.

I wrapped it as a jQuery plugin and extended it to have an exposed API (revealing module pattern) and callback hooks.

It is very much a work in progress.

## Usage

**Instantiation:**

    $('.list').achikochi();

**Check for existence:**

  $('.list').data('achikochi');

**Options:** (defaults)

    var options = {
      debug: false, // log drag events(?)
      childSelector: '', // target only specific children of the container to drag
      onInit: function() {}, // init callback
      onDragStart: function() {}, // dragStart callback
      onDragComplete: function() {}, // dragComplete callback
      onDestroy: function() {} // destroy plugin callback
    }

Alternatively, options can be set singularly after instantiation via:

    $('#el').demoplugin('option', 'key', value);

**Updating**: (useful if you are adding elements to the container and want the added elements to function properly)

    $('.list').achikochi('update');


**Destroying:**

  $('.list').achikochi('destroy');


## Dependencies

* &gt; jQuery v1.7.1

## TODO:

Add mobile touch functionality and refacto