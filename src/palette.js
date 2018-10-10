import d3 from 'd3';

/**
  * given an array containing a set of border colours, create a matching set of
  * fill colours that are 40% (default) brighter. Uses d3.color
  *
  * @method makeFillRange
  * @param  border_cols array of colours in #hexadecimal format
  * @param  val (optional) value by which to brighten the colours
  * @returns object with keys fill and border; values are scales of #hex colours
  */

export function makeFillRange ( border_cols, val = 0.4 ) {
  return {
    fill: d3.scaleOrdinal().range( border_cols.map( function (c){ return d3.color(c).brighter(val).hex(); }) ).domain( d3.extent(border_cols) ),
    border: d3.scaleOrdinal().range(border_cols).domain( d3.extent(border_cols) )
  };
}

/**
  * Given the name of a colour interpolator, returns a scale for generating the
  * colours.
  * @method makeColourScale
  * @returns d3.scale object that takes in a value and returns a colour
  */

export function makeColourScale ( colour ) {
  if ( colour.indexOf('interpolate') !== -1 ) {
    return d3.scaleSequential( d3[colour] );
  }
  else {
    return d3.scaleOrdinal().range(d3.schemeSet3).domain( d3.extent(d3.schemeSet3) );
  }
}


/**
  * extracts the interpolated colour ranges from the d3 object and attempts to
  * work out their names
  * @method getInterpolatedColours
  * @returns array of objects with keys value: interpolator and name: parsed name
  */

export function getInterpolatedColours () {

  const col_abbr = {
    B: 'Blue',
    Br: 'Brown',
    Bu: 'Blue',
    G: 'Green',
    Gn: 'Green',
    Gy: 'Grey',
    Or: 'Orange',
    P: 'Purple',
    Pi: 'Pink',
    Pu: 'Purple',
    R: 'Red',
    Rd: 'Red',
    Y: 'Yellow',
    Yl: 'Yellow',
  };

  const interpolated = ['Viridis', 'Inferno', 'Magma', 'Plasma', 'Warm', 'Cool', 'CubehelixDefault', 'Rainbow', 'Sinebow'];

  Object.keys(d3).forEach( c => {
    if (c.indexOf('scheme') !== -1) {
      let substr = c.replace('scheme','');
      if (d3.hasOwnProperty('interpolate' + substr)) {
        interpolated.push( substr );
      }
    }
  })

  return interpolated.map( c => {
    return {
      value: 'interpolate' + c,
      name: c.split( /(?=[A-Z])/ )
        .map( n => col_abbr[n] ? col_abbr[n] : n )
        .join('/')
    };
  });

}


export default makeFillRange;