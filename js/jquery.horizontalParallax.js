/*
 *  Project: jQuery horizontal parallax
 *  Author: JÃ©rÃ©mie Foucault
 *  License: Unlicense
 */

;(function ($, window, document, undefined) {

    var pluginName = "horizontalParallax",
        dataKey = "plugin_" + pluginName;

    var Plugin = function (element, options) {

        this.el = element;
        this.$el = $(element);
        this.window = window;
        this.$win = $(window);
 

        this.options = {
            slideClass: 'slide',
            slideContentClass: 'slide-body',
            slideBackgroundClass: 'slide-background',
            slideContainer: 'slide-container',
            slideNumber: 0,
            slideHeight: 600,
            slideWidth: 800,
            containerHeight: 600,
            containerWidth: 800,
            xContainer: 'x-container',
            yContainer: 'y-container',
            speed: 0.2,
            image: null,
            bluredImage: null,
            imageAttribute: "image",
            imageBlurAttribute: "image-blur",
            transparentClass: "transparent",
            slideBlurClass: "blurSlide",
            blurClass: "blur" 
        };

        this.init(options);
    };

    Plugin.prototype = {
        init: function (options) {
            var self = this;
            
            $.extend(this.options, options);
            this.$el.addClass(this.options.xContainer)
                .removeClass(this.options.slideContainer);
                        
            this.$el.contents().wrapAll(
                $('<div/>', {
                    class: this.options.yContainer
                })
            );
         
            this.$slides = this.$el.find("." + this.options.slideClass);
            this.options.slideNumber = this.$slides.length;
            this.$xContainer = this.$el;
            this.$yContainer = this.$el.find("." + this.options.yContainer);
            this._updateSizeParams();
            this._calcScrollWindow();
            
            this.$slides.each(function(i, slide) {
                $slide = $(slide);
                self._constructSlide(i, $slide);
                $slide.data("backgroundSlide", $slide.find("." + self.options.slideBackgroundClass));
                $slide.data("transparentImg", $slide.find("." + self.options.transparentClass + " img"));
            });

            this._initParallax();
            this._bindEvents();
        },

        _initParallax: function() {
            var self = this;
            this.$slides.slice(1).each(function() {
                $(this).data("backgroundSlide").css('transform', "translate3d(" + (-self.options.slideWidth * (1-self.options.speed)) + 'px, 0px, 0px)');
                $(this).data("transparentImg").css('transform', "translate3d(" + (-self.options.slideWidth * (1-self.options.speed)) + 'px, 0px, 0px)');
            });

        },

        _constructSlide: function(i, slide) {
            var self = this
            this.image = $slide.data(this.options.imageAttribute) || this.options.image;
            this.bluredImage = $slide.data(this.options.imageBlurAttribute) || this.options.bluredImage;
            $slide.contents().wrapAll(
                $('<div/>', {
                    class: this.options.slideContentClass
                })
            );
            if (this.image) {
                var slide_background_class = this.options.slideBackgroundClass;
                var slide_background_img = this.image;
                if ($slide.hasClass(this.options.slideBlurClass)) {
                    $transparentEl = $slide.find("."+this.options.transparentClass)
                    $transparentEl.each(function() {
                        $('<img/>', {
                            src: self.image
                        }).css({"width": self.options.slideWidth + "px",
                                "left": (i * self.options.slideWidth) - $(this).offset().left + "px"
                        }).appendTo($(this));
                    });
                    
                    if (this.bluredImage) {
                        slide_background_img = this.bluredImage;
                    } else {
                        slide_background_class += " " + this.options.blurClass;
                    }
                }

                $('<img/>', {
                    src: slide_background_img
                }).appendTo($('<div/>', {
                    class: slide_background_class
                }).prependTo(slide));
                
            } else {
                throw new Error('You need to provide either a data-img attr or an image option');
            }
        }, 

        _calcScrollWindow: function() {
            this.$xContainer.css("height", this.options.containerHeight-155 + "px");
            this.$yContainer.css({
                                    "width" : this.options.containerWidth + "px",
                                    "height" : this.options.slideHeight + "px"
                                });
            this.$slides.find("."+this.options.transparentClass+" img").css("width", this.options.slideWidth + "px");
            this.$slides.css("width", this.options.slideWidth + "px");
        },

        _updateTransparentCSS: function() {
            var self = this;
            this.$slides.each(function() {
                $transparentEl = $slide.find("."+this.options.transparentClass+" img")
                $transparentEl.each(function() {
                    $(this).css({"width": self.options.slideWidth + "px",
                                 "left": (i * self.options.slideWidth) - $(this).parent().offset().left + "px"
                    });
                });
            });
        },

        _scrollHorizontally: function(scrollOffset) {
            this.$yContainer.css('transform', "translate3d(" + (-scrollOffset) + 'px, 0px, 0px)');
        },

        _calcParallax: function(scrollOffset) {
          var self = this;
          visible_slide_index = Math.floor((scrollOffset + this.options.slideWidth) / this.options.slideWidth);
          slides_to_calc = [visible_slide_index, visible_slide_index + 1];
          slides_to_calc.forEach(function(value) {
            if (value <= self.options.slideNumber) {
                value = value - 1;
                translate_value =  (-self.options.slideWidth * value + scrollOffset) * (1-self.options.speed);
                self.$slides.eq(value).data("backgroundSlide").css('transform', "translate3d(" + translate_value + 'px, 0px, 0px)');
                self.$slides.eq(value).data("transparentImg").css('transform', "translate3d(" + translate_value + 'px, 0px, 0px)');
            }
          });
        },

        
        _bindEvents: function () {
            var self = this;
            $(window).on('resize', function () {
                self._updateSizeParams();
                self._calcScrollWindow();
            });
            $(window).on('scroll', function () {
                scrollOffset = this.window.scrollY;
                self._scrollHorizontally(scrollOffset);
                self._calcParallax(scrollOffset);
            });  
        },

        _updateSizeParams: function() {
            this.options.slideHeight = $("body").outerHeight();
            this.options.slideWidth = $("body").outerWidth();
            this.options.containerHeight = (this.options.slideNumber-1) * this.options.slideWidth + this.options.slideHeight;
            this.options.containerWidth = this.options.slideWidth * this.options.slideNumber;
        },

        destroy: function() {

            this.$el.removeData();
        },

    };

    /*
     * Plugin wrapper, preventing against multiple instantiations and
     * return plugin instance.
     */
    $.fn[pluginName] = function(options) {
        var args = arguments;
     
        if (options === undefined || typeof options === 'object') {
            // Creates a new plugin instance, for each selected element, and
            // stores a reference withint the element's data
            return this.each(function() {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            // Call a public pluguin method (not starting with an underscore) for each 
            // selected element.
            if (Array.prototype.slice.call(args, 1).length == 0 && $.inArray(options, $.fn[pluginName].getters) != -1) {
                // If the user does not pass any arguments and the method allows to
                // work as a getter then break the chainability so we can return a value
                // instead the element reference.
                var instance = $.data(this[0], 'plugin_' + pluginName);
                return instance[options].apply(instance, Array.prototype.slice.call(args, 1));
            } else {
                // Invoke the speficied method on each selected element
                return this.each(function() {
                    var instance = $.data(this, 'plugin_' + pluginName);
                    if (instance instanceof Plugin && typeof instance[options] === 'function') {
                        instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                    }
                });
            }
        }
    };

}(jQuery, window, document));