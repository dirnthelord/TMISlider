/*
 * Too Many Images jQuery Slider plug-in v.1.3
 *  
 * Modified by Romesh Niriella
 * dirnthelord@gmail.com 
 *
 * Copyright 2013, Romesh Niriella
 * License: GNU General Public License, version 3 (GPL-3.0)
 * http://www.opensource.org/licenses/gpl-3.0.html
 *
 * Credits: 
 *  		Basic Slider (http://www.basic-slider.com) 
 *				- Authored by John Cobb (http://www.johncobb.name)
 * 			JPAGINATE: A FANCY JQUERY PAGINATION PLUGIN (http://tympanus.net/codrops/2009/11/17/jpaginate-a-fancy-jquery-pagination-plugin/)
 * 				- Authored by Cody (http://tympanus.net/codrops/author/cody/)
 */

;(function($) {

    "use strict";

    $.fn.tmiSlider = function(o) {
        
        // slider default settings
        var defaults        = {

            // w + h to enforce consistency
            width           : 600,
            height          : 344,

            // transition valuess
            animtype        : 'fade',
            animduration    : 450,      // length of transition
            animspeed       : 4000,     // delay between transitions
            automatic       : true,     // enable/disable automatic slide rotation

            // control and marker configuration
            showcontrols    : true,     // enable/disable next + previous UI elements
            centercontrols  : true,     // vertically center controls
            nexttext        : '<img src="images/next-slide-small.png" alt="Next"  />',   // text/html inside next UI element
            prevtext        : '<img src="images/prev-slide-small.png" alt="Prev"  />',   // text/html inside previous UI element
            showmarkers     : true,     // enable/disable individual slide UI markers
            centermarkers   : true,     // horizontally center markers

            // interaction values
            keyboardnav     : true,     // enable/disable keyboard navigation
            hoverpause      : true,     // enable/disable pause slides on hover

            // presentational options
            usecaptions     : false,     // enable/disable captions using img title attribute
            randomstart     : false,     // start from a random slide
            //responsive      : false,     // enable responsive behaviour
			
			// Pagination Plugin Bits and Bytes
			start 			: 1,
			display  		: 5,
			border					: true,
			rotate      			: true,
			images					: false,
			mouse					: 'slide',
			onChange				: function(){return false;} 
        };

        // create settings from defauls and user options
        var settings        = $.extend({}, defaults, o);

        // slider elements
        var $wrapper        = this,
            $slider         = $wrapper.find('ul.tmiSlider'),
            $slides         = $slider.children('li'),

            // control elements
            $c_wrapper      = null,
            $c_fwd          = null,
            $c_prev         = null,

            // marker elements
            $m_wrapper      = null,
            $m_markers      = null,

            // elements for slide animation
            $canvas         = null,
            $clone_first    = null,
            $clone_last     = null;

        // state management object
        var state           = {
            slidecount      : $slides.length,   // total number of slides
            animating       : false,            // bool: is transition is progress
            paused          : false,            // bool: is the slider paused
            currentslide    : 1,                // current slide being viewed (not 0 based)
            nextslide       : 0,                // slide to view next (not 0 based)
            currentindex    : 0,                // current slide being viewed (0 based)
            nextindex       : 0,                // slide to view next (0 based)
            interval        : null              // interval for automatic rotation
        };

        //var responsive      = {
        //    width           : null,
        //    height          : null,
        //    ratio           : null
        //};

        // helpful variables
        var vars            = {
            fwd             : 'forward',
            prev            : 'previous'
        };
            
		var selobj; // Selected page

		var log = function (i){ 
			$('#log').append("<span>"+i+"</span>&laquo;");
		}
		
        // run through options and initialise settings
        var init = function() {

            // differentiate slider li from content li
            $slides.addClass('tmi-slide');  
            
			conf_static(); 

            // configurations only avaliable if more than 1 slide
            if( state.slidecount > 1 ){

                // enable random start
                if (settings.randomstart){
                    conf_random();
                }

                // create and show controls
                if( settings.showcontrols ){
                    conf_controls();
                }

                // create and show markers
                if( settings.showmarkers ){
                    conf_markers();
                }

                // enable slidenumboard navigation
                if( settings.keyboardnav ){
                    conf_keynav();
                }

                // enable pause on hover
                if (settings.hoverpause && settings.automatic){
                    conf_hoverpause();
                }
  
            } else {
                // Stop automatic animation, because we only have one slide! 
                settings.automatic = false;
            }

            if(settings.usecaptions){
                conf_captions();
            }
 
            // slide components are hidden by default, show them now
            $slider.show();
            $slides.eq(state.currentindex).show();

            // Finally, if automatic is set to true, kick off the interval
            if(settings.automatic){
                state.interval = setInterval(function () {
                    go(vars.fwd, false);
                }, settings.animspeed);
            }

        };
 
        var resize_complete = (function () {
            
            var timers = {};
            
            return function (callback, ms, uniqueId) {
                if (!uniqueId) {
                    uniqueId = "Don't call this twice without a uniqueId";
                }
                if (timers[uniqueId]) {
                    clearTimeout (timers[uniqueId]);
                }
                timers[uniqueId] = setTimeout(callback, ms);
            };

        })();

        // enforce fixed sizing on slides, slider and wrapper
        var conf_static = function() {

            $slides.css({
                'height'    : settings.height,
                'width'     : settings.width
            });
            $slider.css({
                'height'    : settings.height,
                'width'     : settings.width
            });
            $wrapper.css({
                'height'    : settings.height,
                'width'     : settings.width,
                'position'  : 'relative'
            });

        };
 
        var conf_controls = function() {

            // create the elements for the controls
            $c_wrapper  = $('<ul class="tmiSlider-controls"></ul>');
            $c_fwd      = $('<li class="tmiSlider-next"><a href="#" data-direction="'+ vars.fwd +'">' + settings.nexttext + '</a></li>');
            $c_prev     = $('<li class="tmiSlider-prev"><a href="#" data-direction="'+ vars.prev +'">' + settings.prevtext + '</a></li>');

            // bind click events
            $c_wrapper.on('click','a',function(e){

                e.preventDefault();
                var direction = $(this).attr('data-direction');

                if(!state.animating){

                    if(direction === vars.fwd){
                        go(vars.fwd,false);
                    }

                    if(direction === vars.prev){
                        go(vars.prev,false);
                    }

                }

            });

            // put 'em all together
            $c_prev.appendTo($c_wrapper);
            $c_fwd.appendTo($c_wrapper);
            $c_wrapper.appendTo($wrapper);

            // vertically center the controls
            if (settings.centercontrols) {

                $c_wrapper.addClass('v-centered');

                // calculate offset % for vertical positioning
                var offset_px   = ($wrapper.height() - $c_fwd.children('a').outerHeight()) / 2,
                    ratio       = (offset_px / settings.height) * 100,
                    offset      = ratio + '%';

                $c_fwd.find('a').css('top', offset);
                $c_prev.find('a').css('top', offset);

            }

        };

        var conf_markers = function() {
			
			// Check for outliers
			if(settings.display > state.slidecount)
				settings.display = state.slidecount;
			
			// Prev/Next CSS classes
			if(settings.images){
				
				var previousclass 	= 'marker-prev-img';
				var nextclass 		= 'marker-next-img';
			}
			else{
				var previousclass 	= 'marker-prev';
				var nextclass 		= 'marker-next';
			}
			
			var outsidewidth_tmp = 0;
			var insidewidth 	 = 0;
			var bName = navigator.appName;
			var bVer = navigator.appVersion;
			
			if(bVer.indexOf('MSIE 7.0') > 0)
				var ver = "ie7";
		 
			/* First & Last markers */
			var _first		= $(document.createElement('a')).addClass('marker-first').html('First'); // 'First' link 
			var _last		= $(document.createElement('a')).addClass('marker-last').html('Last'); // 'Last' marker
			
			//var _prev		= $(document.createElement('span')).addClass('marker-scroll-prev').html('<'); // 'First' link 
			//var _next		= $(document.createElement('span')).addClass('marker-scroll-next').html('>'); // 'Last' marker
			
			// Create the '<< [Prev]' link
			if(settings.rotate){
				if(settings.images) var _rotleft	= $(document.createElement('span')).addClass(previousclass);
				else var _rotleft	= $(document.createElement('span')).addClass(previousclass).html('&laquo;');		
			 
				if(settings.images) var _rotright	= $(document.createElement('span')).addClass(nextclass);
				else var _rotright	= $(document.createElement('span')).addClass(nextclass).html('&raquo;');
			}
	 
			// Create the 'First' and '<< [Prev]' wrapper DIV
			var _divwrapleft	= $(document.createElement('div')).addClass('marker-control-prev');
				_divwrapleft.append(_first).append(_rotleft);
				 	 
			var _divwrapright	= $(document.createElement('div')).addClass('marker-control-next');
				_divwrapright.append(_rotright).append(_last);
			
			// Create the pagination list wrapper DIV
			var _ulwrapdiv	= $(document.createElement('div')).addClass('marker-wrapper'); 
			
			// create a wrapper for our markers
            $m_wrapper = $('<ol class="tmiSlider-markers"></ol>');
			
			var c = (settings.display - 1) / 2;
			var first = state.currentslide - c;
			 
			// for every slide, 
			//		- create a marker, 
			// 		- append to <ol class="tmiSlider-markers">{x}</ol>, 
			//		- apply classes.
			// Styles can be taken cared by seperate CSS
            $.each($slides, function(key, slide){

                var slidenum    = key + 1,
                    gotoslide   = key + 1;
                
                if(settings.animtype === 'slide'){
                    // + 2 to account for clones
                    gotoslide = key + 2;
                }
 
				// create the marker
                var marker = $('<li><a href="">'+ slidenum +'</a></li>');

                // set the first marker to be active
                if(slidenum === state.currentslide){  
					marker.addClass('current-marker');   
					selobj = marker;
					var span = '<span>' + slidenum +'</span>';
					marker.html(span);
				}

                // bind the click event
                marker.on('click','a',function(e){
                    e.preventDefault();
					 
                    if(!state.animating && state.currentslide !== gotoslide){
                        go(false,gotoslide); 
                    }
					 
					var left = (this.offsetLeft) / 2;
					var left2 = _ulwrapdiv.scrollLeft() + left;
					var tmp = left - (outsidewidth / 2);
					if(ver == 'ie7')
						_ulwrapdiv.animate({scrollLeft: left + tmp - _first.parent().width() + 52 + 'px'});	
					else
						_ulwrapdiv.animate({scrollLeft: left + tmp - _first.parent().width() + 'px'});	
					settings.onChange(this);	
                });

                // add the marker to the wrapper
                marker.appendTo($m_wrapper);

            });

			_ulwrapdiv.append($m_wrapper);
			
			// Create Pagination Wrapper
			var paginationWrapper = $('<div class="pagination-wrapper"></div>');
			var clear = $('<div class="clear"></div>');
				paginationWrapper.append(_divwrapleft).append(_ulwrapdiv).append(_divwrapright).append(clear);
				
			// append the pagination wrapper to main slider wrapper
			$wrapper.append(paginationWrapper);
			
            $m_markers = $m_wrapper.find('li');

            // center the markers
            if (settings.centermarkers) {
                $m_wrapper.addClass('h-centered');
                var offset = (settings.width - $m_wrapper.width()) / 2;
                $m_wrapper.css('left', offset);
            }
			
			//_ulwrapdiv.css('padding-left',_first.parent().width() + 5 +'px'); 	
			//_ulwrapdiv.css('padding-right',_last.parent().width() + 5 +'px'); 
			
			$m_markers.each(function(i,n){
				if(i == (settings.display-1)){
					outsidewidth_tmp = this.offsetLeft + this.offsetWidth ; 
				}
				insidewidth += (this.offsetWidth + 16); // With padding
			})
			 
			//calculate width of the ones displayed: 			
			var outsidewidth = paginationWrapper.width() - _first.parent().width() * 2 - 3;
				  
			$m_wrapper.css('width',insidewidth+'px');
					
			if(ver == 'ie7'){
				_ulwrapdiv.css('width',outsidewidth+72+'px');
				//_divwrapright.css('left',outsidewidth_tmp+6+72+'px');
			}
			else{ 
				_ulwrapdiv.css('width',outsidewidth+'px');
				//_divwrapright.css('left',outsidewidth_tmp+6+'px');
			}
			  
			var thumbs_scroll_interval;
			
			if(settings.rotate){
				
				_rotleft.hover(
					function() {
					  thumbs_scroll_interval = setInterval(
						function() {
						  var left = _ulwrapdiv.scrollLeft() + 1;
						  _ulwrapdiv.scrollLeft(left);
						},
						20
					  );
					},
					function() {
					  clearInterval(thumbs_scroll_interval);
					}
				);
				_rotright.hover(
					function() {
					  thumbs_scroll_interval = setInterval(
						function() {
						  var left = _ulwrapdiv.scrollLeft() - 1;
						  _ulwrapdiv.scrollLeft(left);
						},
						20
					  );
					},
					function() {
					  clearInterval(thumbs_scroll_interval);
					}
				);
				
				if(settings.mouse == 'press'){
					_rotleft.mousedown(
						function() {
						  thumbs_mouse_interval = setInterval(
							function() {
							  var left = _ulwrapdiv.scrollLeft() + 5;
							  _ulwrapdiv.scrollLeft(left);
							},
							20
						  );
						}
					).mouseup(
						function() {
						  clearInterval(thumbs_mouse_interval);
						}
					);
					_rotright.mousedown(
						function() {
						  thumbs_mouse_interval = setInterval(
							function() {
							  var left = _ulwrapdiv.scrollLeft() - 5;
							  _ulwrapdiv.scrollLeft(left);
							},
							20
						  );
						}
					).mouseup(
						function() {
						  clearInterval(thumbs_mouse_interval);
						}
					);
				}
				else{
					 
					_rotleft.click(function(e){
						var width = outsidewidth - 10;
						var left = _ulwrapdiv.scrollLeft() - width;
						_ulwrapdiv.animate({scrollLeft: left +'px'}); 
					});	
					
					_rotright.click(function(e){
						var width = outsidewidth - 10;
						var left = _ulwrapdiv.scrollLeft() + width;
						_ulwrapdiv.animate({scrollLeft: left +'px'}); 
					});
				 
				}
				//_rotleft.click(function(e){
				//	selobj.prev().find('a').click();
				//});	
					
				//_rotright.click(function(e){
				//	selobj.next().find('a').click();
				//});
			}
			
			//first and last:
			_first.click(function(e){
					$m_wrapper.animate({scrollLeft: '0px'});
					$m_wrapper.find('li').eq(0).find('a').click();
			});
			_last.click(function(e){
					$m_wrapper.parent().animate({scrollLeft: insidewidth +'px'});
					//log(insidewidth +'px');
					$('.tmiSlider-markers li').last().find('a').click(); //('.tmiSlider-markers li')
					//log(.html());
			});
			
			var last = _ulwrapdiv.find('li').eq(settings.start-1);
				last.attr('id','tmp');
			var left = document.getElementById('tmp').offsetLeft / 2;
				last.removeAttr('id');
			var tmp = left - (outsidewidth / 2);
			if(ver == 'ie7')  _ulwrapdiv.animate({scrollLeft: left + tmp - _first.parent().width() + 52 + 'px'});	
			else  _ulwrapdiv.animate({scrollLeft: left + tmp - _first.parent().width() + 'px'});	
				 
        };

        var conf_keynav = function() {

            $(document).keyup(function (event) {

                if (!state.paused) {
                    clearInterval(state.interval);
                    state.paused = true;
                }

                if (!state.animating) {
                    if (event.keyCode === 39) {
                        event.preventDefault();
                        go(vars.fwd, false);
                    } else if (event.keyCode === 37) {
                        event.preventDefault();
                        go(vars.prev, false);
                    }
                }

                if (state.paused && settings.automatic) {
                    state.interval = setInterval(function () {
                        go(vars.fwd);
                    }, settings.animspeed);
                    state.paused = false;
                }

            });

        };

        var conf_hoverpause = function() {

            $wrapper.hover(function () {
                if (!state.paused) {
                    clearInterval(state.interval);
                    state.paused = true;
                }
            }, function () {
                if (state.paused) {
                    state.interval = setInterval(function () {
                        go(vars.fwd, false);
                    }, settings.animspeed);
                    state.paused = false;
                }
            });

        };

        var conf_captions = function() {

            $.each($slides, function (key, slide) {

                var caption = $(slide).children('img:first-child').attr('title');

                // Account for images wrapped in links
                if(!caption){
                    caption = $(slide).children('a').find('img:first-child').attr('title');
                }

                if (caption) {
                    caption = $('<p class="tmiSlider-caption">' + caption + '</p>');
                    caption.appendTo($(slide));
                }

            });

        };

        var conf_random = function() {

            var rand            = Math.floor(Math.random() * state.slidecount) + 1;
            state.currentslide  = rand;
            state.currentindex  = rand-1;

        };

        var set_next = function(direction) {

            if(direction === vars.fwd){
                
                if($slides.eq(state.currentindex).next().length){
                    state.nextindex = state.currentindex + 1;
                    state.nextslide = state.currentslide + 1;
                }
                else{
                    state.nextindex = 0;
                    state.nextslide = 1;
                }

            }
            else{

                if($slides.eq(state.currentindex).prev().length){
                    state.nextindex = state.currentindex - 1;
                    state.nextslide = state.currentslide - 1;
                }
                else{
                    state.nextindex = state.slidecount - 1;
                    state.nextslide = state.slidecount;
                }

            }

        };

        var go = function(direction, position) {

            // only if we're not already doing things
            if(!state.animating){

                // doing things
                state.animating = true;

                if(position){
                    state.nextslide = position;
                    state.nextindex = position-1;
                }
                else{
                    set_next(direction);
                }

				
                    if(settings.showmarkers){
                        $m_markers.removeClass('current-marker');
						
						var currentMarker = $m_markers.eq(state.nextindex); 
							currentMarker.addClass('current-marker');
						
						selobj = currentMarker;  
						 
						selobj.find('a').click(); 
						
						var span = '<span>' + (state.nextindex + 1) +'</span>';
						currentMarker.html(span);
                    }

                   
					// create the marker
					var markerLink = $('<a href="">'+ (state.currentindex + 1)+'</a>');
					 
					var previousMarker = $m_markers.eq(state.currentindex); 
						previousMarker.html(markerLink);
					
					
                // fade animation
                if(settings.animtype === 'fade'){

					// fade out current
                    $slides.eq(state.currentindex).fadeOut(settings.animduration);
					
                    // fade in next
                    $slides.eq(state.nextindex).fadeIn(settings.animduration, function(){ 
                        // update state variables
                        state.animating = false;
                        state.currentslide = state.nextslide;
                        state.currentindex = state.nextindex; 
                    });

                } 
            }

        };

        // lets get the party started :)
        init();

    };

})(jQuery);
