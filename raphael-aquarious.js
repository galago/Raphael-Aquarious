/*!
 * Raphael Aquarious 0.3 - JavaScript Graph Library
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
 * Función agregada para los elementos de Raphael que devuelve las
 * coordenadas de cada punto de la forma
 * @warning Solo se ha probado en el elemento path pero se supone que funciona con los demás.
 *
 * @return devuelve un objeto de pares {x,y} con las coordenadas de cada punto.
 * @author Al
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
 * Función agregada para Raphael paper que dibuja una linea horizontal o
 * con un angulo determinado respecto al origen
 *
 * @param cx origen x
 * @param cy origen y
 * @param length la longitud en pixeles de la linea
 * @param angle (opcional) angulo en grados con respecto al eje x
 * @return devuelve la linea
 * @author Al
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
    this.interval;
    // Popup
    this.popup_background_color;
    this.popup_background_opacity;
    
    // Flags
    this.has_popup;
    this.has_animation;
    
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
        " interval: " + this.interval + "\n" +
        " popup_background_color: " + this.popup_background_color + "\n" +
        " popup_background_opacity: " + this.popup_background_opacity + "\n" +
        " has_popup: " + this.has_popup + "\n" +
        " has_animation: " + this.has_animation + "\n" +
        " value: " + this.type;
    
    }
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
        this.interval = options.interval != null ? options.interval : 0;
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
            case "___template":
                this._______ = options._______ != null ? options._______ : null;
                break;
            default:
                throw "RaphaelAquarious: unknown widget type";
        }        
    }
    
    /* Constructor */
    this.constructor();   
    return this;
}

function Widget(options) {
    this.options;
    this.paper;
    this.popup;
    this.svg;
    
    this.factory = function() {
        
        switch (this.options.type) {
            case "counter":
                return drawCounter(this);
                break;
            case "gauge":
                return createGauge(this);
                break;
        }
    }
    this.updateValue = function(new_value) {
        this.options.value = new_value;        
        this.factory();
        return this;
    }    
    this.update = function(options) {
        if (options != null) this.options = new Options(options);    
        this.svg = this.factory(this.options);
        return this;
    }    
    
    this.constructor = function () {
        this.options = new Options(options);    
        this.paper = Raphael(this.options.id_holder, this.options.width, this.options.height);
        this.popup = (this.options.has_popup) ? new Popup(this.options) : null;
        this.factory(options);        
    }
    /* Constructor */
    this.constructor();
    return this;
}



/**
 *  options.color
 *  options.char_size
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
    output_value = formatCurrency(value,'',Aquarious.thousands,Aquarious.decimal,false);
    
    // Create or update
    if (counter == null) {
        counter = paper.text(width/2, height/2, output_value).attr({
            fill: color,
            font: font,
            "font-weight": "bold",
            "text-anchor": "middle"
        });
    } else { 
        if (opt.has_animation) {
            var duration = opt.interval > 0 ? opt.interval : 300;
            counter.animate(Raphael.animation({
                opacity: 0
            }, duration, opt.easing, function() {
                counter.attr({
                    text: output_value
                }).animate(Raphael.animation({
                    opacity: 1
                }, duration, opt.easing).delay(opt.delay));    
            }).delay(opt.delay));  
        
        
        } else {
            counter.attr({
                text: output_value
            });
        }
    }
    
    // Reescalamos si la fuente es demasiado grande para la caja hasta que quepa en ella sin clipping
    // Da problemas de rendimiento"font-weight": 5,
    if (!fixed_size) {
        do {
            font = char_size + "px " + Aquarious.font_family;
            counter.attr({
                font: font
            });
            char_size-=5;
        } while (counter.getBBox().width > width || counter.getBBox().height > height);
    }
    
    widget.svg = counter;   
    return widget;
}



/**
 *  options.color
 *  options.no_caption
 *  options.easing
 *  options.delay
 *  options.interval
 *  options.label
 **/
function createGauge(widget) {
    var gauge = widget.svg,
    paper = widget.paper,
    opt = widget.options,
    width = opt.width,
    height = opt.height,
    value = opt.value,
    
    background, foreground, caption,
    has_caption = opt.has_caption,
    // Si hay caption dejamos un 25% de la altura para pintarlo
    gauge_height = has_caption ? height * 0.85 : height,
    padding = 20,
    radius = Math.min(width/2,gauge_height) - padding*2,
    pos_x = width/2,
    pos_y = radius + padding,
    percent_value = Math.round(value * 100),
    //        stroke_width = opt != null && opt.stroke_width != null
    //              ? opt.stroke_width : radius/30,
    
    // Animation
    easing = opt.easing,
    ms_delay = opt.delay,
    ms_interval = opt.interval!=0 ? opt.interval: 3000,
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
        return {text: Math.round(val) + "% " + label};
    };


    background = paper.path().attr({
        segment: [pos_x, pos_y, radius, 0, 180]
    }).attr({
        "stroke-opacity": 0,
        fill: "#EEE"
    });
    
    // Create or update
    if (gauge == null) {
        
    } else {
        
    }
    
    
    if (opt.has_animation) {
        // Initial State
        foreground = paper.path().attr({
            segment: [pos_x, pos_y, radius, 0, 0]
        }).attr({
            "stroke-opacity": 0,
            "stroke-linejoin": "round"
        });
        // Final State
        foreground.animate(Raphael.animation({
            segment: [pos_x, pos_y, radius, 0, value]
        }, ms_interval, easing).delay(ms_delay));
    } else {
        // Final State
        foreground = paper.path().attr({
            segment: [pos_x, pos_y, radius, 0, value]
        }).attr({
            "stroke-opacity": 0,
            "stroke-linejoin": "round"
        });
    }
    
    if (has_caption) {
        var char_size = radius * 0.25;
        if (char_size < 20) char_size = 20;
        var font = char_size+ "px " + Aquarious.font_family,
        color = "#CCC";
        
        caption = paper.text(pos_x, pos_y + char_size/1.5, percent_value + "% " + label).attr({
            fill: color,
            font: font,
            "text-anchor": "middle",
            value: 0
        });
        caption.animate(Raphael.animation({value: percent_value}, ms_interval, easing).delay(ms_delay));
    }
    
    gauge = paper.set().push(background, foreground, caption);
    widget.svg = gauge;
    return widget;
}





/**
 * Crea una barra horizontal formada por n niveles que representa un valor dentro
 * del rango por medio de un código de colores.
 *
 * @param paper el canvas Raphael donde se dibujará la barra
 * @param levels int el número total de niveles que tendrá la barra
 * @param value int el valor dentro del rango 0 levels-1
 * @param total_width int la anchura en píxeles de la barra
 * @return bar el objeto con la barra y sus componentes internos
 * @author Al
 */
function createBar(paper, levels, value, total_width) {
    var i, x = 5, y = 35,
    final_pos,
    rect_width = ((total_width-5)/levels) - 4,
    rect_height = 40,
    rect_corner_radius = 5,
    gap = 4 + rect_width,
    stroke_width = 2,
    h=0, s= 100, b=50,
    h_inc = 120/levels,
    pointer_color = "#333",
    bar = [],
    pointer_path,
    pointer,
    anim;
    
    // Dibuja la barra con tantos rectángulos como levels
    for (i=0;i<levels;i++) {
        bar[i] = paper.rect(x, y, rect_width, rect_height, rect_corner_radius)
        .attr({
            "stroke-width": stroke_width,
            fill: Raphael.hsl(h, s, b)
        });
        x+=gap;
        h+=h_inc;
    //alert(h+" "+s+" "+b+" "+Raphael.hsb(h, 100, 50));
    }
    
    // Dibuja el puntero triangular y lo posiciona en value
    final_pos = value*gap;
    pointer_path = "M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z";
    pointer = paper.path(pointer_path).attr({
        fill: pointer_color,
        stroke: "none",
        transform: "T"+(-11+(rect_width/2))+"0,10S1.8"
    });
    
    anim = Raphael.animation({
        transform: ["...T", final_pos, 0]
    }, 2500, "<>");
    pointer.animate(anim);
    for (i=0;i<levels;i++) {
        bar[i].animateWith(pointer,anim,{})
    }
    
    bar.pointer = pointer;
    paper.renderfix();
    return bar;
}


function createBarChart (paper, width, height, chart_type, values, options) {
    var graph_width,
        graph_height,
        bar_x, 
        bar_y,
        bar_width,
        bar_height,
        bar_thickness = "variable segun el numero de valores";
        
        if (chart_type == 'V') {
            bar_width = bar_thickness;
            bar_height = 0;
        }
        else if (chart_type == 'H') {
            bar_width = 0;
            bar_height = bar_thickness;
        } else return;
        
        // Para todas los valores creamos una barra de tamanio 0 que ira creciendo segun sea su valor
        
}



/**
 * Crea una gráfica de dos ejes x,y. El eje x acetpa valores continuos pero no así el eje y
 *
 * @param paper Paper el canvas Raphael donde se dibujará la barra
 * @param width int la anchura en píxeles de la gráfica
 * @param height int la altura en píxeles de la gráfica
 * @param values (polimorfico) array con pares {x,y} que representan los valores en la grágica
 *                              OR
 *                             array de arrays con pares {x,y} para dibujar multiples funciones en el mismo eje
 * @param options object (opcional){
 *            value_text String el texto que saldrá en el popup relacionado con los valores
 *            economy boolean si es {@code true} creará la gráfica para valores de moneda
 *                    con saltos proporcionales de 500,1000,5000,10000... como techo del eje x
 *            economy_max int el valor maximo antes de pasar a saltos proporcionales como techo del eje x
 *            no_fill boolean si es {@code true} NO pintara un relleno semitransparente bajo la linea del valor al origen
 *            function_line_colors (si se usan varias funciones es obligatorio) array de Strings con los colores de cada linea en #rgbhex
 *            function_line_width number el grosor de las lineas de funcion
 *            function_dot_width numberel grosor de los puntos de funcion
 *            popup_background String el color del fondo del popup en #rgbhex
 *            popup_opacity float la transparencia del fondo del popup
 *            interval int numero de milisegundos entre cada nuevo trazo
 *            delay int numero de milisegundos que tarda la animacion en comenzar
 *
 * @return graph el objeto con la gráfica y sus componentes internos
 * @author Al
 */
function create2AxisGraph (paper, width, height, values, options) {
    var i, x, y, y_value, aux_value,
    x_graph,
    y_graph = 20,
    x_margin = 10,
    y_margin = 25,
    graph_width,
    graph_height,
    // TODO ahora mismo no se usa ya que toma los valores de x de la primera funcion
    // esta listo para usarse en el bucle principal.
    values_x = [],
    multifun = values[0] instanceof Array,
    fun,
    fun_aux,
    economy = options != null && options.economy != null && options.economy
    ? true : false,
    economy_min = 500,
    economy_max = options != null && options.economy_max != null
    ? options.economy_max : -1,
    max_x = 0,
    max_y = 0,
    min_y = 0,
    base = 1,
    ceiling,
    gaps_y,
    gaps_x,
    gaps_x_frequency,
    paths = [],
    x_aux = [],
    y_aux = [],
    path_string = [],
    path_string_fill,
    line_stroke_width = .2,
    function_line_width = options != null && options.function_line_width != null
    ? options.function_line_width : 4,
    function_dot_width = options != null && options.function_dot_width != null
    ? options.function_dot_width : 4,
    color = options != null && options.function_line_colors != null
    ? options.function_line_colors : new Array(Aquarious.color),
    ms_delay = options != null && options.delay != null
    ? options.delay : 0,
    ms_interval = options != null && options.interval != null
    ? options.interval : 600,
    horizontal_axis_lines,
    fill,
    dots = [],
    over_areas = [],
    over_rect_width,
    graph = paper.set();
    // Si solo hay una funcion a dibujar, la metemos en un array para mantener la
    // uniformidad de acceso independientemente del numero de funciones.
    if (!multifun) values = new Array(values);
    // popup var
    var in_text,
    value_text = options != null && options.value_text != null
    ? " "+options.value_text : "",
    popup_background = options != null && options.popup_background != null
    ? options.popup_background : "#000",
    popup_opacity = options != null && options.popup_opacity != null
    ? options.popup_opacity : .7,
    leave_timer, is_label_visible = false,
    label = paper.set();
    label.push(paper.text(60, 12, "x_value").attr(Aquarious.txt));
    y=30;
    for (i=0;i<values.length;i++) {
        label.push(paper.text(60, y, "y_value#i").attr(Aquarious.txt1).attr({
            fill: color[0],
            "font-weight": "bold"
        }));
        y+=15;
    }
    label.hide();
    var frame = paper.popup(100, 100, label, "right").attr({
        fill: popup_background,
        stroke: "#666",
        "stroke-width": 2,
        "fill-opacity": popup_opacity
    }).hide();
    // UI labels
    switch (Aquarious.lang_ui) {
        case "ES":
            in_text = " en";
            break;
        default:
            in_text = " in";
    }
    // Detectamos los máximos en función de los valores de entrada y se amplian en un pequeño margen
    // Tambien rellenamos el array con todos los posibles valores del eje x
    for (fun=0;fun<values.length;fun++) {
        for (i=0;i<values[fun].length;i++) {
            if (max_x < values[fun][i].x) max_x = values[fun][i].x;
            if (max_y < values[fun][i].y) max_y = values[fun][i].y;
            if (min_y > values[fun][i].y) min_y = values[fun][i].y;
            if (!inArray(values_x,values[fun][i].x)) values_x.push(values[fun][i].x);
        }
    }
    values_x.sort();
    
    /* Si la gráfica es de valores monetarios los márgenes máximos
     * estarán predefinidos para tener un look&feel consistente.
     */
    if (economy) {
        gaps_y = 5;
        if (max_y > 0) base = Math.floor(Math.log(max_y)/Math.log(10));
        ceiling = (max_y < economy_min) ? economy_min : Math.pow(10,base)*5;
        if (economy_max > -1 && ceiling >= economy_max) {
            ceiling = Math.pow(10,base);
            while (max_y >= ceiling) ceiling+=Math.pow(10,base);
        //while (max_y >= ceiling) ceiling+=Math.pow(10,base-1)*5;
        }
        else {
            if (max_y >= ceiling) ceiling*=2;
        }
    }
    // En el resto de casos el máximo tendrá un margen del 20% sobre el valor máximo.
    else {
        gaps_y = 6;
        ceiling = (max_y == 0) ? 6:Math.ceil(max_y*1.2);
        while((typeof((ceiling/gaps_y))=='number') && ((ceiling/gaps_y).toString().indexOf('.')!=-1)) ceiling++;
    }
    
    // Dibuja las líneas de referencia para el eje y
    x_margin = x_margin*(String(ceiling).length);
    x_graph = x_margin+12;
    graph_width = width - x_graph;
    graph_height = height - 60;
    aux_value = gaps_y;
    over_rect_width = width/values_x.length;
    paper.setStart();
    // Dibuja los valores del eje y
    for (i=0;i<=gaps_y;i++) {
        y = y_graph + graph_height/gaps_y*i;
        // Valores de referencia en eje y
        paper.text(x_margin,y,formatCurrency((ceiling/gaps_y*aux_value--),'',Aquarious.thousands,Aquarious.decimal,false)).attr(Aquarious.txt2).attr({
            "text-anchor": "end"
        });
        // Lineas horizontales de referencia
        paper.path("M"+x_graph+" "+y+"H"+(width)).attr({
            "stroke-width": line_stroke_width
        });
    }
    horizontal_axis_lines = paper.setFinish();
    
    // Dejamos un 5% del ancho a cada lado para dejar aire entre los valores y el final del canvas _|__graph_width__|_
    graph_width -= graph_width*.10;
    // Calcula el numero de valores de referencia en el eje x dependiendo del numero de valores,
    // el tamanio del grafico y la longitud del string de referencia. (un char 14px de media 7.5px wide)
    gaps_x = Math.floor(graph_width / (values_x[values_x.length-1].toString().length*10));
    if (gaps_x > values_x.length) gaps_x = values_x.length;
    gaps_x_frequency = Math.ceil(values_x.length / gaps_x);
    
    // Dibuja las líneas de referencia para el eje x además de las líneas del gráfico en función de las funciones y sus valores
    for (fun=0;fun<values.length;fun++) {
        dots[fun] = [];
        paths[fun] = [];
        over_areas[fun] = [];
        
        x = x_graph + graph_width*.05 - graph_width/(values[fun].length-1);
        
        for (i=0;i<values[fun].length;i++) {
            x += graph_width/(values[fun].length-1);
            //x = x_graph + graph_width/values[fun].length*i + x_margin;
            // En la primera pasada dibujamos el eje x
            if (fun == 0) {
                // Si hay muchos valores diferentes, no se dibujan todas las referencias por cuestiones minimalistas
                if (i%gaps_x_frequency == 0) {
                    paper.text(x,y+y_margin,values[fun][i].x).attr(Aquarious.txt2);
                    paper.path(Raphael.format("M{0} {1}V{2}", x, y+8, graph_height+20)).attr({
                        "stroke-width": line_stroke_width
                    });
                }
            }
            // Dibuja la linea de la gráfica
            y_value = y_graph + Math.abs(graph_height - (graph_height/ceiling)*values[fun][i].y);
            if (i < values[fun].length-1) {
                path_string[i] = "M"+x+" "+y_value+" L";
                paths[fun][i] = paper.path(path_string[i]).attr({
                    stroke: color[fun],
                    "stroke-width" : function_line_width,
                    "stroke-linejoin": "round"
                });
            }
            if (i>0) {
                path_string[i-1] += x+" "+y_value+"z";
                paths[fun][i-1].animate(Raphael.animation({
                    path:path_string[i-1]
                }, ms_interval-300, "<>").delay(ms_delay-200));
            }
            
            x_aux[i] = x;
            y_aux[i] = y_value;
            // Dibuja las lineas multiples en caso de que varios valores tengan los mismos valores entre dos puntos
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
                // Primero se hace una pasada por todas las funciones para determinar el numero de lineas que se necesitan
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
                // si es impar tan solo cambiamos el grosor de la linea que corresponde para superponerla con las pares
                if (number_lines > 1 && number_lines%2 == 1) {
                    paths[fun][i-1].attr({
                        "stroke-width" : function_line_width/number_lines
                    });
                }
                // ya conocido el numero de lineas a dibujar, si son pares, se dibujan
                if (number_lines > 1 && number_lines%2 == 0) {
                    fun_index.push(fun);
                    angle = Raphael.angle(x_aux[i-1],y_aux[i-1],x_aux[i],y_aux[i]);
                    path_aux_size = function_line_width/2;
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
                            "stroke-width" : (function_line_width/number_lines)+.5
                        });
                        path_string_aux += Raphael.format("{0} {1}z", point_aux_end.x, point_aux_end.y);
                        parallel1.animate(Raphael.animation({
                            path: path_string_aux
                        }, ms_interval-300, "<>").delay(ms_delay-200));
                        // linea 2
                        point_aux_origin = perpendicular2_origin.getPointAtLength(gap);
                        point_aux_end = perpendicular2_end.getPointAtLength(gap);
                        path_string_aux = Raphael.format("M{0},{1} L", point_aux_origin.x, point_aux_origin.y);
                        parallel2 = paper.path(path_string_aux).attr({
                            stroke: color[fun_index[j+Math.floor(number_lines/2)]],
                            "stroke-width" : (function_line_width/number_lines)+.5
                        });
                        path_string_aux += Raphael.format("{0} {1}z", point_aux_end.x, point_aux_end.y);
                        parallel2.animate(Raphael.animation({
                            path: path_string_aux
                        }, ms_interval-300, "<>").delay(ms_delay-200));
                        gap += inc;
                    }
                    // Ocultamos los objetos que estan debajo para que no hagan una fea aberracion cromatica debido a la suerposicion
                    dots[fun_index[fun_index_pointer]][i-1].animate(Raphael.animation({
                        "stroke-width" : 0//function_dot_width*2
                    }, ms_interval-300, ">").delay(ms_delay-200));
                    dots[fun_index[fun_index_pointer]][i].animate(Raphael.animation({
                        "stroke-width" : 0
                    }, ms_interval-300, ">").delay(ms_delay-200));
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
            dots[fun][i] = paper.circle(x,y_value,0).attr({
                stroke: color[fun],
                "stroke-width": function_dot_width,
                fill: color[fun]
            })
            .animate(Raphael.animation({
                r: function_dot_width
            }, 1000, 'elastic').delay(ms_delay));
            ms_delay+=ms_interval;
            // Dibuja un rectángulo transparente para gestionar los eventos over
            if (multifun) {
                over_areas[fun][i] = paper.rect(x-(over_rect_width/2), y_value-8, over_rect_width, 16)
                .attr({
                    stroke: "none",
                    fill: color[fun],
                    "fill-opacity": 0
                });
            }
            else {
                over_areas[fun][i] = paper.rect(x-(over_rect_width/2), y_margin, over_rect_width, graph_height)
                .attr({
                    stroke: "none",
                    fill: color[fun],
                    "fill-opacity": 0
                });
            }
            (function (x, y, index, fun_index) {
                over_areas[fun_index][i].mouseover(function() {
                    var i, fun, lx, ly, ppp, anim;
                    dots[fun_index][index].animate({
                        transform: 's1.5',
                        fill: "#fff"
                    },200, '>');
                    clearTimeout(leave_timer);
                    if (economy)
                        label[0].attr({
                            text: formatCurrency(values[fun_index][index].y,Aquarious.currency,Aquarious.thousands,Aquarious.decimal,false)
                        });
                    else
                        label[0].attr({
                            text: values[fun_index][index].y + value_text + (value_text != "" && values[fun_index][index].y != 1 ? "s" : "") + in_text
                        });
                    label[1].attr({
                        text: values[fun_index][index].x,
                        fill: color[fun_index]
                    });
                    // Si se solapan lineas o puntos se gestionan para su correcta visualizacion
                    ly = 45;
                    for (fun=0;fun<values.length-1;fun++) {
                        if (fun != fun_index &&
                            values[fun][index].x == values[fun_index][index].x &&
                            values[fun][index].y == values[fun_index][index].y) {
                            dots[fun_index][index].animate({
                                transform: 's1.8',
                                fill: color[fun]
                            },200, '>');
                            label[fun+2].attr({
                                text: values[fun][index].x,
                                fill: color[fun],
                                opacity: 1,
                                y: ly
                            });
                            ly+=15;
                        //dots[fun][index].animate({transform: 's2.8', fill: color[fun]},200, '>');
                        }
                        else {
                            label[fun+2].attr({
                                opacity: 0,
                                y: 30
                            });
                        }
                    }
                    // Dibuja el popup balloon
                    var side = "bottom";
                    if (y + frame.getBBox().height > graph_height) {
                        side = "top";
                    }
                    ppp = paper.popup(x, y, label, side, 1);
                    anim = Raphael.animation({
                        path: ppp.path,
                        transform: ["t", ppp.dx, ppp.dy]
                    }, 250 * is_label_visible);
                    // Calcula las nuevas coordeandas de los elementos del popup
                    lx = label[0].transform()[0][1] + ppp.dx;
                    ly = label[0].transform()[0][2] + ppp.dy;
                    frame.show().stop().animate(anim);
                    
                    for (i=0;i<label.length;i++) {
                        label[i].show().stop().animateWith(frame, anim, {
                            transform: ["t", lx, ly]
                        }, 250 * is_label_visible);
                    }
                    is_label_visible = true;
                });
                over_areas[fun_index][i].mouseout(function() {
                    for (var i=1;i<values.length;i++) {
                        label[i+1].attr({
                            opacity: 0
                        });
                    }
                    dots[fun_index][index].animate({
                        transform: 's1',
                        fill: color[fun_index]
                    },400, '<');
                    leave_timer = setTimeout(function () {
                        frame.hide();
                        label.hide();
                        is_label_visible = false;
                    }, 1);
                });
            })(x, y_value, i, fun);
        }
        
        // Dibuja el relleno del path de la funcion al eje
        if (!(options != null && options.no_fill != null && options.no_fill == true)) {
            fill = paper.path(path_string_fill+" "+x+" "+y+"z").attr({
                stroke: "none",
                fill: color[fun],
                "fill-opacity": 0.2,
                opacity: 0
            })
            .animate(Raphael.animation({
                opacity: 1
            }, 1000, "<>").delay(ms_delay));
        }
        // Pone los puntos por delante para que no esten por detras del fill
        for (i=0;i<dots[fun].length;i++) {
            dots[fun][i].toFront();
        }
        paper.renderfix();
    }
    
    //if (fun == values.length-1) {
    //   // Si se solapan lineas o puntos se hace
    //   for (fun=0;fun<values.length-1;fun++) {
    //       for (i=0;i<values[fun].length;i++) {
    //           if (values[fun][i].x == values[values.length-1][i].x && values[fun][i].y == values[values.length-1][i].y) {
    //               (function (x, y, index, fun_index) {
    //                   over_areas[values.length-1][index].mouseover(function() {
    //                        dots[values.length-1][index].animate({transform: 's1.8', fill: color[fun_index]},200, '>');
    //                        label.push(paper.text(60, 50, values[fun_index][index].x).attr(Aquarious.txt1).attr({fill: color[fun_index], "font-weight": "bold"}));
    //                   });
    //               })(0, 0, i, fun);
    //           }
    //       }
    //   }
    //}
    
    // Traemos el popup al frente
    frame.toFront();
    label.toFront();
    // Traemos las over areas al frente. Siempre tienen que ser los objetos mas al frente para no interferir con su cometido
    for (fun=0;fun<over_areas.length;fun++) {
        for (i=0;i<over_areas[fun].length;i++) {
            over_areas[fun][i].toFront();
        }
    }
    
    graph.horizontal_axis_lines = horizontal_axis_lines;
    graph.paths = paths;
    graph.fill = fill;
    graph.dots = dots;
    graph.over_areas = over_areas;
    return graph;
}

/**
 * Dibuja la araña en función al número de valores y al número de niveles posibles.
 * A continuación dibuja la función del gráfico.
 *
 * @param paper the Raphael paper holder
 * @param labels String[] La forma geométrica tendrá tantos lados como el numero de etiquetas
 * @param values int[] El rango de {@code 0} a {@code values} de valores posibles que cada nivel podrá tener
 * @param max_value int El valor máximo de la función, si algún valor del array lo supera se redondeará a este
 * @param options object (opcional){
 *            value_text String el texto que saldrá en el popup relacionado con los valores
 *            growing_interval int la distancia en píxeles de un valor a otro
 *            function_line_colors (si se usan varias funciones es obligatorio) array de Strings con los colores de cada linea en #rgbhex
 *            function_line_width number el grosor de las lineas de funcion
 *            function_dot_width numberel grosor de los puntos de funcion
 *            popup_background String el color del fondo del popup en #rgbhex
 *            popup_opacity float la transparencia del fondo del popup
 *            delay int numero de milisegundos que tarda la animacion en comenzar
 *            ms_interval int numero de milisegundos entre cada nuevo trazo
 *
 * @return spider an object with the spider and it's components
 * @author Al
 */
function createSpider(paper, labels, values, max_value, options) {
    var i,
    multifun = values[0] instanceof Array,
    fun = 0,
    fun_aux,
    function_line_width = options != null && options.function_line_width != null
    ? options.function_line_width : 4,
    function_dot_width = options != null && options.function_dot_width != null
    ? options.function_dot_width : 4,
    stroke_width = .8,
    stroke_color = "#BBB",
    levels = labels.length < 3 ? 3 : labels.length,
    interval = options != null && options.growing_interval != null
    ? options.growing_interval : 30,
    origin_x = max_value*interval+150,
    origin_y = max_value*interval+100,
    polygon_radius = 10,
    line_origin_coord,
    spider = paper.set(),
    polygons = paper.set(),
    labels_graph = [],
    txt_levels = {
        font: '15px Helvetica, Arial',
        fill: stroke_color,
        "text-anchor": "start"
    },
    text_align = "middle";
    
    for (i=0;i<max_value;i++) {
        // Raphael:: dibuja tantos polígonos como niveles, cada uno con un radio mayor
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
    line_origin_coord = paper.polygon(origin_x, origin_y, polygon_radius, levels).hide().getCornersArray();
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
        
        labels_graph[i] = paper.text(line_origin_coord[i].x,line_origin_coord[i].y,labels[i])
        .attr(Aquarious.txt2).attr({
            "text-anchor": text_align
        });
    }
    
    
    // crea el atributo levels y max_value dentro del objeto spider
    spider.levels = polygons;
    spider.max_value = max_value;
    
    
    // Dibuja el gráfico de la función
    var j, coord_x, coord_y,
    level,
    shape,
    shape_points_array = [],
    shape_points,
    x_aux = [],
    y_aux = [],
    dots = [],
    over_areas = [],
    over_rect_width = 40,
    parallel_set = paper.set(),
    fill_opacity = options != null && options.no_fill != null && options.no_fill == true ? 0 : 0.2,
    color = options != null && options.function_line_colors != null
    ? options.function_line_colors : new Array(Aquarious.color),
    ms_delay = options != null && options.delay != null
    ? options.delay : 100,
    ms_interval = options != null && options.interval != null
    ? options.interval : 1500;
    // Si solo hay una funcion a dibujar, la metemos en un array para mantener la
    // uniformidad de acceso independientemente del numero de funciones.
    if (!multifun) values = new Array(values);
    // popup var
    var in_text,
    value_text = options != null && options.value_text != null
    ? " "+options.value_text : "",
    popup_background = options != null && options.popup_background != null
    ? options.popup_background : "#000",
    popup_opacity = options != null && options.popup_opacity != null
    ? options.popup_opacity : .7,
    leave_timer, is_label_visible = false,
    label = paper.set(),
    label_heights = [];
    // Metemos en una variable los labels ocultos para calcular tamanios en el posicionamiento del popup y sus label
    for (i=0;i<labels.length;i++) {
        shape = paper.text(0,0,labels[i]).attr(Aquarious.txt).attr({
            "font-weight": "bold"
        });
        label_heights[i] = shape.getBBox().height;
        shape.remove();
    }
    label.push(paper.text(60, 12, "x_value").attr(Aquarious.txt));
    y=30;
    for (i=0;i<values.length;i++) {
        label.push(paper.text(60, y, "y_value#i").attr(Aquarious.txt1).attr({
            fill: color[0],
            "font-weight": "bold"
        }));
        y+=label_heights[i];
    }
    label.hide();
    var frame = paper.popup(100, 100, label, "right").attr({
        fill: popup_background,
        stroke: "#666",
        "stroke-width": 2,
        "fill-opacity": popup_opacity
    }).hide();
    // UI labels
    switch (Aquarious.lang_ui) {
        case "ES":
            in_text = " en";
            break;
        default:
            in_text = " in";
    }
    
    for (fun=0;fun<values.length;fun++){
        shape_points_array[fun] = [];
        for (i=0;i<values[fun].length;i++) {
            level = values[fun][i]-1;
            if (level>=0)  {
                if (level >= max_value)
                    shape_points_array[fun].push(spider.levels[max_value-1].getCornersArray()[i]);
                else
                    shape_points_array[fun].push(spider.levels[level].getCornersArray()[i]);
            }
            else shape_points_array[fun].push({
                x:origin_x,
                y:origin_y
            });
        }
    }
    
    for (fun=0;fun<shape_points_array.length;fun++){
        shape_points = "M";
        dots[fun] = [];
        over_areas[fun] = [];
        for (i=0;i<shape_points_array[fun].length;i++) {
            coord_x = shape_points_array[fun][i].x;
            coord_y = shape_points_array[fun][i].y;
            shape_points+=coord_x+","+coord_y+" L";
            
            x_aux[i] = coord_x;
            y_aux[i] = coord_y;
            // Raphael:: dibuja un circulo por cada coordenada para simbolizar "el punto gordo"
            dots[fun][i] = paper.circle(origin_x,origin_y,0)
            .attr({
                stroke: color[fun],
                "stroke-width": function_dot_width,
                fill: color[fun]
            })
            .animate(Raphael.animation({
                cx: coord_x,
                cy: coord_y,
                r: function_dot_width
            }, ms_interval, '<>').delay(ms_delay+=200));
            
            // Dibuja un rectangulo transparente para gestionar los eventos over
            //over_rect_width = values[fun][i]*16 < 80 && values[fun][i]*16 > 18 ? values[fun][i]*16 : 40;
            over_rect_width = 32;
            over_areas[fun][i] = paper.rect(coord_x-(over_rect_width/2), coord_y-(over_rect_width/2), over_rect_width, over_rect_width)
            .attr({
                stroke: "none",
                fill: color[fun],
                "fill-opacity": 0
            });
            (function (x, y, index, fun_index) {
                over_areas[fun_index][i].mouseover(function() {
                    var lx, ly;
                    dots[fun_index][index].animate({
                        transform: 's1.5',
                        fill: "#fff"
                    },200, '>');
                    clearTimeout(leave_timer);
                    label[0].attr({
                        text: values[fun_index][index] + value_text + (value_text != "" && values[fun_index][index] != 1 ? "s" : "") + in_text
                    });
                    ly = 22 + label_heights[index]/2;
                    label[1].attr({
                        text: labels[index],
                        fill: color[fun_index],
                        y: ly
                    });
                    // Si se solapan lineas o puntos se gestionan para su correcta visualizacions
                    for (fun=0;fun<values.length-1;fun++) {
                        if (fun != fun_index &&
                            shape_points_array[fun][index].x == shape_points_array[fun_index][index].x &&
                            shape_points_array[fun][index].y == shape_points_array[fun_index][index].y) {
                            ly += label_heights[index]
                            dots[fun_index][index].animate({
                                transform: 's1.8',
                                fill: color[fun]
                            },200, '>');
                            label[fun+2].attr({
                                text: labels[index],
                                fill: color[fun],
                                opacity: 1,
                                y: ly
                            });
                        //dots[fun][index].animate({transform: 's2.8', fill: color[fun]},200, '>');
                        }
                        else {
                            label[fun+2].attr({
                                opacity: 0,
                                y: 30
                            });
                        }
                    }
                    // Dibuja el popup balloon
                    var side = "right";
                    if (x + frame.getBBox().width > 333) {
                        side = "left";
                    }
                    var ppp = paper.popup(x, y, label, side, 1),
                    anim = Raphael.animation({
                        path: ppp.path,
                        transform: ["t", ppp.dx, ppp.dy]
                    }, 250 * is_label_visible);
                    // Calcula las nuevas coordeandas de los elementos del popup
                    lx = label[0].transform()[0][1] + ppp.dx;
                    ly = label[0].transform()[0][2] + ppp.dy;
                    frame.show().stop().animate(anim);
                    
                    for (i=0;i<label.length;i++) {
                        label[i].show().stop().animateWith(frame, anim, {
                            transform: ["t", lx, ly]
                        }, 250 * is_label_visible);
                    }
                    is_label_visible = true;
                    is_label_visible = true;
                });
                over_areas[fun_index][i].mouseout(function() {
                    for (var i=1;i<values.length;i++) {
                        label[i+1].attr({
                            opacity: 0
                        });
                    }
                    dots[fun_index][index].animate({
                        transform: 's1',
                        fill: color[fun_index]
                    },400, '<');
                    leave_timer = setTimeout(function () {
                        frame.hide();
                        label.hide();
                        is_label_visible = false;
                    }, 1);
                });
            })(coord_x, coord_y, i, fun);
        }
        shape_points+="z";
        shape = paper.path(shape_points)
        .attr({
            stroke : color[fun],
            fill: color[fun],
            "fill-opacity": fill_opacity,
            opacity: 0,
            "stroke-width": function_line_width,
            "stroke-linejoin": "round"
        })
        .animate(Raphael.animation({
            opacity: 1
        }, ms_interval+400, "<>").delay(ms_delay+=1300));
        
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
                    path_aux_size = function_line_width/2;
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
                            "stroke-width" : (function_line_width/number_lines)+.5,
                            "stroke-opacity": 0
                        });
                        parallel1.animate(Raphael.animation({
                            "stroke-opacity": 1
                        }, ms_interval-300, "<>").delay(ms_delay)).toFront();
                        // linea 2
                        point_aux_origin = perpendicular2_origin.getPointAtLength(gap);
                        point_aux_end = perpendicular2_end.getPointAtLength(gap);
                        path_string_aux = Raphael.format("M{0},{1} L{2} {3}z", point_aux_origin.x, point_aux_origin.y, point_aux_end.x, point_aux_end.y);
                        parallel2 = paper.path(path_string_aux).attr({
                            stroke: color[fun_index[k+Math.floor(number_lines/2)]],
                            "stroke-width" : (function_line_width/number_lines)+.5,
                            "stroke-opacity": 0
                        });
                        parallel2.animate(Raphael.animation({
                            "stroke-opacity": 1
                        }, ms_interval-300, "<>").delay(ms_delay)).toFront();
                        gap += inc;
                        // Metemos las lineas en un set para poder mostrarlas u ocultarlas en cualquier momento
                        parallel_set.push(parallel1);
                        parallel_set.push(parallel2);
                    }
                    // Ocultamos los objetos que estan debajo para que no hagan una fea aberracion cromatica debido a la suerposicion
                    dots[fun_index[fun_index_pointer]][i-1].animate(Raphael.animation({
                        "stroke-width" : 0//function_dot_width*2
                    }, ms_interval-300, ">").delay(ms_delay-200));
                    dots[fun_index[fun_index_pointer]][j].animate(Raphael.animation({
                        "stroke-width" : 0
                    }, ms_interval-300, ">").delay(ms_delay-200));
                    perpendicular1_origin.remove();
                    perpendicular1_end.remove();
                    perpendicular2_origin.remove();
                    perpendicular2_end.remove();
                }
                // si es impar tan solo cambiamos el grosor de la linea que corresponde para superponerla con las pares
                if (number_lines > 1 && number_lines%2 == 1) {
                    path_string_aux = Raphael.format("M{0},{1} L{2} {3}z", shape_points_array[fun][i-1].x, shape_points_array[fun][i-1].y, shape_points_array[fun][j].x, shape_points_array[fun][j].y);
                
                }
            }
        }
        
        //        parallel_set.toFront();
        for (i=0;i<dots[fun].length;i++) {
            dots[fun][i].toFront();
        }
    }
    
    // Traemos el popup al frente
    frame.toFront();
    label.toFront();
    // Traemos las over areas al frente
    for (fun=0;fun<over_areas.length;fun++) {
        for (i=0;i<over_areas[fun].length;i++) {
            over_areas[fun][i].toFront();
        }
    }
    
    for (i=0;i<spider.levels.length;i++) {
        spider.levels[i].mouseover(function() {
            this.animate({
                "stroke-width": 1.5
            },200, '<');
        });
        spider.levels[i].mouseout(function() {
            this.animate({
                "stroke-width": .8
            },200, '<');
        });
        for (j=0;j<values.length;j++) {
            
        }
    }
    
    spider.dots = dots;
    spider.function_shape = shape;
    paper.renderfix();
    return spider;
}