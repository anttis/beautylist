describe("Beautylist", function() {

  beforeEach(createBeautyList)
  afterEach(resetHtml)

  it("exposes an api", function() {
    expect(originalInput().data('beautyList')).toBeTruthy()
  })

  it("creates dom elements for tag list and input", function() {
    expect($('.beautylist-input').length).toEqual(1)
    expect($('.beautylist').length).toEqual(1)
  })

  describe("creates list elements", function() {

    it('does not create element when no comma entered', function() {
      beautyListInput().val('lol').trigger('keyup')
      expect(beautyListItems().length).toEqual(0)
      expect(originalInput().val()).toEqual('')
    })

    it('creates an element on blur', function() {
      beautyListInput().val('lol').trigger('blur')
      expect(beautyListItems().length).toEqual(1)
      expect($('.beautylist .beautylist-item:first').data('beautylist-value')).toEqual('lol')
      expect(originalInput().val()).toEqual('lol')
    })

    it('does not create an element on blur when no text entered', function() {
      beautyListInput().val('').trigger('blur')
      expect(beautyListItems().length).toEqual(0)
      expect(originalInput().val()).toEqual('')
    })

    it('creates multiple elements when string with commas entered', function() {
      beautyListInput().val('lol,bal,bar').trigger('keyup')
      expect(beautyListItems().length).toEqual(3)
      expect(originalInput().val()).toEqual('lol bal bar')
    })

    it('creates multiple elements when string with spaces entered', function() {
      beautyListInput().val('lol bal bar').trigger('keyup')
      expect(beautyListItems().length).toEqual(3)
      expect(originalInput().val()).toEqual('lol bal bar')
    })

    it('creates multiple elements when string with semicolons entered', function() {
      beautyListInput().val('lol;bal; bar').trigger('keyup')
      expect(beautyListItems().length).toEqual(3)
      expect(originalInput().val()).toEqual('lol bal bar')
    })
  })

  describe('deleting list elements', function(){
    beforeEach(function() {
      beautyListInput().val('lol,bal,bar').trigger('keyup')
    })

    it('deletes an item when clicked on delete icon', function() {
      beautyListItems().eq(0).find('.beautylist-delete-item').trigger('click')

      waitsFor(function() { return beautyListItems().length === 2 }, 500)
      runs(function() {
        expect(beautyListItems().length).toEqual(2)
        expect(originalInput().val()).toEqual('bal bar')
      })
    })

    it('does not delete an item when pressing backspace on input with text', function() {
      beautyListInput().val('lol').trigger({type: 'keydown', which : 8 })

      waitsFor(function() { return beautyListItems().length === 3 }, 500)
      runs(function() {
        expect(beautyListItems().length).toEqual(3)
        expect(originalInput().val()).toEqual('lol bal bar')
      })
    })

    it('deletes a focused item on backspace', function() {
      beautyListInput().val('').trigger({type: 'keydown', which : 8 })
      beautyListItems().last().find('a:focus').trigger({type: 'keydown', which : 8 })
      waitsFor(function() { return beautyListItems().length === 2 }, 500)
      runs(function() {
        expect(beautyListItems().length).toEqual(2)
        expect(originalInput().val()).toEqual('lol bal')
      })
    })
  })


  describe('keyboard events', function(){
    beforeEach(function() { beautyListInput().val('lol,bal,bar').trigger('keyup')})

    it('focuses on list element when backspacing on empty input', function() {
      beautyListInput().focus().val('').trigger({type: 'keydown', which : 8 })
      expect(beautyListItems().last().find('a:focus').length).toEqual(1)
    })

    it('moves to previous item when pressing left arrow', function() {
      beautyListInput().val('').trigger({type: 'keydown', which : 8 })
      beautyListItems().last().find(' a:focus').trigger({type: 'keydown', which : 37 })
      expect($('.beautylist-item').eq(1).find('a').is(':focus')).toBeTruthy()
    })

    it('moves to next item when pressing right arrow', function() {
      beautyListInput().val('').trigger({type: 'keydown', which : 8 })
      beautyListItems().last().find(' a')
        .trigger({type: 'keydown', which : 37 }) // move left
        .trigger({type: 'keydown', which : 37 }) // move left
        .trigger({type: 'keydown', which : 39 }) // ...and then right

      expect(beautyListItems().eq(1).find('a').is(':focus')).toBeTruthy()
    })
  })

  describe('in-place edit', function() {
    beforeEach(function() {
      beautyListInput().val('a').trigger({type: 'keydown', which : 13 })
      beautyListContainer().find('.beautylist-item a').trigger('click')
    })

    it('creates an in-place-edit when clicked', function() {
      expect($('.beautylist-item .beautylist-in-place-edit').length).toEqual(1)
    })

    it('changes the value', function() {
      $('.beautylist-item .beautylist-in-place-edit').val('bal').blur()
      var item = beautyListItems().eq(0)
      expect(item.data('beautylist-value')).toEqual('bal')
      expect(item.find('span').text()).toEqual('bal')
      expect(item.find('span:visible').length).toEqual(1)
      expect(item.find('.beautylist-in-place-edit').length).toEqual(0)
      expect(originalInput().val()).toEqual('bal')
    })

    it('marks the value as invalid after edit', function() {
      $('.beautylist-item .beautylist-in-place-edit').val('bal').blur()
      var item = beautyListItems().eq(0)
      expect(beautyListItems().data('beautylist-value')).toEqual('bal')
      expect(item.find('span').text()).toEqual('bal')
      expect(item.find('span:visible').length).toEqual(1)
      expect(item).toHaveClass('invalid')
      expect(originalInput().val()).toEqual('bal')
    })

    it('marks the value as invalid after adding separators', function() {
      $('.beautylist-item .beautylist-in-place-edit').val('bal lol').blur()
      var item = beautyListItems().eq(0)
      expect(beautyListItems().data('beautylist-value')).toEqual('bal lol')
      expect(item.find('span').text()).toEqual('bal lol')
      expect(item.find('span:visible').length).toEqual(1)
      expect(item).toHaveClass('invalid')
      expect(originalInput().val()).toEqual('bal lol')
    })

    it('does not delete the item when backspacing on empty in-place-edit', function() {
      $('.beautylist-item .beautylist-in-place-edit').val('').trigger({type: 'keydown', which : 8 })
      expect(beautyListItems().length).toEqual(1)
    })

    it('deletes the item blurring from empty in-place-edit', function() {
      $('.beautylist-item .beautylist-in-place-edit').val('').blur()
      waitsFor(function() { return beautyListItems().length === 0 }, 500)
      runs(function() { expect(beautyListItems().length).toEqual(0) })
    })
  })

  describe('keyboard events', function() {
    beforeEach(function() { beautyListInput().val('lol') })

    it('creates an item when pressing enter', function() {
      beautyListInput().trigger({type: 'keydown', which : 13 })
      expect(beautyListItems().length).toEqual(1)
    })
  })
})

describe("Beautylist with options", function() {

  afterEach(resetHtml)

  describe('using validators', function(){
    beforeEach(createBeautyList)

    it('does not add invalid class with valid input', function() {
      beautyListInput().val('a').trigger('blur')
      expect($('.beautylist .beautylist-item.invalid').length).toEqual(0)
    })
    it('adds invalid class with invalid input', function() {
      beautyListInput().val('b').trigger('blur')
      expect($('.beautylist .beautylist-item.invalid').length).toEqual(1)
    })
  })

  describe('using allowDuplicates:false', function(){
    beforeEach(function() { createBeautyList({allowDuplicates: false}) })

    it('does not add invalid class on items with different values', function() {
      beautyListInput().val('a b c').trigger('blur')
      expect($('.beautylist .beautylist-item.invalid').length).toEqual(0)
    })

    it('adds invalid class on items with same values', function() {
      beautyListInput().val('a a b').trigger('blur')
      expect(beautyListItems().eq(0)).toHaveClass('invalid')
      expect(beautyListItems().eq(1)).toHaveClass('invalid')
      expect(beautyListItems().eq(2)).not.toHaveClass('invalid')
    })
  })

  describe('using inPlaceEdit: false', function(){
    beforeEach(function() { createBeautyList({inPlaceEdit: false}) })

    it('does not add in-place edit when clicked on element', function() {
      beautyListInput().val('lol').trigger({type: 'keydown', which : 13 })
      beautyListContainer().find('.beautylist-item span').trigger('click')
      expect($('.beautylist-item .beautylist-in-place-edit').length).toEqual(0)
    })

    it('focuses on item when clicked', function() {
      beautyListInput().val('lol').trigger({type: 'keydown', which : 13 })
      beautyListContainer().find('.beautylist-item a').trigger('click')
      expect($('.beautylist-item .beautylist-in-place-edit').length).toEqual(0)
      expect($('.beautylist-item a:focus').length).toEqual(1)
    })
  })
})

describe('input behavior', function() {

  describe("Dynamically changing input size", function() {
    afterEach(function() { $('#wrapper, .beautylist').remove() })

    describe('using validators', function(){
      beforeEach(function() {  createBeautyList({dynamicInputSizing: true}) })
      // TODO: $(elem).css returns pixels, not percents
      xit('initally sets input width to 100%', function() {
        expect(blInput.css('width')).toEqual('400px')
        expect(blInput.parent().css('width')).toEqual('400px')
      })

      it('resizes on keydown', function() {
        beautyListInput().val('b').trigger('keydown')
        expect(beautyListInput().width()).toBeLessThan(400)
      })

      // TODO: pick a correct width... or something
      xit('resizes to auto on blur', function() {
        beautyListInput().val('').trigger('blur')
        expect(beautyListInput().css('width')).toEqual('auto')
      })
    })
  })
})

describe('with pre-existing values', function() {
  describe('with space as a separator', function() {
    beforeEach(function() {
      stubHtml()
      $('#element-1').val('foo bar baz')
      initBeautyList()
    })
    afterEach(resetHtml)

    it('creates elements', function() {
      expect(beautyListItems().length).toEqual(3)
      expect(beautyListItems().eq(0).data('beautylist-value')).toEqual('foo')
      expect(beautyListItems().eq(1).data('beautylist-value')).toEqual('bar')
      expect(beautyListItems().eq(2).data('beautylist-value')).toEqual('baz')
    })
  })

  describe('with comma as a separator', function() {
    beforeEach(function() {
      stubHtml()
      $('#element-1').val('foo,bar,baz')
      initBeautyList()
    })
    afterEach(resetHtml)

    it('creates elements and sets their beautylist-value data attributes', function() {
      expect(beautyListItems().length).toEqual(3)
      expect(beautyListItems().eq(0).data('beautylist-value')).toEqual('foo')
      expect(beautyListItems().eq(1).data('beautylist-value')).toEqual('bar')
      expect(beautyListItems().eq(2).data('beautylist-value')).toEqual('baz')
    })
  })
})

function createBeautyList(params) {
  stubHtml()
  initBeautyList(params)
}

function initBeautyList(params) {
  if(!params) params = { inPlaceEdit: true, validators: [ function(equalsA) { return equalsA === 'a'}] }
  $('#element-1').beautyList(params)
}
function stubHtml() {
  $('#test-area').append('<div id="wrapper" style="width:400px;"><input id="element-1" type="text" /></div>')
}
function resetHtml(){ $('#element-1, .beautylist').remove() }
function beautyListInput() { return $('.beautylist-input') }
function originalInput() { return $('#element-1') }
function beautyListContainer() { return $('.beautylist ul') }
function beautyListItems() { return $('.beautylist .beautylist-item') }