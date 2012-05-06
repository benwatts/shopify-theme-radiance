/** 
 * Radiance Theme JS
 *
 * Dependencies: 
 * - hoverintent.jquery.js
 *
 */



/** 
 * Look under your chair! console.log FOR EVERYONE! 
 *
 * @see http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
 */
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());




/** 
 * Fire function based upon attributes on the body tag. 
 * This is the reason for "template{{ template | camelize }}" in layout/theme.liquid
 *
 * @see http://paulirish.com/2009/markup-based-unobtrusive-comprehensive-dom-ready-execution/
 */
var UTIL = {
 
  fire : function(func,funcname, args){
    var namespace = RADIANCE; 
    funcname = (funcname === undefined) ? 'init' : funcname;
    if (func !== '' && namespace[func] && typeof namespace[func][funcname] == 'function'){
      namespace[func][funcname](args);
    } 
  }, 
 
  loadEvents : function(){
    var bodyId = document.body.id;

    // hit up common first.
    UTIL.fire('common');
 
    // do all the classes too.
    $.each(document.body.className.split(/\s+/),function(i,classnm){
      UTIL.fire(classnm);
      UTIL.fire(classnm,bodyId);
    });
  } 
 
}; 
$(document).ready(UTIL.loadEvents);



/** 
 * Page-specific call-backs 
 * Called after dom has loaded.  
 */
var RADIANCE = {

  common : {
    init: function(){
      console.info(' > DOM Ready > Init');
      $('html').removeClass('no-js').addClass('js');
      setupDropdownMenus(); 
      searchPlaceholder();

      $('.nav-arrow', '#top-menu').each( function(){
        $(this).css('top', Math.ceil($(this).parent(2).height()/2) + 1);
      });

    }
  },

  templateIndex : {
    init: function(){
      console.info(' > Index Template');
      if( $("#carousel").length > 0 ){  
        $("#carousel").scrollable({
          circular: true
        });

        if ( $("#carousel").find('.items li[class!=cloned]').length > 1 ) {
          window.api = $("#carousel").autoscroll({
            autoplay: true,
            api: true,
            interval: 7500
          })
          $("#carousel").hover(
              function() { 
                api.pause(); 
                $(this).find('.browse').fadeIn('fast');
              },
              function() { 
                api.play(); 
                $(this).find('.browse').fadeOut('fast');
              }
          );
        }

        $('#carousel-thumbs li:first a').addClass('active');
      }      
    }
  },
  
  templateProduct : { 
    init: function(){
      console.info(' > Product Template');
      $('#add-to-cart').bind( 'click', addToCart );
      $('#product-gallery.zoom-in').enhanceGallery();
      $('#thumbs li:nth-child(5n+5)').addClass('last-in-row');
    }
  }, 

  templateCart : {
    init: function(){
      console.info(' > Cart Template > Init');
      $('#toggle-note').toggle(
        function(){ $('#checkout-addnote').find('textarea').show(); }, 
        function(){ $('#checkout-addnote').find('textarea').hide();  }      
      );
          
    }
  }

}
 


/** 
 * Balances the height of rows of products/collections. 
 * Finds the tallest item in a row, makes each <li> in that row as tall as the tallest. 
 */
$.fn.balanceRowHeight = function(numPerRow) {  
  var nPerRow = numPerRow || 4; 
  var nItems = $(this).find('li').length;
  var nRows = Math.round( nItems / nPerRow );

  for( var row = 1; row <= nRows; row++ ){
    var min = row * nPerRow - nPerRow;
    var max = row * nPerRow;
    var tallestInRow = 0;
    var tallestTitleInRow = 0;

    $(this).find('li').slice(min, max).each(function(){
      if( $(this).height() > tallestInRow ){
        tallestInRow = $(this).height();     
      }
      if( $(this).find('.product-information:first').height() > tallestTitleInRow ){
        tallestTitleInRow = $(this).find('.product-information').height();
      }
    }).height(tallestInRow).addClass('generated-height').find('.product-information').height(tallestTitleInRow);
  }

  return this;
};

/** 
 * Balance product grid height after all images have loaded. 
 */
$(window).load( function(){
  if( $('body').hasClass('templateIndex') ){ 
    // homepage has two grids, needs a bit of special treatment:
    $('#featured-grid').balanceRowHeight(3);
    $('#secondary-grid').balanceRowHeight(4);
    $('#collection-grid').balanceRowHeight(4);
  } else {
    $('.product-grid').balanceRowHeight(4);
  }
});



/** 
 * Support for dropdown menus 
 */
function setupDropdownMenus(){
  $('#top-menu .has-dropdown').hoverIntent( navRollOver, navRollOut );
  
  function navRollOver(e){
    $(this).addClass('active').find('ul:first').css('top', $(this).height()).show();
  }
  function navRollOut(e){
    $(this).removeClass('active').find('ul:first').hide();
  }

}



/** 
 * Ajaxy add-to-cart 
 */
function addToCart(e){

  if (typeof e !== 'undefined') e.preventDefault();
  
  var id        = $(this).parents('form').find('[name="id"]').val();
  var quantity  = $(this).parents('form').find('[name="quantity"]').val() || 1;

  $.ajax({ 
    type: 'POST',
    url: '/cart/add.js',
    async: false, 
    cache: false, 
    data: 'quantity=' + quantity + '&id=' + id,
    dataType: 'json',
    error: addToCartFail,
    success: addToCartSuccess,
    cache: false 
  });
  
}
  
function addToCartSuccess (jqXHR, textStatus, errorThrown){

  $.ajax({ 
    type: 'GET',
    url: '/cart.js',
    async: false, 
    cache: false, 
    dataType: 'json',
    success: updateCartDesc  
  });         
  $('#add-to-cart-msg').hide().addClass('success').html('Item added to cart! <a href="/cart" title="view cart">View cart and check out &raquo;</a>').fadeIn();   
}

function addToCartFail(jqXHR, textStatus, errorThrown){
  var response = $.parseJSON(jqXHR.responseText);
  console.error('PROBLEM ADDING TO CART!', response.description);  
  $('#add-to-cart-msg').addClass('error').text(response.description);
}

function updateCartDesc(data){
  var $cartLinkText = $('.cart-link .icon:first');
  
  switch(data.item_count){
    case 0: 
      $cartLinkText.text('0 items');
      break;
    case 1:
      $cartLinkText.text('1 item');
      break;
    default:
      $cartLinkText.text(data.item_count+' items');
      break;
  }
}



/** 
 * Enable placeholder switcheroo in older browsers. 
 * @see http://webdesignerwall.com/tutorials/cross-browser-html5-placeholder-text  
 */
function searchPlaceholder(){

  if(!Modernizr.input.placeholder){
    $('#top-search-input').focus(function() {
      var input = $(this);
      if (input.val() == input.attr('placeholder')) {
      input.val('');
      input.removeClass('placeholder');
      }
    }).blur(function() {
      var input = $(this);
      if (input.val() == '' || input.val() == input.attr('placeholder')) {
      input.addClass('placeholder');
      input.val(input.attr('placeholder'));
      }
    }).blur();
    $('[placeholder]').parents('form').submit(function() {
      $(this).find('[placeholder]').each(function() {
      var input = $(this);
      if (input.val() == input.attr('placeholder')) {
        input.val('');
      }
      })
    });
  }

}
