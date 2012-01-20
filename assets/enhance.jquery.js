/**
 * @see https://github.com/benwatts/enhance-gallery/
 */
 
(function($) {

  var cache = [];
  var settings = { 
        thumbListId : '#thumbs',
        activeWrapperId : '#active-wrapper',
        activeImageId : '#active-image',
        loadingLabel: 'Loading...'
      };
  var $thumbList, $activeWrapper, $loading;


  $.fn.enhanceGallery = function(options){

    if( options ){
      $.extend(settings, options);
    }

    if( this.length > 0 ){
      $thumbList = $(settings.thumbListId, this);
      $activeWrapper = $(settings.activeWrapperId, this);
      $loading = $('<div id="active-image-loading">'+settings.loadingLabel+'</div>');

      preloadImage( $thumbList.find('a:first').attr('href'), $thumbList.find('a:first img').attr('alt') ); // preload 1st image

      $thumbList.find('a').click( function(e){
        preloadImage( this.href, this.alt );
        e.preventDefault();
      });
    }

    return this;

  };


  function swap(image){
    var scale = $activeWrapper.width() / image.originalWidth,
        wrapperWidth  = $activeWrapper.width(),
        wrapperHeight = (image.originalWidth < wrapperWidth) ? image.originalHeight : ~~(image.originalHeight * scale);

    hideSpinner();

    // empty container, change container's width, append the <img>
    $activeWrapper.empty().height(wrapperHeight).append(image.tag);

    // enable the zoominess
    if( image.originalWidth > wrapperWidth ){
      $(settings.activeImageId).width(wrapperWidth).height(wrapperHeight).hover(
        function(){
          // zoom in 
          $(this).addClass('zoomed').width(image.originalWidth).height(image.originalHeight);
          $activeWrapper.mousemove( function(e){
            var localX = ~~(((e.pageX - $activeWrapper.offset().left)/wrapperWidth) * 100);
            var localY = ~~(((e.pageY - $activeWrapper.offset().top)/wrapperHeight) * 100);
            if( localY > 100 ){ localY = 100; }
            var fromLeft = (image.originalWidth - wrapperWidth) * localX/100;
            var fromTop  = (image.originalHeight - wrapperHeight) * localY/100;
            //console.log( fromLeft,' :: ', fromTop);
            $(settings.activeImageId).css('left', -fromLeft+'px').css('top', -fromTop+'px');
          });
        },
        function(){
          // zoom out
          $(this).removeClass('zoomed').width(wrapperWidth).height(wrapperHeight);
          $activeWrapper.unbind('mousemove');
        }
      );
    }
  }


  function preloadImage(url, alt){
    var alt = alt || "";
    var image = getCachedImage(url);
    if( image === false ){
      var cacheImage = document.createElement('img');
      cacheImage.id = 'active-image';
      cacheImage.onload = function(){
        imageLoaded(cacheImage, url);
      };
      cacheImage.src = url;
      cacheImage.alt = alt;
      showSpinner();
    } else {
      swap(image);
    }
  }


  function imageLoaded(img, url){
    var image = { 
      tag: img, 
      url: url, 
      originalWidth: img.width, 
      originalHeight: img.height 
    };
    cache.push(image);
    swap(image);
  }


  function showSpinner(){
    $activeWrapper.append($loading);
    var fromLeft = $activeWrapper.width()/2 - $loading.width()/2;
    var fromTop = $activeWrapper.height()/2 - $loading.height()/2;
    $loading.css('top', fromTop+'px').css('left', fromLeft +'px');
  }

  function hideSpinner(){
    $loading.remove();
  }


  function getCachedImage(url){
    for(var i=0; i < cache.length; i++ ){
      if( cache[i].url === url ){
        console.log('FOUND THE CACHED IMAGE')
        return cache[i];
      }
    }
    return false;
  }


})(jQuery);