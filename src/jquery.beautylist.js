/*global window,document,jQuery */

/*!
 * Beautylist: a jQuery Plugin
 * @author: Antti Salminen (@antti_s)
 * @url: https://github.com/anttis/beautylist
 * @published: 03/01/2012
 * @updated: 03/01/2012
 * @license MIT
 */

 if (typeof jQuery != 'undefined') {
  jQuery(function($) {
    $.fn.extend({
      beautyList:function(options) {
        return this.each(function() {
          var elem = $(this)
          var beautyList = new BeautyList(elem, options)
          elem.data('beautyList', beautyList)
        })
      }
    })


    var supportsPlaceholder = 'placeholder' in document.createElement('input');

    function BeautyList(element, options) {

      var originalInput
      var input
      var list
      var pluginSettings
      var inputValues
      var self
      var separator
      var container
      var ruler
      var keycodes = {
        ENTER: 13,
        BACKSPACE: 8,
        TAB: 9,
        SPACE: 32,
        ARROW_LEFT: 37,
        ARROW_RIGHT: 39,
        ARROW_UP: 38,
        ARROW_DOWN: 40,
        ESC: 27,
        DELETE: 46
      }

      var defaults = {
        separator: /(?:,|\s|;)/g,
        placeholderText: undefined,
        inPlaceEdit: false,
        dynamicInputSizing: false,
        saveOnSpace: true,
        allowDuplicates: false,
        validators: []
      }
      var settings = $.extend({}, defaults, options)

      self = this

      this.init = function(element, settings) {

        originalInput = element
        pluginSettings = settings
        separator = pluginSettings.separator
        pluginSettings.validators.push(function(value){ return !value.match(separator) })

        inputValues = []
        this.createElements()
        this.bindEvents()

        if(pluginSettings.placeholderText && pluginSettings.dynamicInputSizing) {
          throw new Error('Can not use options "placeholderText" and "dynamicInputSizing" at the same time.')
        }
        if(pluginSettings.placeholderText && !supportsPlaceholder) { self.polyfillPlaceholder() }
        if(pluginSettings.dynamicInputSizing) {
          this.initInputResizing()
          this.resizeInput()
        }
        if(pluginSettings.inPlaceEdit) { this.initInPlaceEdit() }
        if($.trim(originalInput.val()) !== '') { this.preFillItems() }

        return this
      }

      this.createElements = function() {
        container = $('<div class="beautylist"><ul><li class="beautylist-input-container"><input class="beautylist-input" type="text" /></li></ul></div>')
        input = container.find('input')
        list = container.find('ul')

        originalInput
          .hide()
          .after(container)

        if(pluginSettings.placeholderText) { input.attr('placeholder', pluginSettings.placeholderText) }

        this.createRuler()
      }

      this.bindEvents = function() {
        originalInput.bind('beautylist-reset', self.reset)

        input
          .bind('keyup paste', self.parseItem)
          .bind('blur', self.addItem)
          .bind('keydown', self.handleKeyEvent)

        container.bind('click', function(event) {
          var target = $(event.target)
          if(target.is('ul') || target.is('div')) { input.focus() }
        })

        self.bindListEvents()
      }

      this.handleKeyEvent = function(event) {
        switch (event.which) {
          case keycodes.SPACE:{
            if(!settings.saveOnSpace) { break; }
          }
          case keycodes.ENTER:
          case keycodes.TAB: {
            event.preventDefault()
            self.addItem()
            break
          }
          case keycodes.BACKSPACE:
          case keycodes.ARROW_LEFT: {
            if (!input.val()) {
              event.preventDefault()
              event.stopPropagation()
              self.focusToLastElement()
            }
            break
          }
          default: {
            break
          }
        }
      }

      this.bindListEvents = function() {
        var focusToItem

        list
          .on('click', 'a', function(event) {
            event.preventDefault()
            $(this.focus())
          })
          .on('click', '.beautylist-delete-item', function(event) { self.removeItem($(this).closest('li')) })
          .on('keydown', '.beautylist-item a:focus', function(event) {
            var element = $(this)
            switch (event.which) {
              case keycodes.BACKSPACE:
              case keycodes.DELETE: {
                var nextItem = self.getNextItem(element)
                event.preventDefault()
                event.stopPropagation()
                self.removeItem(element.closest('.beautylist-item'), function() { nextItem.focus() })
                break
              }
              case keycodes.ARROW_LEFT:
              case keycodes.ARROW_UP:
              case keycodes.ARROW_RIGHT:
              case keycodes.ARROW_DOWN: {
                focusToItem = (event.which === keycodes.ARROW_UP || event.which === keycodes.ARROW_LEFT)
                  ? self.getPreviousItem(element)
                  : self.getNextItem(element)
                focusToItem.focus()
                event.preventDefault()
                break
              }
            }
          })
      }

      this.focusToLastElement = function() {
        if(list.find('.beautylist-item:last a').length) { list.find('.beautylist-item:last a').focus() }
      }

      this.getPreviousItem = function(item) {
        if (list.find('.beautylist-item').length < 2) { return input }
        return item.parent().prev('.beautylist-item').find('a')
      }

      this.getNextItem = function(item) {
        if (!item.parent().next('.beautylist-item').length) { return input }
        return item.parent().next('.beautylist-item').find('a')
      }

      this.parseItem = function() {
        var inputtedValue = input.val()
        if (inputtedValue.match(separator)) { self.addItemsToList(inputtedValue) }
      }

      this.addItem = function() {
        var inputtedValue = input.val()
        if (inputtedValue !== '') { self.addItemsToList(inputtedValue) }
      }

      this.preFillItems = function() {
        var inputtedValue = originalInput.val()
        if (inputtedValue.match(separator)) { self.addItemsToList(inputtedValue) }
      }

      this.addItemsToList = function(inputtedValue) {
        input.val('')

        var splat = $.grep(inputtedValue.split(separator), function(str) {
          return str !== ''
        })
        $.each(splat, function(i, val) {
          var newListItem = $('<li class="beautylist-item"><a href="#"><span>' + val + '</span><button class="beautylist-delete-item"></button></a></li>').data('beautylist-value', val)
          list.find('li:last').before(newListItem)
        })

        this.updateOriginalInput()
        this.toggleValidClasses()
      }

      this.toggleValidClasses = function() {
        list
          .find('.beautylist-item')
          .each(function(i, e) {
            var element = $(e)
            element.toggleClass('invalid', !self.validate(itemValue(element)))
          })
      }

      this.validate = function(value) {
        var valid = true

        if(!pluginSettings.allowDuplicates) valid = $.grep(inputValues, function(v) { return v === value }).length <= 1
        if(pluginSettings.validators) {
          $.each(pluginSettings.validators, function(i, validator) {
            valid = valid && validator.apply(self, [value])
          })
        }
        return  !!valid
      }

      this.updateOriginalInput = function() {
        inputValues = []

        list
          .find('.beautylist-item')
          .each(function(i, e) { inputValues.push(itemValue($(e))) })

        originalInput
          .val($.trim(inputValues.join(' ')))
          .trigger('change')
      }

      this.removeItem = function(item, callback) {
        item.fadeOut(125, function() {
          $(this).remove()
          self.updateOriginalInput()
          self.toggleValidClasses()
          if (callback) callback()
        })
      }

      this.initInPlaceEdit = function() {
        list.off('click', 'a')
        list.on('click', 'a', function(event) {
          event.preventDefault()
          self.toggleEditmode($(this).closest('.beautylist-item'))
        })
      }

      this.toggleEditmode = function(listItem) {
        var oldValue = itemValue(listItem)
        var inPlaceEdit = $('<input type="text" class="beautylist-in-place-edit"/>')

        listItem.find('span').css('visibility', 'hidden')

        $(document).on('keyup.beautylist', function(event) { if (event.which === keycodes.ESC) {
            self.abortInPlaceEditOnEsc(listItem, oldValue)
          }
        })

        inPlaceEdit
          .val(itemValue(listItem))
          .css('max-width', listItem.closest('.beautylist').width())
          .bind('blur', function() {
            var editValue = inPlaceEdit.val()
            if (editValue === '') {
              $(document).off('keyup.beautylist')
              self.removeItem($(this).closest('li'))
            } else {
              itemValue(listItem, editValue)
              listItem.find('span').text(editValue).css('visibility', 'visible')
              inPlaceEdit.remove()
              self.updateOriginalInput()
              self.toggleValidClasses()
            }
          })
          .bind('keyup keydown', function(event) {
            listItem.find('span').text(inPlaceEdit.val())
          })
          .prependTo(listItem)
          .focus()
      }

      this.abortInPlaceEditOnEsc = function(listItem, oldValue) {
        itemValue(listItem, oldValue)
        listItem.find('span').text(oldValue).css('visibility', 'visible')
        listItem.find('input').remove()
        $(document).off('keyup.beautylist')
      }

      this.reset = function() {
        originalInput.val('').trigger('change')
        list.find('.beautylist-item').remove()
        inputValues = []
      }

      this.initInputResizing = function() {
        input
          .css('width', '100%')
          .parent().css('width', '100%')
          .bind('keyup keydown', function(){
            ruler.text(input.val())
            self.resizeInput()
          })
        input.bind('blur', function() {
          ruler.text(settings.placeholderText ? settings.placeholderText : '')
          self.resizeInput()
        })
      }

      this.resizeInput = function(event) {
        var rulerWidth = ruler.outerWidth()

        input.css('width', rulerWidth)
        input.parent().css('width', rulerWidth)
      }

      // create a foobar element that is used to measure the necessary width to hold the text to resize the input
      this.createRuler = function() {
        ruler = $('<span class="beautylist-ruler"></span>')
        ruler.css({'position':'absolute', 'left':'-9999px', 'top':0})
        ruler.appendTo('body')
      }

      this.polyfillPlaceholder = function() {
        this.showPlaceholder()
        input
          .bind('blur', function(event) { self.showPlaceholder() })
          .bind('focus', function(event) { self.hidePlaceholder() })
      }
      this.showPlaceholder = function() { input.val(pluginSettings.placeholderText).addClass('beautylist-placeholder') }
      this.hidePlaceholder = function() { input.val('').removeClass('beautylist-placeholder') }

      return this.init(element, settings)
    }

    function itemValue(item, value) {
      return value ? item.data('beautylist-value', value) : item.data('beautylist-value')
    }

  }(jQuery))
}
