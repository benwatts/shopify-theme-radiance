/* After images have loaded */
$(window).load( function(){
	equalizeFeaturedProductHeights();		
	alignProductGridItems();		
	alignCollectionGridItems();		
});



/* After the dom is ready */
$(document).ready( function(){
	
	$('html').removeClass('no-js').addClass('js');
	
	/* Enable Fancybox thumbs during checkout */
	$("a.gallery").fancybox({
		'titlePosition'		: 'inside',
		'transitionIn'	:	'elastic',
		'transitionOut'	:	'elastic'
	});
	
	/* Hide/show note field in checkout form */
	$('#toggle-note').toggle(
		function(){ $('#checkout-addnote').find('textarea').show(); }, 
		function(){ $('#checkout-addnote').find('textarea').hide();  }			
	);
	
	setupFlexiNav();
	setupDropdownMenus();	
	
	
});	



/** 
 * Change position of nav if it's too wide to fit beside the logo, also: align it to the bottom of an imagey logo.
 * Unfortunately, this won't help IE6 or IE7 (they can't calculate the width of #top-menu properly) 
 * Feel free to remove this if you don't expect your nav to get too wide. 
 */
function setupFlexiNav(){
	if( $('#sitetitle').outerWidth() + $('#top-menu').outerWidth() > $('.wrapper').outerWidth() ){
		$('#top-menu').addClass('too-wide');
	} else {
		if( $('#sitetitle img').length > 0 ){
			var d = 100 - $('#top-menu').outerHeight();
			if( d > 0 ){
				$('#top-menu').css('padding-top', d+'px');
			}
		}		
	}
}



/** 
 * Support for dropdown menus 
 * Feel free to remove this if you don't want dropdown menus to show up (they're hidden with CSS by default, anyway).
 */
function setupDropdownMenus(){
	$('#top-menu .has-dropdown').hoverIntent( navRollOver, navRollOut );
	
	function navRollOver(e){
		$(this).find('ul:first').css('top', $(this).height()).show();
	}
	
	function navRollOut(e){
		$(this).find('ul:first').hide();
	}
}



/** 
 * Homepage - equal height for featured items 
 * Feel free to remove this if you will be using nearly-consistent dimensions for product imagery. 
 */
function equalizeFeaturedProductHeights(){
	var tallestFeaturedProd = 0;
	$('.products-grid-large li').each( function(){
		var currentItemsHeight = $(this).height();
		if( currentItemsHeight > tallestFeaturedProd ){
			tallestFeaturedProd = currentItemsHeight;
		}
	});
	
	$('.products-grid-large li').each( function(){
		if( $(this).height() < tallestFeaturedProd ){
			var d = tallestFeaturedProd - $(this).height();
			var newHeight = $(this).find('.product-information').height() + d;
			$(this).find('.product-information').css('height', newHeight + 'px');
		}
	});
}



/** 
 * Align the collections. 
 * Kind of gross and a little too similar equalizeFeaturedProductHeights() and alignProductGridItems(). Bleh. 
 * It's so close, yet so different because it's *not* a table, like the rest of the site.  
 */
function alignCollectionGridItems(){
	
	if( $('#collection-listing').length ){
		$('#collection-listing li:nth-child(4n+1)').addClass('row');
	
		$('#collection-listing .row').each( function(){
			var rowItems = $(this).nextUntil('.row').add($(this));
		
			var tallest = 0;		
			rowItems.each( function(){
				if( $(this).find('.product-grid-item').outerHeight() > tallest )
					tallest = $(this).outerHeight();		
			});
		
			rowItems.each( function(){
				var gridItem = $(this).find('.product-grid-item');
				if( gridItem.outerHeight() < tallest ){
					var d = tallest - gridItem.outerHeight();
					gridItem.css('paddingTop', d + 'px');	
				}
			});		
			
		});
	}
	
}



/** 
 * Product Grids - use padding to have .product-grid-items align to the bottom of a <tr>. 
 * Kind of gross and a little too similar equalizeFeaturedProductHeights(). Bleh. 
 * Feel free to remove this if you will be using nearly-consistent dimensions for product imagery. 
 */ 
function alignProductGridItems(){
	if( $('.products-grid').length ){
		
		$('.products-grid tr').each( function(){
		
			var tallestGridItem = 0;
			$(this).find('.product-grid-item').each( function(){
				$(this).css('paddingTop', 0);
				if( $(this).height() > tallestGridItem )
					tallestGridItem = $(this).height();
			});
		
			$(this).find('.product-grid-item').each( function(){
				if( $(this).height() < tallestGridItem ){
					var d = tallestGridItem - $(this).height();
					$(this).css('paddingTop', d + 'px');
				}
			});				
		
		});
		
	}
}
