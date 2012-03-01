/*!
 * Beautylist: a jQuery Plugin
 * @author: Antti Salminen (anttis)
 * @url: lol
 * @published: 01/02/2012
 * @updated: 01/02/2012
 * @license MIT
 */
typeof jQuery!="undefined"&&jQuery(function(a){function c(c,e){var f,g,h,i,j,k,l,m,n,o={ENTER:13,BACKSPACE:8,TAB:9,SPACE:32,ARROW_LEFT:37,ARROW_RIGHT:39,ARROW_UP:38,ARROW_DOWN:40,ESC:27,DELETE:46},p={separator:/(?:,|\s|;)/g,placeholderText:undefined,inPlaceEdit:!1,dynamicInputSizing:!1,saveOnSpace:!0,allowDuplicates:!1,validators:[]},q=a.extend({},p,e);return k=this,this.init=function(c,d){f=c,i=d,l=i.separator,i.validators.push(function(a){return!a.match(l)}),j=[],this.createElements(),this.bindEvents();if(i.placeholderText&&i.dynamicInputSizing)throw Error('Can not use options "placeholderText" and "dynamicInputSizing" at the same time.');return i.placeholderText&&!b&&k.polyfillPlaceholder(),i.dynamicInputSizing&&this.initInputResizing(),i.inPlaceEdit&&this.initInPlaceEdit(),a.trim(f.val())!==""&&(this.preFillItems(),i.placeholderText||this.resizeInput()),this},this.createElements=function(){m=a('<div class="beautylist"><ul><li class="beautylist-input-container"><input class="beautylist-input" type="text" /></li></ul></div>'),g=m.find("input"),h=m.find("ul"),f.hide().after(m),i.placeholderText&&g.attr("placeholder",i.placeholderText),this.createRuler()},this.bindEvents=function(){f.bind("beautylist-reset",k.reset),g.bind("keyup paste",k.parseItem).bind("blur",k.addItem).bind("keydown",k.handleKeyEvent),m.bind("click",function(b){var c=a(b.target);(c.is("ul")||c.is("div"))&&g.focus()}),k.bindListEvents()},this.handleKeyEvent=function(a){switch(a.which){case o.SPACE:if(!q.saveOnSpace)break;case o.ENTER:case o.TAB:a.preventDefault(),k.addItem();break;case o.BACKSPACE:case o.ARROW_LEFT:g.val()||(a.preventDefault(),a.stopPropagation(),k.focusToLastElement());break;default:}},this.bindListEvents=function(){var b;h.on("click","a",function(b){b.preventDefault(),a(this.focus())}).on("click",".beautylist-delete-item",function(b){k.removeItem(a(this).closest("li"))}).on("keydown",".beautylist-item a:focus",function(c){var d=a(this);switch(c.which){case o.BACKSPACE:case o.DELETE:var e=k.getNextItem(d);c.preventDefault(),c.stopPropagation(),k.removeItem(d.closest(".beautylist-item"),function(){e.focus()});break;case o.ARROW_LEFT:case o.ARROW_UP:case o.ARROW_RIGHT:case o.ARROW_DOWN:b=c.which===o.ARROW_UP||c.which===o.ARROW_LEFT?k.getPreviousItem(d):k.getNextItem(d),b.focus(),c.preventDefault()}})},this.focusToLastElement=function(){h.find(".beautylist-item:last a").length&&h.find(".beautylist-item:last a").focus()},this.getPreviousItem=function(a){return h.find(".beautylist-item").length<2?g:a.parent().prev(".beautylist-item").find("a")},this.getNextItem=function(a){return a.parent().next(".beautylist-item").length?a.parent().next(".beautylist-item").find("a"):g},this.parseItem=function(){var a=g.val();a.match(l)&&k.addItemsToList(a)},this.addItem=function(){var a=g.val();a!==""&&k.addItemsToList(a)},this.preFillItems=function(){var a=f.val();a.match(l)&&k.addItemsToList(a)},this.addItemsToList=function(b){g.val("");var c=a.grep(b.split(l),function(a){return a!==""});a.each(c,function(b,c){var d=a('<li class="beautylist-item"><a href="#"><span>'+c+'</span><button class="beautylist-delete-item"></button></a></li>').data("beautylist-value",c);h.find("li:last").before(d)}),this.updateOriginalInput(),this.toggleValidClasses()},this.toggleValidClasses=function(){h.find(".beautylist-item").each(function(b,c){var e=a(c);e.toggleClass("invalid",!k.validate(d(e)))})},this.validate=function(b){var c=!0;return i.allowDuplicates||(c=a.grep(j,function(a){return a===b}).length<=1),i.validators&&a.each(i.validators,function(a,d){c=c&&d.apply(k,[b])}),!!c},this.updateOriginalInput=function(){j=[],h.find(".beautylist-item").each(function(b,c){j.push(d(a(c)))}),f.val(a.trim(j.join(" "))).trigger("change")},this.removeItem=function(b,c){b.fadeOut(125,function(){a(this).remove(),k.updateOriginalInput(),k.toggleValidClasses(),c&&c()})},this.initInPlaceEdit=function(){h.off("click","a"),h.on("click","a",function(b){b.preventDefault(),k.toggleEditmode(a(this).closest(".beautylist-item"))})},this.toggleEditmode=function(b){var c=d(b),e=a('<input type="text" class="beautylist-in-place-edit"/>');b.find("span").css("visibility","hidden"),a(document).on("keyup.beautylist",function(a){a.which===o.ESC&&k.abortInPlaceEditOnEsc(b,c)}),e.val(d(b)).css("max-width",b.closest(".beautylist").width()).bind("blur",function(){var c=e.val();c===""?(a(document).off("keyup.beautylist"),k.removeItem(a(this).closest("li"))):(d(b,c),b.find("span").text(c).css("visibility","visible"),e.remove(),k.updateOriginalInput(),k.toggleValidClasses())}).bind("keyup keydown",function(a){b.find("span").text(e.val())}).prependTo(b).focus()},this.abortInPlaceEditOnEsc=function(b,c){d(b,c),b.find("span").text(c).css("visibility","visible"),b.find("input").remove(),a(document).off("keyup.beautylist")},this.reset=function(){f.val("").trigger("change"),h.find(".beautylist-item").remove(),j=[]},this.initInputResizing=function(){var a=this;g.css("width","100%").parent().css("width","100%").bind("keyup keydown",function(){n.text(g.val()),a.resizeInput()}),g.bind("blur",function(){n.text(q.placeholderText?q.placeholderText:""),a.resizeInput()})},this.resizeInput=function(a){var b=n.outerWidth();g.css("width",b),g.parent().css("width",b)},this.createRuler=function(){n=a('<span class="beautylist-ruler"></span>'),n.css({position:"absolute",left:"-9999px",top:0}),n.appendTo("body")},this.polyfillPlaceholder=function(){this.showPlaceholder(),g.bind("blur",function(a){k.showPlaceholder()}).bind("focus",function(a){k.hidePlaceholder()})},this.showPlaceholder=function(){g.val(i.placeholderText).addClass("beautylist-placeholder")},this.hidePlaceholder=function(){g.val("").removeClass("beautylist-placeholder")},this.init(c,q)}function d(a,b){return b?a.data("beautylist-value",b):a.data("beautylist-value")}a.fn.extend({beautyList:function(b){return this.each(function(){var d=a(this),e=new c(d,b);d.data("beautyList",e)})}});var b="placeholder"in document.createElement("input")}(jQuery))