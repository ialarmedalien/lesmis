import d3 from 'd3';

 /**
  * given an array containing a set of border colours, create a matching set of
  * fill colours that are 40% (default) brighter. Uses d3.color
  *
  * @method makeFillRange
  * @param  border_cols array of colours in #hexadecimal format
  * @param  val (optional) value by which to brighten the colours
  * @returns object with keys fill and border; values are arrays of #hex colours
  */

export default function makeFillRange ( border_cols, val = 0.4 ) {
  return {
    fill: border_cols.map( function (c){ return d3.color(c).brighter(val).hex(); }),
    border: border_cols
  };
}

/*

  return _char_ix[ item.id ].group

      if ( item.type === 'node' ) {
        item.b = cols.border[ _char_ix[ item.id ].group ];
        item.c = cols.fill[ _char_ix[ item.id ].group ];
      }
      else {
        item.c = cols.border[ _char_ix[ item.id1 ].group ];
        item.c2 = cols.border[ _char_ix[ item.id2 ].group ];
      }
*/