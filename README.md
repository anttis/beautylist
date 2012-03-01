(former) Delicious-style tag/email input plugin
===============================================

Transforms a text input (or a textarea) into a nicer-looking input

Fills the original input with values, separated by spaces. Triggers a 'change' event on the original input whenever an item gets added or removed.

thx eeroan && tkareine

Requirements:
-------------

+ jQuery v.1.7+
+ underscore

Tested w/:
--------------

+ Chrome 17.0.963.56
+ Firefox 11
+ IE 7/8/9
+ Opera 11.61

Usage
-------

```javascript
$('#some-element').beautyList({
  // Regular expression used to split the input value into list items.
  // Default matches whitespace characters, commas and semicolons.
  separator: /(?:,|\s|;)/g,
  // Whether or not to dynamically change the width of the BeautyList input field
  dynamicInputSizing: true,
  // Whether or not to enable in-place-editing of list items
  inPlaceEdit: false,
  // Whether or not duplicate items should be marked as invalid
  allowDuplicates: false,
  // An array of functions to be used as validators.
  // Gets the inputted value as the parameter,
  // should return true/false depending on the validity of the value.
  validators: [],
  // Placeholder text for input.
  placeholderText: undefined
})
```

License
-------

MIT