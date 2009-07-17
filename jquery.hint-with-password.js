/**
* @author Remy Sharp, additions by nachokb
* @url http://remysharp.com/2007/01/25/jquery-tutorial-text-box-hints/
*/

(function ($) {

/* $d("....")
 *
 *  Easy access to jQuery's per-element data cache.
 *
 *  Examples
 *
 *    $d("#foo").age = 12
 *    $d("#foo").age //=> 12
 *    $d("#foo").age = $d("#foo").age + 1
 *
 *  Slightly adapted from http://yehudakatz.com/2009/04/20/evented-programming-with-jquery/ by Yehuda Katz.
 */
if (typeof($d) != "function") {
  $d = function(param) {
    var node = jQuery(param)[0];
    var id   = jQuery.data(node);

    jQuery.cache[id] || (jQuery.cache[id] = {});
    jQuery.cache[id].node = node;

    return jQuery.cache[id];
  }
}

$.fn.hint = function (blurClass) {
  if (!blurClass) { 
    blurClass = 'blur';
  }
    
  return this.each(function () {
    // get jQuery version of 'this'
    var $input = $(this),
    
    // capture the rest of the variable to allow for reuse
      title = $input.attr('title'),
      isPassword = $input.attr('type') == 'password',
      $form = $(this.form),
      $win = $(window);

    var strategies = {
      changeValue: {
        init: function() {},
        add: function() {
          if ($input.val() === '') {
            $input.addClass(blurClass)
              .val(title);
          }
        },
        remove: function() {
          if ($input.val() === title && $input.hasClass(blurClass)) {
            $input.val('')
              .removeClass(blurClass);
          }
        },
        submit: function() {
          this.remove();
        }
      },

      replaceElement: {
        init: function() {
          // create alternative text input element with title as value
          var $alt = $input.clone();
          $input.addClass("replaced-for-title");
          $alt.attr("id", null).attr("type", "text")
            .val(title)
            .insertBefore($input)
            .addClass("password-title")
            .addClass(blurClass)
            .hide()
            .focus(function() { // delegate to original
              $d($alt).original.focus();
            });
          $d($input).alternative = $alt;
          $d($alt).original = $input;
        },
        add: function() {
          if ($input.val() === '') {
            $input.hide();
            var id = $input.attr("id");
            $input.attr("id", null);
            $d($input).alternative.attr("id", id).show();
          }
        },
        remove: function() {
          if ($input.is(":hidden")) {
            var id = $d($input).alternative.attr("id");
            $d($input).alternative.attr("id", null).hide();
            $input.attr("id", id).show();
          }
        },
        submit: function() {
          $d($input).alternative.remove();
        }
      }
    }

    // only apply logic if the element has the attribute
    if (title) { 
      var strategyName = isPassword ? "replaceElement" : "changeValue";
      var strategy = strategies[strategyName];

      strategy.init();
      // on blur, set value to title attr if text is blank
      $input.blur(strategy.add)
        .focus(strategy.remove)
        .blur(); // now change all inputs to title

      // clear the pre-defined text when form is submitted
      $form.submit(strategy.submit);
      $win.unload(strategy.submit); // handles Firefox's autocomplete
    }
  });
};

})(jQuery);

