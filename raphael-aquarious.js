/*!
 * Raphael Aquarious 0.4 - JavaScript Graph Library
 *
 * This is the age of Aquarious
 * http://www.youtube.com/watch?v=huBEyCVKdcw&feature=related
 *
 * Creative Commons (CC)
 * @author gALago
 */


/**
 * Default settings of the aquarious library
 */
Aquarious = {
    lang_ui: "ES",
    currency: '€',
    thousands: '.',
    decimal: ',',
    color: "#EE6831",
    font_family: 'Helvetica, Arial',
    txt: {
        font: '14px Helvetica, Arial',
        fill: "#fff"
    },
    txt1: {
        font: '14px Helvetica, Arial',
        fill: "#fff"
    },
    txt2: {
        font: '15px Helvetica, Arial',
        fill: "#000"
    }
}


/*
 * Returns true if the passed value is found in the
 * array. Returns false if it is not.
 */
function inArray (array, value) {
    var i;
    for (i=0; i < array.length; i++) {
        // Matches identical (===), not just similar (==).
        if (array[i] === value) return true;
    }
    return false;
}

/**
 *
 *  This script will format positive money values. Pass it a number
 *  with or without decimal digits. It will be formatted with the currency,
 *  thousands, and decimal symbols passed to it.
 *
 *  theNumber number the number to be formatted
 *  theCurrency char the currency symbol
 *  theThousands char the thousands separator
 *  theDecimal char the decimal separator
 *  includeTrailingCeros boolean if true includes .00 to an integer
 */
function formatCurrency(num,theCurrency,theThousands,theDecimal,includeTrailingCeros) {
    num = num.toString().replace(/\$|\,/g,'');
    if(isNaN(num))
        num = "0";
    var sign = (num == (num = Math.abs(num)));
    num = Math.floor(num*100+0.50000000001);
    var cents = num%100;
    num = Math.floor(num/100).toString();
    if(cents<10)
        cents = "0" + cents;
    for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
        num = num.substring(0,num.length-(4*i+3))+theThousands+
        num.substring(num.length-(4*i+3));
    var theOutput = (((sign)?'':'-') + theCurrency + num);
    if (cents != "00" || includeTrailingCeros) theOutput += theDecimal + cents;
    return theOutput;
}


/**
 * Added function to Raphael elements which returns the coordinates of every point
 * from the given shape
 *
 * @warning Only tested with path element, supposely it works with the rest of them
 *
 * @return an object with pairs {x,y} with the coordinates of every point of the element
 * @author Hal9000
 */
Raphael.el.getCornersArray = function () {
    var i, point, segment, corners_array;
    // Intenta tomar las coordenadas explicitas
    corners_array = this.data("coordinates");
    if (corners_array == null) {
        alert("entra");
        // Si no intenta obtener las coordenadas con el objeto path especificado por la w3c SVG
        // No funciona en ie6
        try {
            corners_array = [];
            for (i=0;i<this.node.pathSegList.numberOfItems ;i++) {
                segment = this.node.pathSegList.getItem(i);
                if (segment.x ) {
                    point = new Object()
                    point.x = segment.x;
                    point.y = segment.y;
                    corners_array.push(point);
                }
            }
        } catch (e) {
            alert("Aquarious: cannot retrieve the coordinates of the given object")
            return null;
        }
    }
    return corners_array;
};

/**
 * Added function to Raphael elements which unbinds all event handlers of the element
 *
 * @return the element
 * @author Hal9000
 */
Raphael.el.unbindAll = function () {
    var events = this.events,
    l = events.length;
    while (l--) {
        events[l].unbind();
    }
    this.events = [];
    return this;
};


/**
 * Added function to Raphael paper which draws an horizontal line or one with
 * a given angle in relation with the origin
 *
 * @param cx origin in x axis
 * @param cy origin in y axis
 * @param length the length in pixels of the output line
 * @param angle (optional) angle in degrees in relation with x axis
 * @return the output line
 *
 * @author Hal9000
 */
Raphael.fn.simpleLine = function (cx, cy, length, angle) {
    var line, bbox;
    line = this.path(Raphael.format("M{0},{1}h{2}z",cx,cy,length));
    if (angle != undefined) {
        line.rotate(angle,cx,cy);
        bbox = line.getBBox();
        line.remove();
        line = this.path(Raphael.format("M{0},{1}L{2} {3}z", bbox.x, bbox.y, bbox.x+bbox.width, bbox.y+bbox.height));
    }
    return line;
}



/* Popup object defaults */
function Popup() {
    this.background_color;
    this.background_opacity;

}

/**
 * This class objects work as an animation abstraction which helps using default timers,
 * a timeline function and the possibility to turn animations on/off easy and
 * conveniently, releasing this job from the widgets
 *
 * @author Hal9000
 */
function AnimationAbstraction(options) {
    this.has_animation = options.has_animation;
    this.event_duration = options.event_duration;
    this.delay = options.delay;
    this.easing = options.easing;
    this.timeline_delay = this.delay;
    this.total_duration = 0;
    this.total_delay = 0;
    this.current_event_duration = this.event_duration;
    this.current_delay = this.delay;
    this.current_easing = this.easing;
    this.elements_queue = new Array();
    this.attributes_queue = new Array();
    this._animation;

    /**
     * Handler of the animations with the abstractor settings
     *
     * @param elem the element to animate
     * @oaram attributes the animation attributes. see Raphael Element.attr http://raphaeljs.com/reference.html#Element.attr
     * @param callback (optional) callback function. Will be called at the end of animation
     *
     * @return the animation object
     */
    this.handle = function(elem, attributes, callback) {
        this._animation = null;
        if (this.has_animation) {
            this._animation = Raphael.animation(attributes, this.current_event_duration, this.current_easing, callback);
            elem.animate(this._animation.delay(this.current_delay));
            this.total_duration += this.current_event_duration + this.current_delay;
            //console.log("total_delay:"+this.total_delay+" current_delay:"+this.current_delay+" current_event_duration:"+this.current_event_duration);
            this.resetCurrent();
        } else {
            elem.attr(attributes);
        }
        return this._animation;
    }

    /**
     * Handler of the animations with custom settings
     *
     * @param elem the element to animate
     * @param options the animation options object (delay, event_duration and/or easing)
     * @oaram attributes the animation attributes object. see Raphael Element.attr http://raphaeljs.com/reference.html#Element.attr
     * @param callback (optional) callback function. Will be called at the end of animation
     */
    this.handleCustom = function(elem, options, attributes, callback) {
        if (options.delay != null) this.nextDelay(options.delay);
        if (options.event_duration != null) this.nextEventDuration(options.event_duration);
        if (options.easing != null) this.nextEasing(options.easing);
        return this.handle(elem, attributes, callback);
    }

    /**
     * stacks the element animation with the current_delay to create a timeLine effect
     * */
    this.pushToTimelineDelayed = function(elem, attributes, callback) {
        this.nextDelay(this.total_delay + this.current_delay);
        this.total_delay += (this.current_delay - this.total_delay);
        return this.handle(elem, attributes, callback);
    }

    /**
     * stacks the element animation with no delay to create a timeLine effect
     * */
    this.pushToTimelineUndelayed= function(elem, attributes, callback) {
        this.nextDelay(this.total_delay);
        return this.handle(elem, attributes, callback);
    }

    /**
     * animates the element stacking the current_delay to create a timeLine effect
     * */
    this.pushToTimelineCustom = function(elem, options, attributes, callback) {
        var delay = this.total_delay;
        if (options.delay != null) delay += options.delay;
        this.nextDelay(delay);

        if (options.event_duration != null) this.nextEventDuration(options.event_duration);
        if (options.easing != null) this.nextEasing(options.easing);
        this.total_delay += (this.current_delay - this.total_delay);
        return this.handle(elem, attributes, callback);
    }

    // TODO
    this.syncAnimation = function(elem, options, attributes, callback) {

    }

    // TODO makes an animation queue that plays one after the other
    this.queueAnimation = function(elem, attributes) {
        var animation = null;
        if (this.has_animation) {
            if (elem !== null && attributes !== null) {
                // enqueue animation
                this.elements_queue.push(elem);
                this.attributes_queue.push(attributes);
                console.log(elem);
                console.log(attributes);
                console.log(this.elements_queue);
                console.log(this.attributes_queue);
                function handleQueueAnimation () {

                    // handles first animation in queue
                    animation = Raphael.animation(this.attributes_queue.shift(), this.current_event_duration, this.current_easing, function(){
                        //callback queue
                        this.queueAnimation(this.elements_queue.shift(), this.attributes_queue.shift());
                    });

                    this.elements_queue.shift().animate(animation.delay(this.current_delay));
                }

                handleQueueAnimation();
            }
        } else {
            elem.attr(attributes);
        }
        return animation;

    }

    /**
     * Sets the delay time for the next animation
     *
     * @param value the delay in milliseconds
     */
    this.nextDelay = function(value) {
        if (value < 0) value = 0;
        this.current_delay = value;
    }
    /**
     * Sets the event duration time for the next animation
     *
     * @param value the lapse in milliseconds
     */
    this.nextEventDuration = function(value) {
        if (value < 0) value = 0;
        this.current_event_duration = value;
    }
    /**
     * Sets the easing effect for the next animation
     *
     * @param value the easing formula. see http://raphaeljs.com/reference.html#Raphael.easing_formulas
     */
    this.nextEasing = function(value) {
        if (value < 0) value = 0;
        this.current_easing = value;
    }

    /**
     * Resets the animation duration, delay and easing for the next animation
     */
    this.resetCurrent = function() {
        this.current_event_duration = this.event_duration;
        this.current_delay = this.delay;
        this.current_easing = this.easing;
    }

    this.pause = function() {
    //this._animation
    }
}


/**
 * This class objects hold the settings of a widget. Some of this options are common
 * between widgets, others are specific of some.
 */
function Options(options) {
    this.type;
    this.id_holder;
    // Data
    this.value;
    // Size
    this.width;
    this.height;
    // Style
    this.color;
    this.color_alt;
    // Animation
    this.easing;
    this.delay;
    this.event_duration;
    // Popup
    this.popup_background_color;
    this.popup_background_opacity;

    // Flags
    this.has_popup;
    this.has_animation;

    /**
     * string representation of the class instance
     */
    this.toString = function() {
        var string = "Options\n";
        for (var i=0;i<this.length;i++) {
            string += this[i];
        }
        return "Common Options\n" +
        " type: " + this.type + "\n" +
        " id_holder: " + this.id_holder + "\n" +
        " value: " + this.value + "\n" +
        " width: " + this.width + "\n" +
        " height: " + this.height + "\n" +
        " color: " + this.color + "\n" +
        " color_alt: " + this.color_alt + "\n" +
        " easing: " + this.easing + "\n" +
        " delay: " + this.delay + "\n" +
        " event_duration: " + this.event_duration + "\n" +
        " popup_background_color: " + this.popup_background_color + "\n" +
        " popup_background_opacity: " + this.popup_background_opacity + "\n" +
        " has_popup: " + this.has_popup + "\n" +
        " has_animation: " + this.has_animation + "\n";

    }

    /**
     * The constructor of the class
     */
    this.constructor = function() {
        /* Common Options */
        if (options == null) throw "RaphaelAquarious: missing arguments";
        /* Needed */
        if (options.type != null && options.id_holder != null ) {
            this.type = options.type;
            this.id_holder = options.id_holder;
        } else throw "RaphaelAquarious: missing options";

        /* Optional with default values*/
        // Data
        this.value = options.value != null ? options.value : 0;
        // Size
        this.width = options.width != null ? options.width : 400;
        this.height = options.height != null ? options.height : 400;
        // Style
        this.color = options.color != null ? options.color : null;
        this.color_alt = options.color_alt != null ? options.color_alt : null;
        // Animation
        this.easing = options.easing != null ? options.easing : "<>";
        this.delay = options.delay != null ? options.delay : 0;
        this.event_duration = options.event_duration != null ? options.event_duration : 0;
        // Popup
        this.popup_background_color = options.popup_background_color != null ? options.popup_background_color : "#000";
        this.popup_background_opacity = options.popup_background_opacity != null ? options.popup_background_opacity : .7;
        // Flags
        this.has_popup = options.has_popup != null ? options.has_popup : true;
        this.has_animation = options.has_animation != null ? options.has_animation : true;

        /* Individual Options */
        switch (this.type) {
            // Counter
            case "counter":
                this.char_size = options.char_size != null ? options.char_size : null;
                break;
            case "gauge":
                this.has_caption = options.has_caption != null ? options.has_caption : true;
                this.label = options.label != null ? options.label : "";
                break;
            case "thermometer":
                this.levels = options.levels != null ? options.levels : 32;
                break;
            case "barChart":
                this.type = "bar_chart";
            case "bar_chart":
                this.financial_mode = options.financial_mode != null ? options.financial_mode : false;
                this.financial_max = options.financial_max != null ? options.financial_max : -1;
                this.value_text = options.value_text != null ? " "+options.value_text : "";                
                this.bar_colors = options.line_colors != null ? options.line_colors : null;
                this.bar_opacity = options.bar_opacity != null ? options.bar_opacity : 1;
                this.bar_rounded_radius = options.bar_rounded_radius != null ? options.bar_rounded_radius : 0;
                this.bar_top_cap = options.bar_top_cap != null ? options.bar_top_cap : false;
                this.bar_gap = options.bar_gap != null ? options.bar_gap : 'medium';
                break;
            case "lineChart":
                this.type = "line_chart";
            case "line_chart":
                this.financial_mode = options.financial_mode != null ? options.financial_mode : false;
                this.financial_max = options.financial_max != null ? options.financial_max : -1;
                this.value_text = options.value_text != null ? " "+options.value_text : "";
                this.no_fill = options.no_fill != null ? options.no_fill : false;
                this.line_colors = options.line_colors != null ? options.line_colors : null;
                this.line_width = options.line_width != null ? options.line_width : 4;
                this.dot_width = options.dot_width != null ? options.dot_width : 4;
                break;
            case "spider":
                if (options.labels != null && options.value != null && options.max_value != null ) {
                    this.labels = options.labels;
                    this.max_value = options.max_value;
                } else throw "RaphaelAquarious[spider]: missing options";
                this.value_text = options.value_text != null ? " "+options.value_text : "";
                this.no_fill = options.no_fill != null ? options.no_fill : false;
                this.line_colors = options.line_colors != null ? options.line_colors : null;
                this.line_width = options.line_width != null ? options.line_width : 6;
                this.dot_width = options.dot_width != null ? options.dot_width : 8;
                break;
            case "___template":
                this._______ = options._______ != null ? options._______ : null;
                break;
            default:
                throw "RaphaelAquarious: unknown widget type";
        }
    }



    /* call constructor and returns instance */
    this.constructor();
    return this;
}

/**
 * This class objects are the widgets themselves, holding options, paper and all the
 * elements that compose the widget. Every widget adjusts itself to the size of the paper.
 * Check Options class for default options of widgets
 *
 * @param options the options object which the widget will have. Type and id_holder
 *                must be set
 *
 * @author Hal9000
 */
function Widget(options) {
    this.options;
    this.paper;
    this.popup;
    this.svg;

    /**
     * Factory method to build the specific widget depending in the type given
     * by the options object.
     */
    this.factory = function() {
        var widget;
        switch (this.options.type) {
            case "counter":
                widget = drawCounter(this);
                break;
            case "gauge":
                widget = drawGauge(this);
                break;
            case "thermometer":
                widget = drawThermometer(this);
                break;
            case "bar_chart":
                widget = drawBarChart(this);
                break;
            case "line_chart":
                widget = drawLineChart(this);
                break;
            case "spider":
                widget = drawSpider(this);
                break;
        }
        // Raphael fixes
        widget.paper.renderfix();
        widget.paper.safari();
        return widget;
    }

    /**
     * Updates the value of the widget asynchronously
     *
     * @param new_value the new_value the widget will have, this is a polymorphic variable
     */
    this.updateValue = function(new_value) {
        this.options.value = new_value;
        this.factory();
        return this;
    }

    /**
     * Updates the options of the widget asynchronously
     *
     * @param options the new options object the widget will get
     */
    this.update = function(options) {
        if (options != null) this.options = new Options(options);
        this.factory(this.options);
        return this;
    }

    /**
     * String representation of the widget
     */
    this.toString = function() {
        return "Raphael Aquarious Widget\n\n"+this.options.toString();
    }

    /**
     * Pauses the widget animation
     */
    this.pause = function() {
        this.paper.forEach(function (el) {
            el.pause();
        });
        return this;
    }

    /**
     * Resumes the widget animation
     */
    this.resume = function() {
        this.paper.forEach(function (el) {
            el.resume();
        });
        return this;
    }

    /**
     * Constructor of the class
     */
    this.constructor = function () {
        this.options = new Options(options);
        this.paper = Raphael(this.options.id_holder, this.options.width, this.options.height);
        //this.popup = (this.options.has_popup) ? new Popup(this.options) : null;
        this.factory(options);
    }



    /* call constructor and returns instance */
    this.constructor();
    return this;
}



/**
 *  Draw a counter in the widget paper.
 *
 *
 *  Options available:
 *
 *      Default:
 *      - width
 *      - height
 *      - value (must have) | number or string
 *      - has_animation
 *      - delay
 *      - event_duration
 *      - easing
 *
 *      Custom:
 *      - color     | The color string #000000 of the counter
 *      - char_size | The size of the font in pixels, if it doesn't fit, the
 *                    counter will make it smaller to avoid clipping.
 *                    if not specified, the text will fit the whole paper, it's variable
 *
 *  @return the widget object
 *  @author Hal9000
 */
function drawCounter(widget) {
    var counter = widget.svg,
    paper = widget.paper,
    opt = widget.options,
    width = opt.width,
    height = opt.height,
    value = opt.value,

    color = opt.color != null ? opt.color : Aquarious.color,
    value_length = String(value).length,
    fixed_size = opt.char_size != null,
    char_size = fixed_size ? opt.char_size : Math.round(width*2/value_length),
    font = char_size + "px " + Aquarious.font_family,
    output_value = value,
    counter_BBox,
    // Rescale if the font is too big for the box until it fits without clipping
    fix_clipping = function () {
        if (!fixed_size) {
            counter.transform("");
            counter_BBox = counter.getBBox();
            while (counter_BBox.width > width || counter_BBox.height > height) {
                counter.transform("s0.9...");
                counter_BBox = counter.getBBox();
            }
        }
    };

    // Create counter
    if (counter == null) {
        counter = paper.text(width/2, height/2, output_value).attr({
            fill: color,
            font: font,
            "font-weight": "bold",
            "text-anchor": "middle"
        });

    }

    if (opt.has_animation) {
        var event_duration = opt.event_duration > 0 ? opt.event_duration : 300;
        counter.animate(Raphael.animation({
            opacity: 0
        }, event_duration, opt.easing, function() {
            // callback
            counter.attr({
                text: output_value
            }).animate(Raphael.animation({
                opacity: 1
            }, event_duration, opt.easing));
            fix_clipping();
        }).delay(opt.delay));

    } else {
        counter.attr({
            text: output_value
        });
        fix_clipping();
    }

    widget.svg = counter;
    return widget;
}


/**
 *  Draw a gauge meter in the widget paper.
 *
 *
 *  Options available:
 *
 *      Default:
 *      - width
 *      - height
 *      - value (must have)
 *      - has_animation
 *      - delay
 *      - event_duration
 *      - easing
 *
 *      Custom:
 *      - color       | The color string #000000 of the counter
 *      - label       | The label tag, if any, appended to the caption
 *      - has_caption | if set to false, a numeric caption will be shown at the
 *                      bottom of the gauge
 *
 *  @return the widget object
 *  @author Hal9000
 */
function drawGauge(widget) {

    var gauge = widget.svg,
    paper = widget.paper,
    opt = widget.options,
    width = opt.width,
    height = opt.height,
    value = opt.value;
    if (opt.event_duration==0) opt.event_duration = 3000;

    var animator = new AnimationAbstraction(opt),
    background, foreground, caption,
    initial_value, initial_percent_value,
    has_caption = opt.has_caption,
    percent_value = Math.round(value * 100),
    // Si hay caption dejamos un 25% de la altura para pintarlo
    gauge_height = has_caption ? height * 0.85 : height,
    padding = 20,
    radius = Math.min(width/2,gauge_height) - padding*2,
    pos_x = width/2,
    pos_y = radius + padding,
    //        stroke_width = opt != null && opt.stroke_width != null
    //              ? opt.stroke_width : radius/30,

    label = opt.label;
    // Si el valor es valido entre 0 y 1. Lo convertimos a grados 0=0 grados 1=180
    value = value >= 0 && value <= 1 ? value*180 : 180;


    paper.customAttributes.segment = function (cx, cy, r, startAngle, endAngle) {
        var rad = Math.PI / 180,
        color = opt.color != null ? opt.color : "hsb(" + ((endAngle - startAngle) / 720) + ", 1, 1)",
        x1 = cx - r * Math.cos(-startAngle * rad),
        x2 = cx - r * Math.cos(-endAngle * rad),
        y1 = cy + r * Math.sin(-startAngle * rad),
        y2 = cy + r * Math.sin(-endAngle * rad);
        return {
            path: ["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 1, x2, y2, "z"],
            fill: color
        };
    };

    paper.customAttributes.value = function (val) {
        return {
            text: Math.round(val) + "% " + label
        };
    };

    initial_value = opt.has_animation ? 0 : value;
    initial_percent_value = Math.round(initial_value * 100);
    // Create or pop the gauge items
    if (gauge == null) {
        // Initial State
        // Background
        background = paper.path().attr({
            segment: [pos_x, pos_y, radius, 0, 180]
        }).attr({
            "stroke-opacity": 0,
            fill: "#EEE"
        });
        // Foreground
        foreground = paper.path().attr({
            "stroke-opacity": 0,
            "stroke-linejoin": "round",
            segment: [pos_x, pos_y, radius, 0, initial_value]
        });
        // Caption
        if (has_caption) {
            var char_size = radius * 0.25;
            if (char_size < 20) char_size = 20;
            var font = char_size+ "px " + Aquarious.font_family,
            color = "#CCC";

            caption = paper.text(pos_x, pos_y + char_size/1.5, initial_percent_value + "% " + label).attr({
                fill: color,
                font: font,
                "text-anchor": "middle",
                value: initial_value
            });
        }
    } else {
        if (has_caption) caption = gauge.pop();
        foreground = gauge.pop();
        background = gauge.pop();
    }

    // Final State
    animator.handle(foreground, {
        segment: [pos_x, pos_y, radius, 0, value]
    });
    if (has_caption) {
        animator.handle(caption, {
            value: percent_value
        });
    };

    gauge = paper.set().push(background, foreground);
    if (has_caption) gauge.push(caption);
    widget.svg = gauge;
    return widget;
}




/**
 *  Draw an horizontal bar formed by 'n' levels which represent each a value in
 *  between the range of a color code.
 *  red is 0,
 *  green is max_value-1
 *
 *
 *  Options available:
 *
 *      Default:
 *      - width
 *      - height
 *      - value (must have)
 *      - has_animation
 *      - delay
 *      - event_duration
 *      - easing
 *
 *      Custom:
 *      - levels      | The number of color gap levels
 *
 *  @return the widget object
 *  @author Hal9000
 */
function drawThermometer(widget) {

    var thermometer = widget.svg,
    paper = widget.paper,
    opt = widget.options,
    width = opt.width,
    height = opt.height,
    value = opt.value;
    if (opt.event_duration==0) opt.event_duration = 2500;

    var animator = thermometer == null ? new AnimationAbstraction(opt) : widget.animator,
    levels = opt.levels,
    i, x = 5, y = 35,
    final_pos,
    last_value,
    // Check width
    rect_width = ((width-5)/levels) - 4,
    rect_height = height - 40,
    rect_corner_radius = 5,
    gap = 4 + rect_width,
    stroke_width = 2,
    h=0, s= 100, b=50,
    h_inc = 120/levels,
    pointer_color = "#333",
    level_rectangles,
    pointer_path,
    pointer;

    // Draw the thermometer with as many rectangles as levels and the pointer shape
    if (thermometer == null) {
        last_value = 0;
        level_rectangles = [];
        for (i=0;i<levels;i++) {
            level_rectangles[i] = paper.rect(x, y, rect_width, rect_height, rect_corner_radius)
            .attr({
                "stroke-width": stroke_width,
                fill: Raphael.hsl(h, s, b)
            });
            x+=gap;
            h+=h_inc;
        //alert(h+" "+s+" "+b+" "+Raphael.hsb(h, 100, 50));
        }
        pointer_path = "M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z";
        pointer = paper.path(pointer_path).attr({
            fill: pointer_color,
            stroke: "none",
            transform: "T"+(-11+(rect_width/2))+"0,10S1.8"
        });
    } else {
        pointer = thermometer.pop();
        last_value = widget.last_value;
    }

    final_pos = (value-last_value)*gap;
    animator.handle(pointer,{
        transform: ["...T", final_pos, 0]
    });

    paper.renderfix();
    thermometer = paper.set().push(pointer);
    widget.svg = thermometer;
    widget.last_value = value;
    widget.animator = animator;
    return widget;
}




/**
 *  Draw a x,y axis chart. X axis accept continous values, not Y axis.
 *
 *  TODO async update
 *
 *  Options available:
 *
 *      Default:
 *      - width
 *      - height
 *      - value (must have) | monofunction - array with pairs {x,y} which represent
 *                                           the values of the chart function.
 *                              OR
 *                            multifunction - array of arrays which represent multiple
 *                                            chart functions, each one composed of pairs {x,y}.
 *      - has_animation
 *      - delay
 *      - event_duration    | milliseconds between each pair {x,y} is drawn
 *      - easing
 *
 *
 *      Custom:
 *      - financial_mode       | if true the chart will be formatted with monetary format
 *                               in proportional hops (500,1000,5000,10000...) as ceiling of X axis.
 *                               default false
 *      - financial_max        | The max value before start to jump proportionaly as described in the X axis
        - bar_colors           | hex The bar fill colors
        - bar_opacity          | 0-1 the opacity of the bar fills
        - bar_rounded_radius   | The bar rounded radius in px
        - bar_top_cap          | true||false if the bar will have a top cap in the style of google analytics, need a bar_opacity value to see the effect
        - bar_gap              | The gap between bars - 'none', 'small', 'medium', 'large'
 *      - dot_width   | The width in pixels of the dots that represent a pair {x,y} inside a function line
 *      - value_text           | The string which will be appended to the value inside the popup in singular, plural is automatic.
 *      - popup_background     | The color code of the popup background
 *      - popup_opacity        | The opacity 0-1 of the popup background
 *
 *  @return the widget object
 *
 *  @author Hal9000
 */
function drawBarChart (widget) {
    // default
    var chart = widget.svg,
    paper = widget.paper,
    opt = widget.options,
    width = opt.width,
    height = opt.height,
    values = new Array(opt.value);

    if (opt.event_duration==0) opt.event_duration = 600;
    if (opt.delay==0) opt.delay = 100;
    var animator = new AnimationAbstraction(opt);
    var accumulated_delay = opt.delay, event_duration = chart == null ? opt.event_duration : 0;

    // cutsom
    //    var chart_type = opt.chart_type;
    //
    //    var chart_width,
    //    chart_height,
    //    bar_thickness = "variable segun el numero de valores";
    //
    //    if (chart_type == 'V') {
    //        bar_width = bar_thickness;
    //        bar_height = 0;
    //    }
    //    else if (chart_type == 'H') {
    //        bar_width = 0;
    //        bar_height = bar_thickness;
    //    } else return;

    // Para todas los valores creamos una barra de tamanio 0 que ira creciendo segun sea su valor


    var i, x, y, y_value, aux_value,
    x_chart,
    y_chart = 20,
    x_margin = 10,
    y_margin = 25,
    chart_width,
    chart_height,
    // TODO ahora mismo no se usa ya que toma los valores de x de la primera funcion
    // esta listo para usarse en el bucle principal.
    values_x = [],
    fun,
    fun_aux,
    financial_mode = opt.financial_mode,
    financial_min = 500,
    financial_max = opt.financial_max,
    max_x = 0,
    max_y = 0,
    min_y = 0,
    base = 1,
    ceiling,
    gaps_y,
    gaps_x,
    gaps_x_frequency,
    bars = [],
    x_aux = [],
    y_aux = [],
    path_string = [],
    path_string_fill,
    ref_line_stroke_width = .2,
    bar_width,   
    bar_gap_width, 
    bar_gap_type = opt.bar_gap,
    bar_opacity = opt.bar_opacity,
    bar_rounded_radius = opt.bar_rounded_radius,
    has_bar_top_cap = opt.bar_top_cap,
    bars_top_caps = [],
    color = opt.bar_colors ? opt.bar_colors : new Array(Aquarious.color),
    over_areas = [],
    over_rect_length,
    parallel_set = paper.set();

    // popup var
    var in_text,
    value_text = opt.value_text,
    popup_background = opt.popup_background_color,
    popup_opacity = opt.popup_background_opacity,
    leave_timer, is_label_visible = false,
    popup_label,
    popup_frame;
    if (chart == null) {
        popup_label = paper.set();
        popup_label.push(paper.text(60, 12, "x_value").attr(Aquarious.txt));
        y=30;
        for (i=0;i<values.length;i++) {
            popup_label.push(paper.text(60, y, "y_value#i").attr(Aquarious.txt1).attr({
                fill: color[0],
                "font-weight": "bold"
            }));
            y+=15;
        }
        popup_label.hide();
        popup_frame = paper.popup(100, 100, popup_label, "right").attr({
            fill: popup_background,
            stroke: "#666",
            "stroke-width": 2,
            "fill-opacity": popup_opacity
        }).hide();
    } else {
        popup_label = chart.popup_label;
        popup_frame = chart.popup_frame;
    }
    // UI labels
    switch (Aquarious.lang_ui) {
        case "ES":
            in_text = " en";
            break;
        default:
            in_text = " in";
    }

    // Calculating the maximum values based in the input values and widen
    // Fill the array with all the possible values of the X axis
    for (fun=0;fun<values.length;fun++) {
        for (i=0;i<values[fun].length;i++) {
            if (max_x < values[fun][i].x) max_x = values[fun][i].x;
            if (max_y < values[fun][i].y) max_y = values[fun][i].y;
            if (min_y > values[fun][i].y) min_y = values[fun][i].y;
            if (!inArray(values_x,values[fun][i].x)) values_x.push(values[fun][i].x);
        }
    }
    values_x.sort();


    // If the chart is in monetary values mode, the maximum range will be predefined
    // to have a consistent look&feel
    if (financial_mode) {
        gaps_y = 5;
        if (max_y > 0) base = Math.floor(Math.log(max_y)/Math.log(10));
        ceiling = (max_y < financial_min) ? financial_min : Math.pow(10,base)*5;
        if (financial_max > -1 && ceiling >= financial_max) {
            ceiling = Math.pow(10,base);
            while (max_y >= ceiling) ceiling+=Math.pow(10,base);
        //while (max_y >= ceiling) ceiling+=Math.pow(10,base-1)*5;
        }
        else {
            if (max_y >= ceiling) ceiling*=2;
        }
    }
    // In the rest of cases, the ceiling will have a margin of 20% above the max value
    else {
        gaps_y = 6;
        ceiling = (max_y == 0) ? 6:Math.ceil(max_y*1.2);
        while((typeof((ceiling/gaps_y))=='number') && ((ceiling/gaps_y).toString().indexOf('.')!=-1)) ceiling++;
    }


    //console.log("old_ceiling="+(chart==null ? "undefined":chart.ceiling) +" new_ceiling="+ceiling);
    // if max_y changes on update, redraw the whole chart, else update the bars with new values
    if (chart != null) {
        if(ceiling > chart.ceiling) {
            widget.svg = null;
            paper.clear();
            //console.log("REDRAW!\n\n");
            return drawBarChart(widget);
        }
        else if (ceiling < chart.ceiling) {
            ceiling = chart.ceiling;
        }
    }

    // Draw the chart coordinate axis and labels
    x_margin = x_margin*(String(ceiling).length);
    x_chart = x_margin+12;
    chart_width = width - x_chart;
    chart_height = height - 60;
    aux_value = gaps_y;
    over_rect_length = width/values_x.length;
    // Draw the values of the Y axis
    for (i=0;i<=gaps_y;i++) {
        y = y_chart + chart_height/gaps_y*i;
        // Value labels of Y axis
        if (chart == null) {
            paper.text(x_margin,y,formatCurrency((ceiling/gaps_y*aux_value--),'',Aquarious.thousands,Aquarious.decimal,false)).attr(Aquarious.txt2).attr({
                "text-anchor": "end"
            });
            // Reference bars of Y axis
            paper.path("M"+x_chart+" "+y+"H"+(width)).attr({
                "stroke-width": ref_line_stroke_width
            });
        }
    }
    // y = graph floor

    // Leave a 5% width to each side to leave "air" between the values and the end of the canvas  _|__chart_width__|_
    chart_width -= chart_width*.10;
    // Calculates the number of reference values of X axis depending in the amount of values,
    // the size of the graphic and the length of the reference string. (a char 14px its 7.5px average)
    gaps_x = Math.floor(chart_width / (values_x[values_x.length-1].toString().length*10));
    if (gaps_x > values_x.length) gaps_x = values_x.length;
    gaps_x_frequency = Math.ceil(values_x.length / gaps_x);

    // retrieve widget objects if there are
    if (chart != null) {
        over_areas = chart.over_areas;
        bars = chart.bars;
        bars_top_caps = chart.bars_top_caps;
    }

    // Drar reference marks of X axis as well as the bars of the bar chart based on the input values
    for (fun=0;fun<values.length;fun++) {
        if (chart == null) {
            bars[fun] = [];
            bars_top_caps[fun] = [];
            over_areas[fun] = [];
        }

        x = x_chart + chart_width*.03 - chart_width/(values[fun].length);
        bar_gap_width = (chart_width+chart_width*.03)/(values[fun].length);
        switch (bar_gap_type) { 
            case 'none':
                // bar_width 100% - gap_width 0%
                bar_width = bar_gap_width;                
                break;
            case 'small':
                // bar_width 80% - gap_width 20%
                bar_width = bar_gap_width * .8;                
                break;
            case 'large':
                // bar_width 40% - gap_width 60%
                bar_width = bar_gap_width * .4;                
                break;
            case 'medium':
            default:
                // bar_width 60% - gap_width 40%
                bar_width = bar_gap_width * .6;                
        }
        //bar_width = chart_width/2/(values[fun].length-1);        
        x += bar_gap_width/2;

        for (i=0;i<values[fun].length;i++) {
            x += bar_gap_width;
            //x = x_chart + chart_width/values[fun].length*i + x_margin;
            // The first iteration draws the X axis
            if (fun == 0 && chart == null) {
                // If there are many different values, it doesn't draw all the reference marks for minimalistic issues
                if (i%gaps_x_frequency == 0) {
                    paper.text(x,y+y_margin,values[fun][i].x).attr(Aquarious.txt2);
                    paper.path(Raphael.format("M{0} {1}V{2}", x, y+8, chart_height+20)).attr({
                        "stroke-width": ref_line_stroke_width
                    });
                }
            }
            // Draw the chart bars or updates them
            y_value = y_chart + Math.abs(chart_height - (chart_height/ceiling)*values[fun][i].y);
            path_string[i] = "M"+x+" "+y_value+" L";
            if (chart == null) {
                bars[fun][i] = paper.rect(x-bar_width/2, y, bar_width, 0, bar_rounded_radius).attr({
                    "stroke-width" : 0,
                    fill: color[fun],
                    "fill-opacity": bar_opacity,
                    transform: "r180"
                });
                // Draw the top cap bars aka google analytics bars
                if (has_bar_top_cap) {
                    bars_top_caps[fun][i] = paper.rect(x-bar_width/2, y, bar_width, 4).attr({
                        "stroke-width" : 0,
                        fill: color[fun]
                    });
                }
            }
            animator.handleCustom(bars[fun][i], {
                event_duration: opt.event_duration - 300,
                delay: accumulated_delay - 200
            }, {
                height: y-y_value
            });
            if (has_bar_top_cap) {
                animator.handleCustom(bars_top_caps[fun][i], {
                    event_duration: opt.event_duration - 300,
                    delay: accumulated_delay - 200
                }, {
                    y: y_value
                });
            }


            x_aux[i] = x;
            y_aux[i] = y_value;

            // Calcula las coordenadas del relleno para crear el path tras obetener todos los puntos
            if (i == 0) path_string_fill = "M"+x+" "+y+" L"+x+" "+y_value;
            else path_string_fill += " "+x+" "+y_value;


            // Draw a transparent rectangle to handle hover events
            if (chart == null) {
                over_areas[fun][i] = paper.rect(x-(over_rect_length/2), y_margin, over_rect_length, chart_height)
                .attr({
                    stroke: "none",
                    fill: color[fun],
                    "fill-opacity": 0
                });

            }

            accumulated_delay+=event_duration;


            if (chart == null) {
                if (fun == 0 && i==0) {
                    function over_events (x, y, index, fun_index) {
                        over_areas[fun_index][i].mouseover(function() {
                            var i, fun, lx, ly, ppp, anim;
                            clearTimeout(leave_timer);
                            if (financial_mode)
                                popup_label[0].attr({
                                    text: formatCurrency(values[fun_index][index].y,Aquarious.currency,Aquarious.thousands,Aquarious.decimal,false)
                                });
                            else
                                popup_label[0].attr({
                                    text: values[fun_index][index].y + value_text + (value_text != "" && values[fun_index][index].y != 1 ? "s" : "") + in_text
                                });
                            popup_label[1].attr({
                                text: values[fun_index][index].x,
                                fill: color[fun_index]
                            });
                            // Si se solapan lineas o puntos se gestionan para su correcta visualizacion
                            ly = 45;

                            // Dibuja el popup balloon
                            var side = "top";
                            if (Math.abs(y-chart_height) + popup_frame.getBBox().height > chart_height) {
                                side = "bottom";
                            }
                            ppp = paper.popup(x, y, popup_label, side, 1);
                            anim = Raphael.animation({
                                path: ppp.path,
                                transform: ["t", ppp.dx, ppp.dy]
                            }, 250 * is_label_visible);
                            // Calcula las nuevas coordeandas de los elementos del popup
                            lx = popup_label[0].transform()[0][1] + ppp.dx;
                            ly = popup_label[0].transform()[0][2] + ppp.dy;
                            popup_frame.show().stop().animate(anim);

                            for (i=0;i<popup_label.length;i++) {
                                popup_label[i].show().stop().animateWith(popup_frame, anim, {
                                    transform: ["t", lx, ly]
                                }, 250 * is_label_visible);
                            }
                            is_label_visible = true;
                        });
                        over_areas[fun_index][i].mouseout(function() {
                            for (var i=1;i<values.length;i++) {
                                popup_label[i+1].attr({
                                    opacity: 0
                                });
                            }
                            leave_timer = setTimeout(function () {
                                popup_frame.hide();
                                popup_label.hide();
                                is_label_visible = false;
                            }, 1);
                        });
                    };
                }
            }
            else {
                // Removes event handlers of older over_areas
                over_areas[fun][i].unbindAll();

            }
            over_events(x, y_value, i, fun);
        }
    }

    // Traemos el popup al frente
    popup_frame.toFront();
    popup_label.toFront();
    // Traemos las over areas al frente. Siempre tienen que ser los objetos mas al frente para no interferir con su cometido
    for (fun=0;fun<over_areas.length;fun++) {
        for (i=0;i<over_areas[fun].length;i++) {
            over_areas[fun][i].toFront();
        }
    }

    chart = new Object();
    chart.popup_label = popup_label;
    chart.popup_frame = popup_frame;
    chart.bars = bars;
    chart.bars_top_caps = bars_top_caps;
    chart.over_areas = over_areas;
    chart.ceiling = ceiling;

    widget.svg = chart;
    return widget;
}




/**
 *  Draw a x,y axis chart. X axis accept continous values, not Y axis.
 *
 *  TODO async update
 *
 *  Options available:
 *
 *      Default:
 *      - width
 *      - height
 *      - value (must have) | monofunction - array with pairs {x,y} which represent
 *                                           the values of the chart function.
 *                              OR
 *                            multifunction - array of arrays which represent multiple
 *                                            chart functions, each one composed of pairs {x,y}.
 *      - has_animation
 *      - delay
 *      - event_duration    | milliseconds between each pair {x,y} is drawn
 *      - easing
 *
 *
 *      Custom:
 *      - financial_mode       | if true the chart will be formatted with monetary format
 *                               in proportional hops (500,1000,5000,10000...) as ceiling of X axis.
 *                               default false
 *      - financial_max        | The max value before start to jump proportionaly as described in the X axis
 *      - no_fill              | if true the widget won't paint a semitransparent fill under the line of the function chart, default false.
 *      - line_colors | (must have if multifunction) array of strings with the color code of every chart function line
 *      - line_width  | The width in pixels of the chart function line(s)
 *      - dot_width   | The width in pixels of the dots that represent a pair {x,y} inside a function line
 *      - value_text           | The string which will be appended to the value inside the popup in singular, plural is automatic.
 *      - popup_background     | The color code of the popup background
 *      - popup_opacity        | The opacity 0-1 of the popup background
 *
 *  @return the widget object
 *
 *  @author Hal9000
 */
function drawLineChart (widget) {
    var chart = widget.svg,
    paper = widget.paper,
    opt = widget.options,
    width = opt.width,
    height = opt.height,
    values = opt.value;

    if (opt.event_duration==0) opt.event_duration = 600;
    if (opt.delay==0) opt.delay = 100;
    var animator = new AnimationAbstraction(opt);
    var accumulated_delay = opt.delay, event_duration = chart == null ? opt.event_duration : 0;


    var i, x, y, y_value, aux_value,
    x_chart,
    y_chart = 20,
    x_margin = 10,
    y_margin = 25,
    chart_width,
    chart_height,
    // TODO ahora mismo no se usa ya que toma los valores de x de la primera funcion
    // esta listo para usarse en el bucle principal.
    values_x = [],
    multifun = values[0] instanceof Array,
    fun,
    fun_aux,
    financial_mode = opt.financial_mode,
    financial_min = 500,
    financial_max = opt.financial_max,
    max_x = 0,
    max_y = 0,
    min_y = 0,
    base = 1,
    ceiling,
    gaps_y,
    gaps_x,
    gaps_x_frequency,
    lines = [],
    x_aux = [],
    y_aux = [],
    path_string = [],
    path_string_fill,
    line_stroke_width = .2,
    line_width = opt.line_width,
    dot_width = opt.dot_width,
    color = opt.line_colors ? opt.line_colors : new Array(Aquarious.color),
    dots = [],
    fill = [],
    over_areas = [],
    over_rect_length,
    parallel_set = paper.set(),
    dots_set = [],
    lines_set = [];
    // If only one function line to draw, put it inside an array to keep the uniform
    // access independently the number of function lines
    if (!multifun) values = new Array(values);
    // popup var
    var in_text,
    value_text = opt.value_text,
    popup_background = opt.popup_background_color,
    popup_opacity = opt.popup_background_opacity,
    leave_timer, is_label_visible = false,
    popup_label,
    popup_frame;
    if (chart == null) {
        popup_label = paper.set();
        popup_label.push(paper.text(60, 12, "x_value").attr(Aquarious.txt));
        y=30;
        for (i=0;i<values.length;i++) {
            popup_label.push(paper.text(60, y, "y_value#i").attr(Aquarious.txt1).attr({
                fill: color[0],
                "font-weight": "bold"
            }));
            y+=15;
        }
        popup_label.hide();
        popup_frame = paper.popup(100, 100, popup_label, "right").attr({
            fill: popup_background,
            stroke: "#666",
            "stroke-width": 2,
            "fill-opacity": popup_opacity
        }).hide();
    } else {
        popup_label = chart.popup_label;
        popup_frame = chart.popup_frame;
    }
    // UI labels
    switch (Aquarious.lang_ui) {
        case "ES":
            in_text = " en";
            break;
        default:
            in_text = " in";
    }

    // Calculating the maximum values based in the input values and widen
    // Fill the array with all the possible values of the X axis
    for (fun=0;fun<values.length;fun++) {
        for (i=0;i<values[fun].length;i++) {
            if (max_x < values[fun][i].x) max_x = values[fun][i].x;
            if (max_y < values[fun][i].y) max_y = values[fun][i].y;
            if (min_y > values[fun][i].y) min_y = values[fun][i].y;
            if (!inArray(values_x,values[fun][i].x)) values_x.push(values[fun][i].x);
        }
    }
    values_x.sort();


    // If the chart is in monetary values mode, the maximum range will be predefined
    // to have a consistent look&feel
    if (financial_mode) {
        gaps_y = 5;
        if (max_y > 0) base = Math.floor(Math.log(max_y)/Math.log(10));
        ceiling = (max_y < financial_min) ? financial_min : Math.pow(10,base)*5;
        if (financial_max > -1 && ceiling >= financial_max) {
            ceiling = Math.pow(10,base);
            while (max_y >= ceiling) ceiling+=Math.pow(10,base);
        //while (max_y >= ceiling) ceiling+=Math.pow(10,base-1)*5;
        }
        else {
            if (max_y >= ceiling) ceiling*=2;
        }
    }
    // In the rest of cases, the ceiling will have a margin of 20% above the max value
    else {
        gaps_y = 6;
        ceiling = (max_y == 0) ? 6:Math.ceil(max_y*1.2);
        while((typeof((ceiling/gaps_y))=='number') && ((ceiling/gaps_y).toString().indexOf('.')!=-1)) ceiling++;
    }


    //console.log("old_ceiling="+(chart==null ? "undefined":chart.ceiling) +" new_ceiling="+ceiling);
    // if max_y changes on update, redraw the whole chart, else update the lines with new values
    if (chart != null) {
        if(ceiling > chart.ceiling) {
            widget.svg = null;
            paper.clear();
            //console.log("REDRAW!\n\n");
            return drawLineChart(widget);
        }
        else if (ceiling < chart.ceiling) {
            ceiling = chart.ceiling;
        }
    }

    // Draw the chart coordinate axis and labels
    x_margin = x_margin*(String(ceiling).length);
    x_chart = x_margin+12;
    chart_width = width - x_chart;
    chart_height = height - 60;
    aux_value = gaps_y;
    over_rect_length = width/values_x.length;
    // Draw the values of the Y axis
    for (i=0;i<=gaps_y;i++) {
        y = y_chart + chart_height/gaps_y*i;
        // Value labels of Y axis
        if (chart == null) {
            paper.text(x_margin,y,formatCurrency((ceiling/gaps_y*aux_value--),'',Aquarious.thousands,Aquarious.decimal,false)).attr(Aquarious.txt2).attr({
                "text-anchor": "end"
            });
            // Reference lines of Y axis
            paper.path("M"+x_chart+" "+y+"H"+(width)).attr({
                "stroke-width": line_stroke_width
            });
        }
    }

    // Leave a 5% width to each side to leave "air" between the values and the end of the canvas  _|__chart_width__|_
    chart_width -= chart_width*.10;
    // Calculates the number of reference values of X axis depending in the amount of values,
    // the size of the graphic and the length of the reference string. (a char 14px its 7.5px average)
    gaps_x = Math.floor(chart_width / (values_x[values_x.length-1].toString().length*10));
    if (gaps_x > values_x.length) gaps_x = values_x.length;
    gaps_x_frequency = Math.ceil(values_x.length / gaps_x);

    // retrieve widget objects if there are
    if (chart != null) {
        dots = chart.dots;
        over_areas = chart.over_areas;
        lines = chart.lines;
        parallel_set = chart.parallel_set;
        parallel_set.forEach(function(e) {
            e.remove();
        });
    }

    // Drar reference marks of X axis as well as the lines of the line chart based on the input values
    for (fun=0;fun<values.length;fun++) {
        if (chart == null) {
            dots[fun] = [];
            lines[fun] = [];
            over_areas[fun] = [];
            dots_set[fun] = paper.set();
            lines_set[fun] = paper.set();
        }

        x = x_chart + chart_width*.05 - chart_width/(values[fun].length-1);

        for (i=0;i<values[fun].length;i++) {
            x += chart_width/(values[fun].length-1);
            //x = x_chart + chart_width/values[fun].length*i + x_margin;
            // The first iteration draws the X axis
            if (fun == 0 && chart == null) {
                // If there are many different values, it doesn't draw all the reference marks for minimalistic issues
                if (i%gaps_x_frequency == 0) {
                    paper.text(x,y+y_margin,values[fun][i].x).attr(Aquarious.txt2);
                    paper.path(Raphael.format("M{0} {1}V{2}", x, y+8, chart_height+20)).attr({
                        "stroke-width": line_stroke_width
                    });
                }
            }
            // Draw the chart function lines or updates them
            y_value = y_chart + Math.abs(chart_height - (chart_height/ceiling)*values[fun][i].y);
            if (i < values[fun].length-1) {
                path_string[i] = "M"+x+" "+y_value+" L";
                if (chart == null) {
                    lines[fun][i] = paper.path(path_string[i]).attr({
                        stroke: color[fun],
                        "stroke-width" : line_width,
                        "stroke-linejoin": "round"
                    });
                    lines_set[fun].push(lines[fun][i]);
                }
            }
            if (i>0) {
                path_string[i-1] += x+" "+y_value+"z";
                animator.handleCustom(lines[fun][i-1], {
                    event_duration: opt.event_duration - 300,
                    delay: accumulated_delay - 200
                }, {
                    path:path_string[i-1]
                });
            //}, event_duration-300, "<>").delay(accumulated_delay-200));
            }

            x_aux[i] = x;
            y_aux[i] = y_value;
            // Draw multiple lines in case 2+ values share the same values between 2 coordinates
            if (multifun && i>0) {
                var angle, path_aux_size, gap, inc,
                path_string_aux,
                point_aux_origin,
                point_aux_end,
                parallel1,
                parallel2,
                perpendicular1_origin,
                perpendicular2_origin,
                perpendicular1_end,
                perpendicular2_end,
                number_lines = 1,
                fun_index = [],
                fun_index_pointer = 0;
                // First, look over all the line functions to determine the number of lines needed
                for (fun_aux=fun-1;fun_aux>=0;fun_aux--) {
                    if (values[fun_aux][i-1].x == values[fun][i-1].x &&
                        values[fun_aux][i-1].y == values[fun][i-1].y &&
                        values[fun_aux][i].x == values[fun][i].x &&
                        values[fun_aux][i].y == values[fun][i].y ) {
                        number_lines++;
                        fun_index.push(fun_aux);
                        fun_index_pointer = fun_aux;
                    }
                }
                // if odd, just change the width of the line which si es impar tan solo cambiamos el grosor de la linea que corresponde para superponerla con las pares
                if (number_lines > 1 && number_lines%2 == 1) {
                    lines[fun][i-1].attr({
                        "stroke-width" : line_width/number_lines
                    });
                }
                // known the number of lines to draw, if even, draw them
                if (number_lines > 1 && number_lines%2 == 0) {
                    fun_index.push(fun);
                    angle = Raphael.angle(x_aux[i-1],y_aux[i-1],x_aux[i],y_aux[i]);
                    path_aux_size = line_width/2;
                    // Obtenemos pares de lineas perpendiculares en origen y final para trazar desde ahi las lineas paralelas
                    perpendicular1_origin = paper.simpleLine(x_aux[i-1],y_aux[i-1],path_aux_size,angle+90);
                    perpendicular1_end = paper.simpleLine(x_aux[i],y_aux[i],path_aux_size,angle+90);
                    perpendicular2_origin = paper.simpleLine(x_aux[i-1],y_aux[i-1],path_aux_size,angle+270);
                    perpendicular2_end = paper.simpleLine(x_aux[i],y_aux[i],path_aux_size,angle+270);

                    // Una vez obtenidas trazamos las lineas paralelas con el color correspondiente a cada funcion
                    gap = path_aux_size/number_lines;
                    inc = gap;
                    for (var j=0;j<Math.floor(number_lines/2);j++) {
                        // Dibujamos el par de lineas "reflejadas"
                        // linea 1
                        point_aux_origin = perpendicular1_origin.getPointAtLength(gap);
                        point_aux_end = perpendicular1_end.getPointAtLength(gap);
                        path_string_aux = Raphael.format("M{0},{1} L", point_aux_origin.x, point_aux_origin.y);
                        parallel1 = paper.path(path_string_aux).attr({
                            stroke: color[fun_index[j]],
                            "stroke-width" : (line_width/number_lines)+.5
                        });
                        path_string_aux += Raphael.format("{0} {1}z", point_aux_end.x, point_aux_end.y);
                        if (chart == null) {
                            animator.handleCustom(parallel1, {
                                event_duration: opt.event_duration - 300,
                                delay: accumulated_delay - 200
                            }, {
                                path: path_string_aux
                            });
                        }
                        else {
                            parallel1.attr({
                                path: path_string_aux,
                                opacity: 0
                            })
                            animator.handleCustom(parallel1, {
                                event_duration: opt.event_duration - 300,
                                delay: accumulated_delay + opt.event_duration - 500
                            }, {
                                opacity: 1
                            });
                        }
                        // linea 2
                        point_aux_origin = perpendicular2_origin.getPointAtLength(gap);
                        point_aux_end = perpendicular2_end.getPointAtLength(gap);
                        path_string_aux = Raphael.format("M{0},{1} L", point_aux_origin.x, point_aux_origin.y);
                        parallel2 = paper.path(path_string_aux).attr({
                            stroke: color[fun_index[j+Math.floor(number_lines/2)]],
                            "stroke-width" : (line_width/number_lines)+.5
                        });
                        path_string_aux += Raphael.format("{0} {1}z", point_aux_end.x, point_aux_end.y);
                        if (chart == null) {
                            animator.handleCustom(parallel2, {
                                event_duration: opt.event_duration - 300,
                                delay: accumulated_delay - 200
                            }, {
                                path: path_string_aux
                            });
                        }
                        else {
                            parallel2.attr({
                                path: path_string_aux,
                                opacity: 0
                            })
                            animator.handleCustom(parallel2, {
                                event_duration: opt.event_duration - 300,
                                delay: accumulated_delay + opt.event_duration - 500
                            }, {
                                opacity: 1
                            });
                        }
                        gap += inc;
                        // Metemos las lineas en un set para poder mostrarlas u ocultarlas en cualquier momento
                        parallel_set.push(parallel1);
                        parallel_set.push(parallel2);
                    }
                    // Ocultamos los objetos que estan debajo para que no hagan una fea aberracion cromatica debido a la suerposicion
                    animator.handleCustom(dots[fun_index[fun_index_pointer]][i-1], {
                        event_duration: opt.event_duration - 300,
                        delay: accumulated_delay - 200,
                        easing: '>'
                    }, {
                        "stroke-width" : 0//dot_width*2
                    });
                    animator.handleCustom(dots[fun_index[fun_index_pointer]][i], {
                        event_duration: opt.event_duration - 300,
                        delay: accumulated_delay - 200,
                        easing: '>'
                    }, {
                        "stroke-width" : 0//dot_width*2
                    });
                    perpendicular1_origin.remove();
                    perpendicular1_end.remove();
                    perpendicular2_origin.remove();
                    perpendicular2_end.remove();
                }
            }
            // Calcula las coordenadas del relleno para crear el path tras obetener todos los puntos
            if (i == 0) path_string_fill = "M"+x+" "+y+" L"+x+" "+y_value;
            else path_string_fill += " "+x+" "+y_value;
            // Dibuja el punto del valor x,y de cada elemento
            if (chart == null) {
                dots[fun][i] = paper.circle(x,y_value,0).attr({
                    stroke: color[fun],
                    "stroke-width": dot_width,
                    fill: color[fun]
                });
                dots_set[fun].push(dots[fun][i]);
                animator.handleCustom(dots[fun][i], {
                    event_duration: 1000,
                    delay: accumulated_delay,
                    easing: 'elastic'
                }, {
                    r: dot_width
                });
            } else {
                animator.handleCustom(dots[fun][i], {
                    event_duration: opt.event_duration - 300,
                    delay: accumulated_delay - 200
                }, {
                    cx: x,
                    cy: y_value,
                    "stroke-width": dot_width
                });
            }


            // Draw a transparent rectangle to handle hover events
            if (chart == null) {
                if (multifun) {
                    over_areas[fun][i] = paper.rect(x-(over_rect_length/2), y_value-8, over_rect_length, 16)
                    .attr({
                        stroke: "none",
                        fill: color[fun],
                        "fill-opacity": 0
                    });
                }
                else {
                    over_areas[fun][i] = paper.rect(x-(over_rect_length/2), y_margin, over_rect_length, chart_height)
                    .attr({
                        stroke: "none",
                        fill: color[fun],
                        "fill-opacity": 0
                    });
                }
            }
            else {
                if (multifun) {
                    animator.handleCustom(over_areas[fun][i], {
                        event_duration: opt.duration - 300,
                        delay: accumulated_delay - 200
                    }, {
                        y: y_value-8
                    });
                }
            }
            accumulated_delay+=event_duration;


            if (chart == null) {
                if (fun == 0 && i==0) {
                    function over_events (x, y, index, fun_index) {
                        over_areas[fun_index][i].mouseover(function() {
                            var i, fun, lx, ly, share_dot, ppp, anim;
                            dots[fun_index][index].animate({
                                transform: 's1.5',
                                fill: "#fff"
                            },200, '>');
                            clearTimeout(leave_timer);
                            if (financial_mode)
                                popup_label[0].attr({
                                    text: formatCurrency(values[fun_index][index].y,Aquarious.currency,Aquarious.thousands,Aquarious.decimal,false)
                                });
                            else
                                popup_label[0].attr({
                                    text: values[fun_index][index].y + value_text + (value_text != "" && values[fun_index][index].y != 1 ? "s" : "") + in_text
                                });
                            popup_label[1].attr({
                                text: values[fun_index][index].x,
                                fill: color[fun_index]
                            });
                            // Si se solapan lineas o puntos se gestionan para su correcta visualizacion
                            ly = 45;


                            for (fun=0;fun<values.length-1;fun++) {
                                popup_label[fun+2].attr({
                                    opacity: 0,
                                    y: 30
                                });
                                if (fun != fun_index) {
                                    share_dot =
                                    values[fun][index].x == values[fun_index][index].x &&
                                    values[fun][index].y == values[fun_index][index].y;

                                    if (share_dot) {
                                        dots[fun_index][index].animate({
                                            transform: 's1.8',
                                            fill: color[fun]
                                        },200, '>');
                                        popup_label[fun+2].attr({
                                            text: values[fun][index].x,
                                            fill: color[fun],
                                            opacity: 1,
                                            y: ly
                                        });
                                        ly+=15;

                                    } else {
                                //                                        lines_set[fun].forEach(function (line) {
                                //                                            animator.handleCustom(line, {
                                //                                                event_duration: 200,
                                //                                                delay: 0,
                                //                                                easing: '>'
                                //                                            }, {
                                //                                                opacity: 0.2
                                //                                            });
                                //                                        });
                                }
                                }
                            }
                            // Dibuja el popup balloon
                            var side = "bottom";
                            if (y + popup_frame.getBBox().height > chart_height) {
                                side = "top";
                            }
                            ppp = paper.popup(x, y, popup_label, side, 1);
                            anim = Raphael.animation({
                                path: ppp.path,
                                transform: ["t", ppp.dx, ppp.dy]
                            }, 250 * is_label_visible);
                            // Calcula las nuevas coordeandas de los elementos del popup
                            lx = popup_label[0].transform()[0][1] + ppp.dx;
                            ly = popup_label[0].transform()[0][2] + ppp.dy;
                            popup_frame.show().stop().animate(anim);

                            for (i=0;i<popup_label.length;i++) {
                                popup_label[i].show().stop().animateWith(popup_frame, anim, {
                                    transform: ["t", lx, ly]
                                }, 250 * is_label_visible);
                            }
                            is_label_visible = true;
                        });
                        over_areas[fun_index][i].mouseout(function() {
                            for (var i=1;i<values.length;i++) {
                                popup_label[i+1].attr({
                                    opacity: 0
                                });
                            }
                            dots[fun_index][index].animate({
                                transform: 's1',
                                fill: color[fun_index]
                            },400, '<');
                            leave_timer = setTimeout(function () {
                                popup_frame.hide();
                                popup_label.hide();
                                is_label_visible = false;
                            }, 1);
                        });
                    }
                }
            }
            else {
                // Removes event handlers of older over_areas
                over_areas[fun][i].unbindAll();

            }
            over_events(x, y_value, i, fun);

        }

        // Dibuja el relleno del path de la funcion al eje
        if (!opt.no_fill) {
            if (chart == null) {
                fill[fun] = paper.path(path_string_fill+" "+x+" "+y+"z").attr({
                    stroke: "none",
                    fill: color[fun],
                    "fill-opacity": 0.2,
                    opacity: 0
                });
                animator.handleCustom(fill[fun], {
                    event_duration: 1000,
                    delay: accumulated_delay
                }, {
                    opacity: 1
                });
            }
            else {
                fill[fun] = chart.fill[fun];
                animator.handleCustom(fill[fun], {
                    event_duration: opt.duration - 300,
                    delay: accumulated_delay - 200
                }, {
                    path: path_string_fill+" "+x+" "+y+"z"
                });
            }
        }
        // Pone los puntos por delante para que no esten por detras del fill
        for (i=0;i<dots[fun].length;i++) {
            dots[fun][i].toFront();
        }
    }

    //if (fun == values.length-1) {
    //   // Si se solapan lineas o puntos se hace
    //   for (fun=0;fun<values.length-1;fun++) {
    //       for (i=0;i<values[fun].length;i++) {
    //           if (values[fun][i].x == values[values.length-1][i].x && values[fun][i].y == values[values.length-1][i].y) {
    //               (function (x, y, index, fun_index) {
    //                   over_areas[values.length-1][index].mouseover(function() {
    //                        dots[values.length-1][index].animate({transform: 's1.8', fill: color[fun_index]},200, '>');
    //                        popup_label.push(paper.text(60, 50, values[fun_index][index].x).attr(Aquarious.txt1).attr({fill: color[fun_index], "font-weight": "bold"}));
    //                   });
    //               })(0, 0, i, fun);
    //           }
    //       }
    //   }
    //}

    // Traemos el popup al frente
    popup_frame.toFront();
    popup_label.toFront();
    // Traemos las over areas al frente. Siempre tienen que ser los objetos mas al frente para no interferir con su cometido
    for (fun=0;fun<over_areas.length;fun++) {
        for (i=0;i<over_areas[fun].length;i++) {
            over_areas[fun][i].toFront();
        }
    }

    chart = new Object();
    chart.popup_label = popup_label;
    chart.popup_frame = popup_frame;
    chart.lines = lines;
    chart.dots = dots;
    chart.fill = fill;
    chart.over_areas = over_areas;
    chart.ceiling = ceiling;
    chart.lines_set = lines_set;
    chart.dots_set = dots_set;
    chart.parallel_set = parallel_set;
    widget.svg = chart;
    return widget;
}


/**
 *  Draw a spider chart based in the number of values and the number of possible levels.
 *
 *  Options available:
 *
 *      Default:
 *      - width
 *      - height
 *      - value (must have) | monofunction - array with numbers which represent
 *                                           the values of the chart function in
 *                                           clockwise orther, starting at "12hours".
 *                              OR
 *                            multifunction - array of arrays which represent multiple
 *                                            chart functions, each one composed of different values.
 *      - has_animation
 *      - delay
 *      - event_duration    | milliseconds between each value dot is thrown from the center of coordiantes
 *      - easing
 *
 *
 *      Custom:
 *      - labels    (must have)| an array of strings with the labels of each axis. The chart will have as many axis as strings in this array
 *      - max_value (must have)| the cieling value of the outer ring, if any value is higher it will be shown in the popup the real one but rounded to this max in the chart
 *      - no_fill              | if true the widget won't paint a semitransparent fill under the line of the function chart, default false.
 *      - line_colors | (must have if multifunction) array of strings with the color code of every chart function line
 *      - line_width  | The width in pixels of the chart function line(s)
 *      - dot_width   | The width in pixels of the dots that represent a pair {x,y} inside a function line
 *      - value_text           | The string which will be appended to the value inside the popup in singular, plural is automatic.
 *      - popup_background     | The color code of the popup background
 *      - popup_opacity        | The opacity 0-1 of the popup background
 *
 *  @return the widget object
 *
 *  @author Hal9000
 */
function drawSpider(widget) {
    var spider = widget.svg,
    paper = widget.paper,
    opt = widget.options,
    width = opt.width,
    height = opt.height,
    labels = opt.labels,
    values = opt.value,
    // TODO no especificarlo pero darle el valor maximo de las funciones
    max_value = opt.max_value;

    if (opt.event_duration==0) opt.event_duration = 1200;
    if (opt.delay==0) opt.delay = 200;
    var animator = new AnimationAbstraction(opt);

    var i,
    multifun = values[0] instanceof Array,
    fun = 0,
    fun_aux,
    line_width = opt.line_width,
    dot_width = opt.dot_width,
    stroke_width = .8,
    stroke_color = "#BBB",
    levels = labels.length < 3 ? 3 : labels.length,
    interval,
    polygon_radius = 0,
    origin_x = width/2,
    origin_y = height/2,
    polygons,
    labels_chart = [],
    txt_levels = {
        font: '15px Helvetica, Arial',
        fill: stroke_color,
        "text-anchor": "start"
    },
    text_align = "middle";

    if (height > width) height = width;
    interval = (height/2)/(max_value+2);

    // Draw the spider coordinate axis and labels
    if (spider == null) {
        polygons = paper.set();
        //console.log("width:"+width+" height:"+height+" interval:"+interval+" max_value:"+max_value+" max_value*interval:"+(max_value*interval));
        for (i=0;i<max_value;i++) {
            // Raphael:: draw as much polygons as levels, each one with a bigger radius
            polygon_radius+=interval;
            polygons.push(paper.polygon(origin_x, origin_y, polygon_radius, levels)
                .attr({
                    stroke : stroke_color,
                    "stroke-width": stroke_width
                }));
            paper.text(origin_x+3,origin_y-polygon_radius+(interval/2)+5,i).attr(txt_levels);
        }
        paper.text(origin_x+3,origin_y-(polygon_radius+=interval)+(interval/2)+5,max_value+"+").attr(txt_levels);

        // Sacamos las coordenadas de un polígno mayor para dibujar las etiquetas y las líneas de nivel
        var line_origin_coord = paper.polygon(origin_x, origin_y, polygon_radius, levels).hide().getCornersArray();
        for (i=0;i<levels;i++) {
            // Raphael:: dibuja las lineas horizontales por cada nivel.
            paper.path(Raphael.format("M{0} {1}L{2} {3}", origin_x, origin_y, line_origin_coord[i].x, line_origin_coord[i].y))
            .attr({
                stroke : stroke_color,
                "stroke-width": stroke_width
            });
            // Coloca las etiquetas de nivel. Dependiendo de su posicion alinea el texto Der Cen Izq
            if (i==0 || i==levels/2) text_align = "middle";
            else if (i>levels/2) text_align = "end"
            else text_align = "start";

            labels_chart[i] = paper.text(line_origin_coord[i].x,line_origin_coord[i].y,labels[i])
            .attr(Aquarious.txt2).attr({
                "text-anchor": text_align
            });
        }
    }
    else {
        polygons = spider.polygons;
    }

    var j, coord_x, coord_y,
    level,
    shape = [],
    shape_points_array = [],
    shape_points,
    x_aux = [],
    y_aux = [],
    dots = [],
    over_areas = [],
    over_radius = interval*.6,
    parallel_set = paper.set(),
    fill_opacity = opt.no_fill ? 0 : 0.2,
    color = opt.line_colors ? opt.line_colors : new Array(Aquarious.color);

    // Si solo hay una funcion a dibujar, la metemos en un array para mantener la
    // uniformidad de acceso independientemente del numero de funciones.
    if (!multifun) values = new Array(values);


    // popup var
    var in_text, text_svg,
    value_text = opt.value_text,
    popup_background = opt.popup_background_color,
    popup_opacity = opt.popup_background_opacity,
    leave_timer, is_label_visible = false,
    popup_label,
    popup_frame,
    label_heights = [];
    for (i=0;i<labels.length;i++) {
        text_svg = paper.text(0,0,labels[i]).attr(Aquarious.txt).attr({
            "font-weight": "bold"
        });
        label_heights[i] = text_svg.getBBox().height;
        text_svg.remove();
    }
    if (spider == null) {
        popup_label = paper.set();
        // Metemos en una variable los labels ocultos para calcular tamanios en el posicionamiento del popup y sus popup_label
        popup_label.push(paper.text(60, 12, "x_value").attr(Aquarious.txt));
        y=30;
        for (i=0;i<values.length;i++) {
            popup_label.push(paper.text(60, y, "y_value#i").attr(Aquarious.txt1).attr({
                fill: color[0],
                "font-weight": "bold"
            }));
            y+=label_heights[i];
        }
        popup_label.hide();
        popup_frame = paper.popup(100, 100, popup_label, "right").attr({
            fill: popup_background,
            stroke: "#666",
            "stroke-width": 2,
            "fill-opacity": popup_opacity
        }).hide();
    } else {
        popup_label = spider.popup_label;
        popup_frame = spider.popup_frame;
    }
    // UI labels
    switch (Aquarious.lang_ui) {
        case "ES":
            in_text = " en";
            break;
        default:
            in_text = " in";
    }

    // retrieve widget objects if there are
    if (spider != null) {
        dots = spider.dots;
        over_areas = spider.over_areas;
        shape = spider.shape;
        parallel_set = spider.parallel_set;
        parallel_set.forEach(function(e) {
            e.remove();
        });
    }

    for (fun=0;fun<values.length;fun++){
        shape_points_array[fun] = [];
        for (i=0;i<values[fun].length;i++) {
            level = values[fun][i]-1;
            if (level>=0)  {
                if (level >= max_value)
                    shape_points_array[fun].push(polygons[max_value-1].getCornersArray()[i]);
                else
                    shape_points_array[fun].push(polygons[level].getCornersArray()[i]);
            }
            else shape_points_array[fun].push({
                x:origin_x,
                y:origin_y
            });
        }
    }

    // Draw the function lines
    for (fun=0;fun<shape_points_array.length;fun++){
        shape_points = "M";
        if (spider == null) {
            dots[fun] = [];
            over_areas[fun] = [];
        }
        for (i=0;i<shape_points_array[fun].length;i++) {
            coord_x = shape_points_array[fun][i].x;
            coord_y = shape_points_array[fun][i].y;
            shape_points+=coord_x+","+coord_y+" L";

            x_aux[i] = coord_x;
            y_aux[i] = coord_y;
            // Raphael:: dibuja un circulo por cada coordenada para simbolizar "el punto gordo"

            if (spider == null) {
                dots[fun][i] = paper.circle(origin_x,origin_y,0)
                .attr({
                    stroke: color[fun],
                    "stroke-width": 0,
                    fill: color[fun]
                });
                animator.pushToTimelineDelayed(dots[fun][i], {
                    cx: coord_x,
                    cy: coord_y,
                    r: dot_width/2,
                    "stroke-width": dot_width/2
                });
            } else {
                animator.pushToTimelineUndelayed(dots[fun][i], {
                    cx: coord_x,
                    cy: coord_y,
                    r: dot_width/2,
                    "stroke-width": dot_width/2
                });
            }


            // Dibuja un rectangulo transparente para gestionar los eventos over
            if (spider == null) {
                //over_radius = values[fun][i]*16 < 80 && values[fun][i]*16 > 18 ? values[fun][i]*16 : 40;
                over_areas[fun][i] = paper.circle(coord_x, coord_y, over_radius)
                .attr({
                    stroke: "none",
                    fill: color[fun],
                    "fill-opacity": 0
                });
            } else {
                animator.pushToTimelineUndelayed(over_areas[fun][i], {
                    cx: coord_x,
                    cy: coord_y
                });
            }

            if (spider == null) {
                if (fun == 0 && i==0) {
                    function over_events (x, y, index, fun_index) {
                        over_areas[fun_index][i].mouseover(function() {
                            var lx, ly, share_dot;
                            animator.handleCustom(dots[fun_index][index], {
                                event_duration: 200,
                                delay: 0,
                                easing: '>'
                            }, {
                                transform: 's1.5',
                                fill: "#fff"
                            });
                            clearTimeout(leave_timer);
                            popup_label[0].attr({
                                text: values[fun_index][index] + value_text + (value_text != "" && values[fun_index][index] != 1 ? "s" : "") + in_text
                            });
                            ly = 22 + label_heights[index]/2;
                            popup_label[1].attr({
                                text: labels[index],
                                fill: color[fun_index],
                                y: ly
                            });
                            // Si se solapan lineas o puntos se gestionan para su correcta visualizacions
                            for (fun=0;fun<values.length;fun++) {
                                if (fun < values.length-1) {
                                    popup_label[fun+2].attr({
                                        opacity: 0,
                                        y: 30
                                    });
                                }
                                if (fun != fun_index) {
                                    share_dot =
                                    shape_points_array[fun][index].x == shape_points_array[fun_index][index].x &&
                                    shape_points_array[fun][index].y == shape_points_array[fun_index][index].y;

                                    if (share_dot) {

                                        ly += label_heights[index];
                                        animator.handleCustom(dots[fun_index][index], {
                                            event_duration: 200,
                                            delay: 0,
                                            easing: '>'
                                        }, {
                                            transform: 's1.8',
                                            fill: color[fun]
                                        });
                                        if (popup_label[fun+2] != null) {
                                            popup_label[fun+2].attr({
                                                text: labels[index],
                                                fill: color[fun],
                                                opacity: 1,
                                                y: ly
                                            });
                                        }
                                    } else {
                                        animator.handleCustom(shape[fun], {
                                            event_duration: 200,
                                            delay: 0,
                                            easing: '>'
                                        }, {
                                            opacity: 0.2
                                        });
                                    }
                                }

                            }
                            // Dibuja el popup balloon
                            var side = "right";
                            if (x + popup_frame.getBBox().width > 333) {
                                side = "left";
                            }
                            var ppp = paper.popup(x, y, popup_label, side, 1),
                            anim = Raphael.animation({
                                path: ppp.path,
                                transform: ["t", ppp.dx, ppp.dy]
                            }, 250 * is_label_visible);
                            // Calcula las nuevas coordeandas de los elementos del popup
                            lx = popup_label[0].transform()[0][1] + ppp.dx;
                            ly = popup_label[0].transform()[0][2] + ppp.dy;
                            popup_frame.show().stop().animate(anim);

                            for (i=0;i<popup_label.length;i++) {
                                popup_label[i].show().stop().animateWith(popup_frame, anim, {
                                    transform: ["t", lx, ly]
                                }, 250 * is_label_visible);
                            }
                            is_label_visible = true;
                        });
                        over_areas[fun_index][i].mouseout(function() {
                            for (var i=0;i<values.length;i++) {
                                animator.handleCustom(shape[i], {
                                    event_duration: 200,
                                    delay: 0,
                                    easing: '>'
                                }, {
                                    opacity: 1
                                });
                                if (i>0) {
                                    popup_label[i+1].attr({
                                        opacity: 0
                                    });
                                }
                            }
                            animator.handleCustom(dots[fun_index][index], {
                                event_duration: 400,
                                delay: 0,
                                easing: '<'
                            }, {
                                transform: 's1',
                                fill: color[fun_index]
                            });
                            leave_timer = setTimeout(function () {
                                popup_frame.hide();
                                popup_label.hide();
                                is_label_visible = false;
                            }, 1);
                        });
                    }
                }
            }
            else {
                // Removes event handlers of older over_areas
                over_areas[fun][i].unbindAll();

            }
            over_events(coord_x, coord_y, i, fun);


        }
        shape_points+="z";
        if (spider == null) {
            shape[fun] = paper.path(shape_points)
            .attr({
                stroke : color[fun],
                fill: color[fun],
                "fill-opacity": fill_opacity,
                opacity: 0,
                "stroke-width": line_width,
                "stroke-linejoin": "round"
            });
            animator.pushToTimelineCustom(shape[fun], {
                delay: opt.event_duration
            }, {
                opacity: 1
            });
        } else {
            animator.pushToTimelineCustom(shape[fun], {
                delay: 0
            }, {
                path: shape_points
            });
        }


        if (multifun) {
            for (i=1;i<=shape_points_array[fun].length;i++) {
                // Dibuja las lineas multiples en caso de que varios valores tengan los mismos valores entre dos puntos
                var angle, path_aux_size, gap, inc,
                path_string_aux,
                point_aux_origin,
                point_aux_end,
                parallel1,
                parallel2,
                perpendicular1_origin,
                perpendicular2_origin,
                perpendicular1_end,
                perpendicular2_end,
                number_lines = 1,
                fun_index = [],
                fun_index_pointer = 0;
                j = i%shape_points_array[fun].length
                // Primero se hace una pasada por todas las funciones para determinar el numero de lineas que se necesitan
                for (fun_aux=fun-1;fun_aux>=0;fun_aux--) {
                    if (shape_points_array[fun_aux][i-1].x == shape_points_array[fun][i-1].x &&
                        shape_points_array[fun_aux][i-1].y == shape_points_array[fun][i-1].y &&
                        shape_points_array[fun_aux][j].x == shape_points_array[fun][j].x &&
                        shape_points_array[fun_aux][j].y == shape_points_array[fun][j].y ) {
                        number_lines++;
                        fun_index.push(fun_aux);
                        fun_index_pointer = fun_aux;
                    }
                }
                // ya conocido el numero de lineas a dibujar, si son pares, se dibujan
                if (number_lines > 1) {
                    fun_index.push(fun);
                    angle = Raphael.angle(x_aux[i-1],y_aux[i-1],x_aux[j],y_aux[j]);
                    path_aux_size = line_width/2;
                    // Obtenemos pares de lineas perpendiculares en origen y final para trazar desde ahi las lineas paralelas
                    perpendicular1_origin = paper.simpleLine(x_aux[i-1],y_aux[i-1],path_aux_size,angle+90);
                    perpendicular1_end = paper.simpleLine(x_aux[j],y_aux[j],path_aux_size,angle+90);
                    perpendicular2_origin = paper.simpleLine(x_aux[i-1],y_aux[i-1],path_aux_size,angle+270);
                    perpendicular2_end = paper.simpleLine(x_aux[j],y_aux[j],path_aux_size,angle+270);

                    // Una vez obtenidas trazamos las lineas paralelas con el color correspondiente a cada funcion
                    gap = path_aux_size/number_lines;
                    inc = gap;
                    for (var k=0;k<Math.floor(number_lines/2);k++) {
                        // Dibujamos el par de lineas "reflejadas"
                        // linea 1
                        point_aux_origin = perpendicular1_origin.getPointAtLength(gap);
                        point_aux_end = perpendicular1_end.getPointAtLength(gap);
                        path_string_aux = Raphael.format("M{0},{1} L{2} {3}z", point_aux_origin.x, point_aux_origin.y, point_aux_end.x, point_aux_end.y);
                        parallel1 = paper.path(path_string_aux).attr({
                            stroke: color[fun_index[k]],
                            "stroke-width" : (line_width/number_lines)+.5,
                            "stroke-opacity": 0
                        });
                        //                        parallel1.animate(Raphael.animation({
                        //                            "stroke-opacity": 1
                        //                        }, event_duration-300, "<>").delay(accumulated_delay)).toFront();

                        // linea 2
                        point_aux_origin = perpendicular2_origin.getPointAtLength(gap);
                        point_aux_end = perpendicular2_end.getPointAtLength(gap);
                        path_string_aux = Raphael.format("M{0},{1} L{2} {3}z", point_aux_origin.x, point_aux_origin.y, point_aux_end.x, point_aux_end.y);
                        parallel2 = paper.path(path_string_aux).attr({
                            stroke: color[fun_index[k+Math.floor(number_lines/2)]],
                            "stroke-width" : (line_width/number_lines)+.5,
                            "stroke-opacity": 0
                        });

                        if (spider == null) {
                            animator.nextEventDuration(opt.event_duration-300);
                            animator.pushToTimelineUndelayed(parallel1, {
                                "stroke-opacity": 1
                            });
                            animator.nextEventDuration(opt.event_duration-300);
                            animator.pushToTimelineUndelayed(parallel2, {
                                "stroke-opacity": 1
                            });
                        } else {
                            animator.handleCustom(parallel1, {
                                delay: opt.event_duration
                            }, {
                                "stroke-opacity": 1
                            });
                            animator.handleCustom(parallel2, {
                                delay: opt.event_duration
                            }, {
                                "stroke-opacity": 1
                            });
                        }
                        gap += inc;
                        // Metemos las lineas en un set para poder mostrarlas u ocultarlas en cualquier momento
                        parallel_set.push(parallel1);
                        parallel_set.push(parallel2);
                    }
                    perpendicular1_origin.remove();
                    perpendicular1_end.remove();
                    perpendicular2_origin.remove();
                    perpendicular2_end.remove();
                }
                // si es impar tan solo cambiamos el grosor de la linea que corresponde para superponerla con las pares
                if (number_lines > 1 && number_lines%2 == 1) {
                    path_string_aux = Raphael.format("M{0},{1} L{2} {3}z", shape_points_array[fun][i-1].x, shape_points_array[fun][i-1].y, shape_points_array[fun][j].x, shape_points_array[fun][j].y);

                }
                // Behaviour for dots with 2+ values
                for (fun_aux=fun-1;fun_aux>=0;fun_aux--) {
                    if (fun != fun_aux &&
                        shape_points_array[fun][j].x == shape_points_array[fun_aux][j].x &&
                        shape_points_array[fun][j].y == shape_points_array[fun_aux][j].y) {
                        if (spider == null) {
                            animator.pushToTimelineUndelayed(dots[fun_aux][j], {
                                "stroke-width" : dot_width*1.2
                            });
                        } else {
                            animator.handle(dots[fun_aux][j], {
                                "stroke-width" : dot_width*1.2
                            });
                        }
                    }
                }
            }
        }

        //        parallel_set.toFront();
        for (i=0;i<dots[fun].length;i++) {
            dots[fun][i].toFront();
        }
    }

    // Traemos el popup al frente
    popup_frame.toFront();
    popup_label.toFront();
    // Traemos las over areas al frente
    for (fun=0;fun<over_areas.length;fun++) {
        for (i=0;i<over_areas[fun].length;i++) {
            over_areas[fun][i].toFront();
        }
    }

    //spider = paper.set().push(shape,over_areas,dots,polygons);
    spider = new Object();
    spider.popup_label = popup_label;
    spider.popup_frame = popup_frame;
    spider.polygons = polygons;
    spider.dots = dots;
    spider.over_areas = over_areas;
    spider.shape = shape;
    spider.parallel_set = parallel_set;
    widget.svg = spider;
    return widget;
}