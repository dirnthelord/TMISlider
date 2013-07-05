TMISlider
=========

TMISlider = Too Many Images Slider.

Credits
=======

  This is a simple Qquery image slider based on two popular sliders.

    1. Basic Slider (http://www.basic-slider.com) Authored by John Cobb (http://www.johncobb.name)
    2. JPAGINATE: A FANCY JQUERY PAGINATION PLUGIN Authored by Cody (http://tympanus.net/codrops/author/cody/)
          (http://tympanus.net/codrops/2009/11/17/jpaginate-a-fancy-jquery-pagination-plugin/)

Problem
=======
  "Basic Slider" is very simple but when there are many images (>20), the markers tend to go out of place. 
  
  
Solution
========
  When looking for a solutions, I found the "JPAGINATE: A FANCY JQUERY PAGINATION PLUGIN", which is fancy!.
  
  I remvoed some parts from both plugins and combined them together to get a nice slider with auto-scrolling 
  pagination.
  
  Still under development, so bugs and design issues are there. Feel free to improve
  
Improvements to be done
=======================
  - More sliding effects
  - Bug fixing
  - More features
  
Usage
=====
  Markup
  ------

    <div id="my-slideshow">
        <ul class="slider">
            <li><!-- Any content you like --></li>
            <li><!-- Can go inside these slides--></li>
        </ul>
    </div>

  Javascript
  ----------
   <script class="secret-source">
     jQuery(document).ready(function($) {
          $('#my-slideshow').bjqs({
              'height' : 320,
              'width' : 620 
          });
      });   
   </script>
