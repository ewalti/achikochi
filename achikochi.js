/**
 * Achikochi
 * Native HTML5 drag and drop functionality
 * Author: Eric Walti <ewalti@gmail.com>
 * @TODO: add mobile touch support and refactor
 */
;(function($) {

  var pluginName = 'achikochi';

  /**
   * Plugin object constructor.
   * Implements the Revealing Module Pattern.
   */
  function Plugin(element, options) {
    // References to DOM and jQuery versions of element.
    var el = element;
    var $el = $(element);

    // Extend default options with those supplied by user.
    options = $.extend({}, $.fn[pluginName].defaults, options);

    var draggingEl;

    function log(message) {
      if(options.debug) console.log(message);
    }

    /**
     * Initialize plugin.
     */
    function init() {

      $el.children(options.childSelector).each(function(){
        initializeElement($(this));
      });

      hook('onInit');

    }

    function update() {
      $el.children(options.childSelector + ':not(.initialized)').each(function(){
        initializeElement($(this));
      });
    }

    function handleDragStart(event) {
      log('handleDragStart');
      if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'moving';
          event.dataTransfer.setData('Text', "*");
      }
      draggingEl = $(this);
      draggingEl.addClass('dragging');
      hook('onDragStart');
    }

    function dragData(element, val) {

      log('dragData');

      if (arguments.length == 1) {
        log('dragData length 1');
          return parseInt(element.getAttribute("data-child-dragenter"), 10) || 0;
      }
      else if (!val) {
        log('dragData no val supplied');
          element.removeAttribute("data-child-dragenter");
      }
      else {
        log('setting dragData');
          element.setAttribute("data-child-dragenter", Math.max(0, val));
      }
    }

    function moveElementNextTo(element, elementToMoveNextTo) {
      log('moveElementNextTo', element, elementToMoveNextTo);
        if (isBelow(element, elementToMoveNextTo)) {
            // Insert element before to elementToMoveNextTo.
            elementToMoveNextTo.parentNode.insertBefore(element, elementToMoveNextTo);
        }
        else {
            // Insert element after to elementToMoveNextTo.
            elementToMoveNextTo.parentNode.insertBefore(element, elementToMoveNextTo.nextSibling);
        }
    }

    function isBelow(el1, el2) {
        var parent = el1.parentNode;
        if (el2.parentNode != parent) {
            return false;
        }

        var cur = el1.previousSibling;
        while (cur && cur.nodeType !== 9) {
            if (cur === el2) {
                return true;
            }
            cur = cur.previousSibling;
        }
        return false;
    }

    function handleDragEnter() {
      log('handleDragEnter');

      if(!draggingEl || draggingEl === $(this)) return true;

      var previousCounter = dragData(this);
      dragData(this, previousCounter + 1);

      if(previousCounter === 0) {
        $(this).addClass('over');
        moveElementNextTo(this, draggingEl[0]);
      }
      return false;
    }

    function handleDragLeave() {
      log('handleDragLeave');
      var previousCounter = dragData(this);
      dragData(this, previousCounter - 1);
    }

    function handleDrop(event) {
      log('handleDrop');
      if (event.type === 'drop') {
        log('drop');
        event.stopPropagation();
        event.preventDefault();
      }
    }

    function handleDragOver(event) {
      log('handleDragOver');
      if (!draggingEl) return true;
      event.preventDefault();
      return false;
    }

    function handleDragEnd() {
      log('handleDragEnd');
      currentlyDraggingElement = null;
      currentlyDraggingTarget = null;
      $el.children(options.childSelector).each(function(){
        dragData(this, false);
        $(this).removeClass('dragging over');
      });
      hook('onDragComplete');
    }

    function initializeElement(el) {
      log('init element');
      el.attr('draggable', true);
      el.addClass('initialized');
      el.on('dragstart', handleDragStart);
      el.on('dragenter', handleDragEnter);
      el.on('dragleave', handleDragLeave);
      el.on('drop', handleDrop);
      el.on('dragover', handleDragOver);
      el.on('dragend', handleDragEnd);
    }

    function deactivateElement(el) {
      log('deactivating element');
      el.removeAttr('draggable');
      el.removeClass('initialized');
      el.unbind('dragstart', handleDragStart);
      el.unbind('dragenter', handleDragEnter);
      el.unbind('dragleave', handleDragLeave);
      el.unbind('drop', handleDrop);
      el.unbind('dragover', handleDragOver);
      el.unbind('dragend', handleDragEnd);
    }

    /**
     * Get/set a plugin option.
     * Get usage: $('#el').demoplugin('option', 'key');
     * Set usage: $('#el').demoplugin('option', 'key', value);
     */
    function option (key, val) {
      if (val) {
        options[key] = val;
      } else {
        return options[key];
      }
    }

    /**
     * Destroy plugin.
     * Usage: $('#el').demoplugin('destroy');
     */
    function destroy() {
      log('destroying');
      // Iterate over each matching element.
      $el.each(function() {

        var el = this;
        var $el = $(this);

        // remove click bindings and classes
        $el.children(options.childSelector).each(function(){
          deactivateElement($(this));
        });

        hook('onDestroy');
        // Remove Plugin instance from the element.
        $el.removeData(pluginName);
      });
    }

    /**
     * Callback hooks.
     * Usage: In the defaults object specify a callback function:
     * hookName: function() {}
     * Then somewhere in the plugin trigger the callback:
     * hook('hookName');
     */
    function hook(hookName) {
      if (options[hookName] !== undefined) {
        // Call the user defined function.
        // Scope is set to the jQuery element we are operating on.
        options[hookName].call(el);
      }
    }

    // Initialize the plugin instance.
    init();

    // Expose methods
    return {
      option: option,
      destroy: destroy,
      update: update,
    };
  }

  /**
   * Plugin definition.
   */
  $.fn[pluginName] = function(options) {
    // If the first parameter is a string, treat this as a call to
    // a public method.
    if (typeof arguments[0] === 'string') {
      var methodName = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      var returnVal;
      this.each(function() {
        // Check that the element has a plugin instance, and that
        // the requested public method exists.
        if ($.data(this, pluginName) && typeof $.data(this, pluginName)[methodName] === 'function') {
          // Call the method of the Plugin instance, and Pass it
          // the supplied arguments.
          returnVal = $.data(this, pluginName)[methodName].apply(this, args);
        } else {
          throw new Error('Method ' +  methodName + ' does not exist on jQuery.' + pluginName);
        }
      });
      if (returnVal !== undefined){
        // If the method returned a value, return the value.
        return returnVal;
      } else {
        // Otherwise, returning 'this' preserves chainability.
        return this;
      }
    // If the first parameter is an object (options), or was omitted,
    // instantiate a new instance of the plugin.
    } else if (typeof options === "object" || !options) {
      return this.each(function() {
        // Only allow the plugin to be instantiated once.
        if (!$.data(this, pluginName)) {
          // Pass options to Plugin constructor, and store Plugin
          // instance in the elements jQuery data object.
          $.data(this, pluginName, new Plugin(this, options));
        }
      });
    }
  };

  // Default plugin options.
  // Options can be overwritten when initializing plugin, by
  // passing an object literal, or after initialization:
  // $('#el').demoplugin('option', 'key', value);
  $.fn[pluginName].defaults = {
    debug: false,
    childSelector: '',
    onInit: function() {},
    onDragStart: function() {},
    onDragComplete: function() {},
    onDestroy: function() {}
  };

})(jQuery);