;(function($$){ 'use strict';
  
  $$.Style = function( cy ){

    if( !(this instanceof $$.Style) ){
      return new $$.Style(cy);
    }

    if( !$$.is.core(cy) ){
      $$.util.error('A style must have a core reference');
      return;
    }

    this._private = {
      cy: cy,
      coreStyle: {}
    };
    
    this.length = 0;

    this.addDefaultStylesheet();
  };

  // nice-to-have aliases
  $$.style = $$.Style;
  $$.styfn = $$.Style.prototype;

  // define functions in the Style prototype
  $$.fn.style = function( fnMap, options ){
    for( var fnName in fnMap ){
      var fn = fnMap[ fnName ];
      $$.Style.prototype = fn;
    }
  };

  (function(){
    var number = $$.util.regex.number;
    var rgba = $$.util.regex.rgbaNoBackRefs;
    var hsla = $$.util.regex.hslaNoBackRefs;
    var hex3 = $$.util.regex.hex3;
    var hex6 = $$.util.regex.hex6;
    var data = function( prefix ){ return '^' + prefix + '\\s*\\(\\s*([\\w\\.]+)\\s*\\)$' };
    var mapData = function( prefix ){ return '^' + prefix + '\\s*\\(([\\w\\.]+)\\s*\\,\\s*(' + number + ')\\s*\\,\\s*(' + number + ')\\s*,\\s*(' + number + '|\\w+|' + rgba + '|' + hsla + '|' + hex3 + '|' + hex6 + ')\\s*\\,\\s*(' + number + '|\\w+|' + rgba + '|' + hsla + '|' + hex3 + '|' + hex6 + ')\\)$' };

    // each visual style property has a type and needs to be validated according to it
    $$.style.types = {
      time: { number: true, min: 0, units: 's' },
      percent: { number: true, min: 0, max: 100, units: '%' },
      zeroOneNumber: { number: true, min: 0, max: 1, unitless: true },
      nOneOneNumber: { number: true, min: -1, max: 1, unitless: true },
      nonNegativeInt: { number: true, min: 0, integer: true, unitless: true },
      size: { number: true, min: 0, enums: ['auto'] },
      bgSize: { number: true, min: 0, allowPercent: true },
      bgPos: { number: true, allowPercent: true },
      bgRepeat: { enums: ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'] },
      bgFit: { enums: ['none', 'contain', 'cover'] },
      bgClip: { enums: ['none', 'node'] },
      color: { color: true },
      lineStyle: { enums: ['solid', 'dotted', 'dashed'] },
      curveStyle: { enums: ['bezier', 'haystack'] },
      fontFamily: { regex: '^([\\w- ]+(?:\\s*,\\s*[\\w- ]+)*)$' },
      fontVariant: { enums: ['small-caps', 'normal'] },
      fontStyle: { enums: ['italic', 'normal', 'oblique'] },
      fontWeight: { enums: ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '800', '900', 100, 200, 300, 400, 500, 600, 700, 800, 900] },
      textDecoration: { enums: ['none', 'underline', 'overline', 'line-through'] },
      textTransform: { enums: ['none', 'capitalize', 'uppercase', 'lowercase'] },
      nodeShape: { enums: ['rectangle', 'roundrectangle', 'ellipse', 'triangle',
                           'square', 'pentagon', 'hexagon', 'heptagon', 'octagon', 'star'] },
      arrowShape: { enums: ['tee', 'triangle', 'square', 'circle', 'diamond', 'none'] },
      arrowFill: { enums: ['filled', 'hollow'] },
      display: { enums: ['element', 'none'] },
      visibility: { enums: ['hidden', 'visible'] },
      valign: { enums: ['top', 'center', 'bottom'] },
      halign: { enums: ['left', 'center', 'right'] },
      cursor: { enums: ['auto', 'crosshair', 'default', 'e-resize', 'n-resize', 'ne-resize', 'nw-resize', 'pointer', 'progress', 's-resize', 'sw-resize', 'text', 'w-resize', 'wait', 'grab', 'grabbing'] },
      text: { string: true },
      data: { mapping: true, regex: data('data') },
      layoutData: { mapping: true, regex: data('layoutData') },
      mapData: { mapping: true, regex: mapData('mapData') },
      mapLayoutData: { mapping: true, regex: mapData('mapLayoutData') },
      url: { regex: '^url\\s*\\(\\s*([^\\s]+)\\s*\\s*\\)|none|(.+)$' },
      propList: { propList: true }
    };

    // define visual style properties
    var t = $$.style.types;
    $$.style.properties = [
      // these are for elements
      { name: 'text-valign', type: t.valign },
      { name: 'text-halign', type: t.halign },
      { name: 'color', type: t.color },
      { name: 'content', type: t.text },
      { name: 'text-outline-color', type: t.color },
      { name: 'text-outline-width', type: t.size },
      { name: 'text-outline-opacity', type: t.zeroOneNumber },
      { name: 'text-opacity', type: t.zeroOneNumber },
      { name: 'text-decoration', type: t.textDecoration },
      { name: 'text-transform', type: t.textTransform },
      { name: 'font-family', type: t.fontFamily },
      { name: 'font-style', type: t.fontStyle },
      { name: 'font-variant', type: t.fontVariant },
      { name: 'font-weight', type: t.fontWeight },
      { name: 'font-size', type: t.size },
      { name: 'min-zoomed-font-size', type: t.size },
      { name: 'display', type: t.display },
      { name: 'visibility', type: t.visibility },
      { name: 'opacity', type: t.zeroOneNumber },
      { name: 'z-index', type: t.nonNegativeInt },
      { name: 'overlay-padding', type: t.size },
      { name: 'overlay-color', type: t.color },
      { name: 'overlay-opacity', type: t.zeroOneNumber },
      { name: 'transition-property', type: t.propList },
      { name: 'transition-duration', type: t.time },
      { name: 'transition-delay', type: t.time },

      // these are just for nodes
      { name: 'background-blacken', type: t.nOneOneNumber },
      { name: 'background-color', type: t.color },
      { name: 'background-opacity', type: t.zeroOneNumber },
      { name: 'background-image', type: t.url },
      { name: 'background-position-x', type: t.bgPos },
      { name: 'background-position-y', type: t.bgPos },
      { name: 'background-repeat', type: t.bgRepeat },
      { name: 'background-fit', type: t.bgFit },
      { name: 'background-clip', type: t.bgClip },
      { name: 'pie-size', type: t.bgSize },
      { name: 'pie-1-background-color', type: t.color },
      { name: 'pie-2-background-color', type: t.color },
      { name: 'pie-3-background-color', type: t.color },
      { name: 'pie-4-background-color', type: t.color },
      { name: 'pie-5-background-color', type: t.color },
      { name: 'pie-6-background-color', type: t.color },
      { name: 'pie-7-background-color', type: t.color },
      { name: 'pie-8-background-color', type: t.color },
      { name: 'pie-9-background-color', type: t.color },
      { name: 'pie-10-background-color', type: t.color },
      { name: 'pie-11-background-color', type: t.color },
      { name: 'pie-12-background-color', type: t.color },
      { name: 'pie-13-background-color', type: t.color },
      { name: 'pie-14-background-color', type: t.color },
      { name: 'pie-15-background-color', type: t.color },
      { name: 'pie-16-background-color', type: t.color },
      { name: 'pie-1-background-size', type: t.percent },
      { name: 'pie-2-background-size', type: t.percent },
      { name: 'pie-3-background-size', type: t.percent },
      { name: 'pie-4-background-size', type: t.percent },
      { name: 'pie-5-background-size', type: t.percent },
      { name: 'pie-6-background-size', type: t.percent },
      { name: 'pie-7-background-size', type: t.percent },
      { name: 'pie-8-background-size', type: t.percent },
      { name: 'pie-9-background-size', type: t.percent },
      { name: 'pie-10-background-size', type: t.percent },
      { name: 'pie-11-background-size', type: t.percent },
      { name: 'pie-12-background-size', type: t.percent },
      { name: 'pie-13-background-size', type: t.percent },
      { name: 'pie-14-background-size', type: t.percent },
      { name: 'pie-15-background-size', type: t.percent },
      { name: 'pie-16-background-size', type: t.percent },
      { name: 'border-color', type: t.color },
      { name: 'border-opacity', type: t.zeroOneNumber },
      { name: 'border-width', type: t.size },
      { name: 'border-style', type: t.lineStyle },
      { name: 'height', type: t.size },
      { name: 'width', type: t.size },
      { name: 'padding-left', type: t.size },
      { name: 'padding-right', type: t.size },
      { name: 'padding-top', type: t.size },
      { name: 'padding-bottom', type: t.size },
      { name: 'shape', type: t.nodeShape },

      // these are just for edges
      { name: 'source-arrow-shape', type: t.arrowShape },
      { name: 'target-arrow-shape', type: t.arrowShape },
      { name: 'source-arrow-color', type: t.color },
      { name: 'target-arrow-color', type: t.color },
      { name: 'source-arrow-fill', type: t.arrowFill },
      { name: 'target-arrow-fill', type: t.arrowFill },
      { name: 'line-style', type: t.lineStyle },
      { name: 'line-color', type: t.color },
      { name: 'control-point-step-size', type: t.size },
      { name: 'control-point-distance', type: t.size },
      { name: 'control-point-weight', type: t.zeroOneNumber },
      { name: 'curve-style', type: t.curveStyle },

      // these are just for the core
      { name: 'selection-box-color', type: t.color },
      { name: 'selection-box-opacity', type: t.zeroOneNumber },
      { name: 'selection-box-border-color', type: t.color },
      { name: 'selection-box-border-width', type: t.size },
      { name: 'panning-cursor', type: t.cursor },
      { name: 'active-bg-color', type: t.color },
      { name: 'active-bg-opacity', type: t.zeroOneNumber },
      { name: 'active-bg-size', type: t.size },
      { name: 'outside-texture-bg-color', type: t.color },
      { name: 'outside-texture-bg-opacity', type: t.zeroOneNumber }
    ];

    // allow access of properties by name ( e.g. $$.style.properties.height )
    var props = $$.style.properties;
    for( var i = 0; i < props.length; i++ ){
      var prop = props[i];
      
      props[ prop.name ] = prop; // allow lookup by name
    }

    // because the pie properties are numbered, give access to a constant N (for renderer use)
    $$.style.pieBackgroundN = 16;
  })();

  // adds the default stylesheet to the current style
  $$.styfn.addDefaultStylesheet = function(){
    // to be nice, we build font related style properties from the core container
    // so that cytoscape matches the style of its container by default
    // 
    // unfortunately, this doesn't seem work consistently and can grab the default stylesheet values
    // instead of the developer's values so let's just make it explicit for the dev for now
    //
    // delaying the read of these val's is not an opt'n: that would delay init'l load time
    var fontFamily = 'Helvetica' || this.containerPropertyAsString('font-family') || 'sans-serif';
    var fontStyle = 'normal' || this.containerPropertyAsString('font-style') || 'normal';
    var fontVariant = 'normal' || this.containerPropertyAsString('font-variant') || 'normal';
    var fontWeight = 'normal' || this.containerPropertyAsString('font-weight') || 'normal';
    var color = '#000' || this.containerPropertyAsString('color') || '#000';
    var textTransform = 'none' || this.containerPropertyAsString('text-transform') || 'none';
    var textDecoration = 'none' || this.containerPropertyAsString('text-decoration') || 'none';
    var fontSize = 16 || this.containerPropertyAsString('font-size') || 16;

    // fill the style with the default stylesheet
    this
      .selector('node, edge') // common properties
        .css({
          'text-valign': 'top',
          'text-halign': 'center',
          'color': color,
          'text-outline-color': '#000',
          'text-outline-width': 0,
          'text-outline-opacity': 1,
          'text-opacity': 1,
          'text-decoration': 'none',
          'text-transform': textTransform,
          'font-family': fontFamily,
          'font-style': fontStyle,
          'font-variant': fontVariant,
          'font-weight': fontWeight,
          'font-size': fontSize,
          'min-zoomed-font-size': 0,
          'visibility': 'visible',
          'display': 'element',
          'opacity': 1,
          'z-index': 0,
          'content': '',
          'overlay-opacity': 0,
          'overlay-color': '#000',
          'overlay-padding': 10,
          'transition-property': 'none',
          'transition-duration': 0,
          'transition-delay': 0,

          // node props
          'background-blacken': 0,
          'background-color': '#888',
          'background-opacity': 1,
          'background-image': 'none',
          'background-position-x': '50%',
          'background-position-y': '50%',
          'background-repeat': 'no-repeat',
          'background-fit': 'none',
          'background-clip': 'node',
          'border-color': '#000',
          'border-opacity': 1,
          'border-width': 0,
          'border-style': 'solid',
          'height': 30,
          'width': 30,
          'padding-top': 0,
          'padding-bottom': 0,
          'padding-left': 0,
          'padding-right': 0,
          'shape': 'ellipse',
          'pie-size': '100%',
          'pie-1-background-color': 'black',
          'pie-1-background-size': '0%',
          'pie-2-background-color': 'black',
          'pie-2-background-size': '0%',
          'pie-3-background-color': 'black',
          'pie-3-background-size': '0%',
          'pie-4-background-color': 'black',
          'pie-4-background-size': '0%',
          'pie-5-background-color': 'black',
          'pie-5-background-size': '0%',
          'pie-6-background-color': 'black',
          'pie-6-background-size': '0%',
          'pie-7-background-color': 'black',
          'pie-7-background-size': '0%',
          'pie-8-background-color': 'black',
          'pie-8-background-size': '0%',
          'pie-9-background-color': 'black',
          'pie-9-background-size': '0%',
          'pie-10-background-color': 'black',
          'pie-10-background-size': '0%',
          'pie-11-background-color': 'black',
          'pie-11-background-size': '0%',
          'pie-12-background-color': 'black',
          'pie-12-background-size': '0%',
          'pie-13-background-color': 'black',
          'pie-13-background-size': '0%',
          'pie-14-background-color': 'black',
          'pie-14-background-size': '0%',
          'pie-15-background-color': 'black',
          'pie-15-background-size': '0%',
          'pie-16-background-color': 'black',
          'pie-16-background-size': '0%',

          // edge props
          'source-arrow-shape': 'none',
          'target-arrow-shape': 'none',
          'source-arrow-color': '#bbb',
          'target-arrow-color': '#bbb',
          'source-arrow-fill': 'filled',
          'target-arrow-fill': 'filled',
          'line-style': 'solid',
          'line-color': '#bbb',
          'control-point-step-size': 40,
          'control-point-weight': 0.5,
          'curve-style': 'bezier'
        })
      .selector('$node > node') // compound (parent) node properties
        .css({
          'width': 'auto',
          'height': 'auto',
          'shape': 'rectangle',
          'background-opacity': 0.5,
          'padding-top': 10,
          'padding-right': 10,
          'padding-left': 10,
          'padding-bottom': 10
        })
      .selector('edge') // just edge properties
        .css({
          'width': 1,
        })
      .selector(':active')
        .css({
          'overlay-color': 'black',
          'overlay-padding': 10,
          'overlay-opacity': 0.25
        })
      .selector('core') // just core properties
        .css({
          'selection-box-color': '#ddd',
          'selection-box-opacity': 0.65,
          'selection-box-border-color': '#aaa',
          'selection-box-border-width': 1,
          'panning-cursor': 'grabbing',
          'active-bg-color': 'black',
          'active-bg-opacity': 0.15,
          'active-bg-size': $$.is.touch() ? 40 : 15,
          'outside-texture-bg-color': '#000',
          'outside-texture-bg-opacity': 0.125
        })
    ;
  };

  // remove all contexts
  $$.styfn.clear = function(){
    this._private.newStyle = true;

    for( var i = 0; i < this.length; i++ ){
      delete this[i];
    }
    this.length = 0;

    return this; // chaining
  };

  $$.styfn.resetToDefault = function(){
    this.clear();
    this.addDefaultStylesheet();

    return this;
  };

  // builds a style object for the 'core' selector
  $$.styfn.core = function(){
    return this._private.coreStyle;
  };

  // parse a property; return null on invalid; return parsed property otherwise
  // fields :
  // - name : the name of the property
  // - value : the parsed, native-typed value of the property
  // - strValue : a string value that represents the property value in valid css
  // - bypass : true iff the property is a bypass property
  $$.styfn.parse = function( name, value, propIsBypass, propIsFlat ){
    
    name = $$.util.camel2dash( name ); // make sure the property name is in dash form (e.g. 'property-name' not 'propertyName')
    var property = $$.style.properties[ name ];
    var passedValue = value;
    
    if( !property ){ return null; } // return null on property of unknown name
    if( value === undefined || value === null ){ return null; } // can't assign null

    var valueIsString = $$.is.string(value);
    if( valueIsString ){ // trim the value to make parsing easier
      value = $$.util.trim( value );
    }

    var type = property.type;
    if( !type ){ return null; } // no type, no luck

    // check if bypass is null or empty string (i.e. indication to delete bypass property)
    if( propIsBypass && (value === '' || value === null) ){
      return {
        name: name,
        value: value,
        bypass: true,
        deleteBypass: true
      };
    }

    // check if value is mapped
    var data, mapData, layoutData, mapLayoutData;
    if( !valueIsString || propIsFlat ){
      // then don't bother to do the expensive regex checks

    } else if(
      ( data = new RegExp( $$.style.types.data.regex ).exec( value ) ) ||
      ( layoutData = new RegExp( $$.style.types.layoutData.regex ).exec( value ) )
    ){
      var isLayout = layoutData !== undefined;
      data = data || layoutData;

      return {
        name: name,
        value: data,
        strValue: '' + value,
        mapped: isLayout ? $$.style.types.layoutData : $$.style.types.data,
        field: data[1],
        bypass: propIsBypass
      };

    } else if(
      ( mapData = new RegExp( $$.style.types.mapData.regex ).exec( value ) ) ||
      ( mapLayoutData = new RegExp( $$.style.types.mapLayoutData.regex ).exec( value ) )
    ){
      var isLayout = mapLayoutData !== undefined;
      mapData = mapData || mapLayoutData;

      // we can map only if the type is a colour or a number
      if( !(type.color || type.number) ){ return false; }

      var valueMin = this.parse( name, mapData[4]); // parse to validate
      if( !valueMin || valueMin.mapped ){ return false; } // can't be invalid or mapped

      var valueMax = this.parse( name, mapData[5]); // parse to validate
      if( !valueMax || valueMax.mapped ){ return false; } // can't be invalid or mapped

      // check if valueMin and valueMax are the same
      if( valueMin.value === valueMax.value ){
        return false; // can't make much of a mapper without a range
      
      } else if( type.color ){
        var c1 = valueMin.value;
        var c2 = valueMax.value;
        
        var same = c1[0] === c2[0] // red
          && c1[1] === c2[1] // green
          && c1[2] === c2[2] // blue
          && ( // optional alpha
            c1[3] === c2[3] // same alpha outright
            || (
              (c1[3] == null || c1[3] === 1) // full opacity for colour 1?
              &&
              (c2[3] == null || c2[3] === 1) // full opacity for colour 2?
            )
          )
        ;

        if( same ){ return false; } // can't make a mapper without a range
      }

      return {
        name: name,
        value: mapData,
        strValue: '' + value,
        mapped: isLayout ? $$.style.types.mapLayoutData : $$.style.types.mapData,
        field: mapData[1],
        fieldMin: parseFloat( mapData[2] ), // min & max are numeric
        fieldMax: parseFloat( mapData[3] ),
        valueMin: valueMin.value,
        valueMax: valueMax.value,
        bypass: propIsBypass
      };
    }

    // check the type and return the appropriate object
    if( type.number ){ 
      var units;
      var implicitUnit = 'px'; // not set => px

      if( type.units ){ // use specified units if set
        units = type.units;
      }

      if( !type.unitless ){
        if( valueIsString ){
          var unitsRegex = "px|em" + (type.allowPercent ? "|\\%" : '');
          if( units ){ unitsRegex = units; } // only allow explicit units if so set 
          var match = value.match( "^(" + $$.util.regex.number + ")(" + unitsRegex + ")?" + "$" );
          
          if( match ){
            value = match[1];
            units = match[2] || implicitUnit;
          }
          
        } else if( !units ) {
          units = implicitUnit; // implicitly px if unspecified
        }
      }

      value = parseFloat( value );

      // if not a number and enums not allowed, then the value is invalid
      if( isNaN(value) && type.enums === undefined ){
        return null;
      }

      // check if this number type also accepts special keywords in place of numbers
      // (i.e. `left`, `auto`, etc)
      if( isNaN(value) && type.enums !== undefined ){
        value = passedValue;

        for( var i = 0; i < type.enums.length; i++ ){
          var en = type.enums[i];

          if( en === value ){
            return {
              name: name,
              value: value,
              strValue: '' + value,
              bypass: propIsBypass
            };
          }
        }

        return null; // failed on enum after failing on number
      }

      // check if value must be an integer
      if( type.integer && !$$.is.integer(value) ){
        return null;
      }

      // check value is within range
      if( (type.min !== undefined && value < type.min) 
      || (type.max !== undefined && value > type.max)
      ){
        return null;
      }

      var ret = {
        name: name,
        value: value,
        strValue: '' + value + (units ? units : ''),
        units: units,
        bypass: propIsBypass 
      };

      if( type.unitless || (units !== 'px' && units !== 'em') ){
        // then pxValue does not apply
      } else {
        ret.pxValue = ( units === 'px' || !units ? (value) : (this.getEmSizeInPixels() * value) );
      }

      return ret;

    } else if( type.propList ) {

      var props = [];
      var propsStr = '' + value;      
 
      if( propsStr === 'none' ){
        // leave empty

      } else { // go over each prop

        var propsSplit = propsStr.split(',');
        for( var i = 0; i < propsSplit.length; i++ ){
          var propName = $$.util.trim( propsSplit[i] );

          if( $$.style.properties[propName] ){
            props.push( propName );
          }
        }

        if( props.length === 0 ){ return null; }

      }

      return {
        name: name,
        value: props,
        strValue: props.length === 0 ? 'none' : props.join(', '),
        bypass: propIsBypass
      };

    } else if( type.color ){
      var tuple = $$.util.color2tuple( value );

      if( !tuple ){ return null; }

      return {
        name: name,
        value: tuple,
        strValue: '' + value,
        bypass: propIsBypass
      };

    } else if( type.enums ){
      for( var i = 0; i < type.enums.length; i++ ){
        var en = type.enums[i];

        if( en === value ){
          return {
            name: name,
            value: value,
            strValue: '' + value,
            bypass: propIsBypass
          };
        }
      }

      return null;

    } else if( type.regex ){
      var regex = new RegExp( type.regex ); // make a regex from the type
      var m = regex.exec( value );

      if( m ){ // regex matches
        return {
          name: name,
          value: m,
          strValue: '' + value,
          bypass: propIsBypass
        };
      } else { // regex doesn't match
        return null; // didn't match the regex so the value is bogus
      }

    } else if( type.string ){
      // just return
      return {
        name: name,
        value: value,
        strValue: '' + value,
        bypass: propIsBypass
      };

    } else {
      return null; // not a type we can handle
    }

  };

  // create a new context from the specified selector string and switch to that context
  $$.styfn.selector = function( selectorStr ){
    // 'core' is a special case and does not need a selector
    var selector = selectorStr === 'core' ? null : new $$.Selector( selectorStr );

    var i = this.length++; // new context means new index
    this[i] = {
      selector: selector,
      properties: []
    };

    return this; // chaining
  };

  // add one or many css rules to the current context
  $$.styfn.css = function(){
    var args = arguments;

    switch( args.length ){
    case 1:
      var map = args[0];

      for( var i = 0; i < $$.style.properties.length; i++ ){
        var prop = $$.style.properties[i];
        var mapVal = map[ prop.name ];

        if( mapVal === undefined ){
          mapVal = map[ $$.util.dash2camel(prop.name) ];
        }

        if( mapVal !== undefined ){
          this.cssRule( prop.name, mapVal );
        }
      }

      break;

    case 2:
      this.cssRule( args[0], args[1] );
      break;

    default:
      break; // do nothing if args are invalid
    }

    return this; // chaining
  };

  // add a single css rule to the current context
  $$.styfn.cssRule = function( name, value ){ 
    // name-value pair
    var property = this.parse( name, value );

    // add property to current context if valid
    if( property ){
      var i = this.length - 1;
      this[i].properties.push( property );

      // add to core style if necessary
      var currentSelectorIsCore = !this[i].selector;
      if( currentSelectorIsCore ){
        this._private.coreStyle[ property.name ] = property;
      }
    }

    return this; // chaining
  };

})( cytoscape );