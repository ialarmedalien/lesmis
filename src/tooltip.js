import d3 from 'd3';


// Public - constructs a new tooltip
//
// Returns a tip
export default function () {
  var direction   = d3TipDirection,
  offset      = d3TipOffset,
  html        = d3TipHTML,
  rootElement = document.body,
  node        = initNode(),
  chartObj   = null,
  chartNode   = null,
  point       = null,
  target      = null;

  //   function tip(vis) {
  //     svg = getSVGNode(vis)
  //     if (!svg) return
  //     point = svg.createSVGPoint()
  //     rootElement.appendChild(node)
  //   }
  function tip (vis) {
    tip.target( vis );
    return tip;
    //     chartNode = getChartNode(vis)
    //     if (!chartNode) return
    //     chart_obj = obj
    //     rootElement.appendChild(node)
  }

  tip.target = function ( chart ) {
    var el = d3.select( '#' + chart.id() );
    if ( ! el ) {
      console.error('Chart element ' + chart.id() + ' not found');
      return;
    }
    chartNode = getChartNode( el );
    if (!chartNode) return;
    chartObj = chart;
    rootElement.appendChild(node);
  };

  // Public - show the tooltip on the screen
  //
  // Returns a tip
  tip.show = function (id) {

    if ( null === id || ! id ) {
      tip.hide();
      return;
    }

    var item = chart_obj.getItem(id);
    console.log( item.d );
    console.log( this );
    if (item.type !== 'node') {
      tip.hide();
      return;
    }
    var coords = chart_obj.viewCoordinates(item.x, item.y);
    var x = coords.x;
    var y = coords.y;
    console.log('x: ' + x + '; y: ' + y );

    // this needs to be a chart item ID
    var args = Array.prototype.slice.call(arguments);
    if (args[args.length - 1] instanceof SVGElement) target = args.pop();

    var content = html.apply(this, args),
    poffset = offset.apply(this, args),
    dir     = direction.apply(this, args),
    nodel   = getNodeEl(),
    i       = directions.length,
    coords,
    scrollTop  = document.documentElement.scrollTop ||
      rootElement.scrollTop,
    scrollLeft = document.documentElement.scrollLeft ||
      rootElement.scrollLeft;

    nodel.html(content)
      .style('opacity', 1).style('pointer-events', 'all');

    while (i--) {
      nodel.classed(directions[i], false);
    }
    coords = directionCallbacks.get(dir).apply(this);
    nodel.classed(dir, true)
      .style('top', (coords.top + poffset[0]) + scrollTop + 'px')
      .style('left', (coords.left + poffset[1]) + scrollLeft + 'px');

    return tip;
  };

  // Public - hide the tooltip
  //
  // Returns a tip
  tip.hide = function () {
    var nodel = getNodeEl();
    nodel.style('opacity', 0).style('pointer-events', 'none');
    return tip;
  };

  // Public: Proxy attr calls to the d3 tip container.
  // Sets or gets attribute value.
  //
  // n - name of the attribute
  // v - value of the attribute
  //
  // Returns tip or attribute value
  // eslint-disable-next-line no-unused-vars
  tip.attr = function (n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return getNodeEl().attr(n);
    }

    var args =  Array.prototype.slice.call(arguments);
    d3.selection.prototype.attr.apply(getNodeEl(), args);
    return tip;
  };

  // Public: Proxy style calls to the d3 tip container.
  // Sets or gets a style value.
  //
  // n - name of the property
  // v - value of the property
  //
  // Returns tip or style property value
  // eslint-disable-next-line no-unused-vars
  tip.style = function (n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return getNodeEl().style(n);
    }

    var args = Array.prototype.slice.call(arguments);
    d3.selection.prototype.style.apply(getNodeEl(), args);
    return tip;
  };

  // Public: Set or get the direction of the tooltip
  //
  // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
  //     sw(southwest), ne(northeast) or se(southeast)
  //
  // Returns tip or direction
  tip.direction = function (v) {
    if (!arguments.length) return direction;
    direction = v == null ? v : functor(v);

    return tip;
  };

  // Public: Sets or gets the offset of the tip
  //
  // v - Array of [x, y] offset
  //
  // Returns offset or
  tip.offset = function (v) {
    if (!arguments.length) return offset;
    offset = v == null ? v : functor(v);

    return tip;
  };

  // Public: sets or gets the html value of the tooltip
  //
  // v - String value of the tip
  //
  // Returns html value or tip
  tip.html = function (v) {
    if (!arguments.length) return html;
    html = v == null ? v : functor(v);

    return tip;
  };

  // Public: sets or gets the root element anchor of the tooltip
  //
  // v - root element of the tooltip
  //
  // Returns root node of tip
  tip.rootElement = function (v) {
    if (!arguments.length) return rootElement;
    rootElement = v == null ? v : functor(v);

    return tip;
  };

  // Public: destroys the tooltip and removes it from the DOM
  //
  // Returns a tip
  tip.destroy = function () {
    if (node) {
      getNodeEl().remove();
      node = null;
    }
    return tip;
  };

  function d3TipDirection () { return 'n'; }
  function d3TipOffset () { return [0, 0]; }
  function d3TipHTML () { return ' '; }

  var directionCallbacks = {
    n:  directionNorth,
    s:  directionSouth,
    e:  directionEast,
    w:  directionWest,
    nw: directionNorthWest,
    ne: directionNorthEast,
    sw: directionSouthWest,
    se: directionSouthEast
  },
  directions = Object.keys(directionCallbacks);

  function directionNorth () {
    var bbox = getScreenBBox(this);
    return {
      top:  bbox.n.y - node.offsetHeight,
      left: bbox.n.x - node.offsetWidth / 2
    };
  }

  function directionSouth () {
    var bbox = getScreenBBox(this);
    return {
      top:  bbox.s.y,
      left: bbox.s.x - node.offsetWidth / 2
    };
  }

  function directionEast () {
    var bbox = getScreenBBox(this);
    return {
      top:  bbox.e.y - node.offsetHeight / 2,
      left: bbox.e.x
    };
  }

  function directionWest () {
    var bbox = getScreenBBox(this);
    return {
      top:  bbox.w.y - node.offsetHeight / 2,
      left: bbox.w.x - node.offsetWidth
    };
  }

  function directionNorthWest () {
    var bbox = getScreenBBox(this);
    return {
      top:  bbox.nw.y - node.offsetHeight,
      left: bbox.nw.x - node.offsetWidth
    };
  }

  function directionNorthEast () {
    var bbox = getScreenBBox(this);
    return {
      top:  bbox.ne.y - node.offsetHeight,
      left: bbox.ne.x
    };
  }

  function directionSouthWest () {
    var bbox = getScreenBBox(this);
    return {
      top:  bbox.sw.y,
      left: bbox.sw.x - node.offsetWidth
    };
  }

  function directionSouthEast () {
    var bbox = getScreenBBox(this);
    return {
      top:  bbox.se.y,
      left: bbox.se.x
    };
  }

  function initNode () {
    var div = d3.select(document.createElement('div'));
    div
      .style('position', 'absolute')
      .style('top', 0)
      .style('opacity', 0)
      .style('pointer-events', 'none')
      .style('box-sizing', 'border-box');

    return div.node();
  }

  //   function getSVGNode(element) {
  //     var svgNode = element.node()
  //     if (!svgNode) return null
  //     if (svgNode.tagName.toLowerCase() === 'svg') return svgNode
  //     return svgNode.ownerSVGElement
  //   }
  function getChartNode ( element ) {
    var node = element.node();
    if (! node || node.tagName.toLowerCase() !== 'canvas') return null;
    return node;
  }

  function getNodeEl () {
    if (node == null) {
      node = initNode();
      // re-add node to DOM
      rootElement.appendChild(node);
    }
    return d3.select(node);
  }

  // Private - gets the screen coordinates of a shape
  //
  // Given a shape on the screen, will return an SVGPoint for the directions
  // n(north), s(south), e(east), w(west), ne(northeast), se(southeast),
  // nw(northwest), sw(southwest).
  //
  //    +-+-+
  //    |   |
  //    +   +
  //    |   |
  //    +-+-+
  //
  // Returns an Object {n, s, e, w, nw, sw, ne, se}
  function getScreenBBox (targetShape) {
    var targetel   = target || targetShape;

    while (targetel.getScreenCTM == null && targetel.parentNode != null) {
      targetel = targetel.parentNode;
    }

    var bbox       = {},
    matrix     = targetel.getScreenCTM(),
    tbbox      = targetel.getBBox(),
    width      = tbbox.width,
    height     = tbbox.height,
    x          = tbbox.x,
    y          = tbbox.y;

    point.x = x;
    point.y = y;
    bbox.nw = point.matrixTransform(matrix);
    point.x += width;
    bbox.ne = point.matrixTransform(matrix);
    point.y += height;
    bbox.se = point.matrixTransform(matrix);
    point.x -= width;
    bbox.sw = point.matrixTransform(matrix);
    point.y -= height / 2;
    bbox.w = point.matrixTransform(matrix);
    point.x += width;
    bbox.e = point.matrixTransform(matrix);
    point.x -= width / 2;
    point.y -= height / 2;
    bbox.n = point.matrixTransform(matrix);
    point.y += height;
    bbox.s = point.matrixTransform(matrix);

    return bbox;
  }

  // Private - replace D3JS 3.X d3.functor() function
  function functor (v) {
    return typeof v === 'function' ? v : function () {
      return v;
    };
  }

  return tip;
}

// Fill the tooltip
export function nodeTooltip (id) {
  // id is null for the background
  if ( null === id ) {
    hideTooltip();
    return;
  }

  if (id) {
    var item = chart.getItem(id);
    console.log( item.d );
    if (item.type === 'node') {
      var coordinates = chart.viewCoordinates(item.x, item.y);
      var x = coordinates.x;
      var y = coordinates.y;
      console.log('x: ' + x + '; y: ' + y );
      // Create the HTML code that is going to fill the tooltip
      var html = '<dl><dt style="color: ' + colours.fill[ item.d.group-1 ] + '" class="name">' + item.d.name.replace('.', '. ')
        + '</dt>'
        + '<dd>' + char_ix[ item.id ].links.length + ' connection'
          + (char_ix[ item.id ].links.length === 1 ? '</dd>' : 's</dd>')
        + ( current.measure && current.measure !== 'false'
          ? '<dd class="measure">' + current.measure.charAt(0).toUpperCase() + current.measure.slice(1) + ': ' + item.e.toFixed(2)
            + '<br>(maximum: 10)</dd>'
          : '' )
        + '</dl>';

      var ttip = d3.select('#tooltip');
      // Add it to the DOM if it doesn't exist
      if ( ! ttip ) {
        ttip = d3.select('kl')
          .append('div')
          .attr('id', 'tooltip');
      }

      // hide the tooltip while we make changes
      ttip
        .style('position', 'absolute')
        .style('opacity', 0)
        .style('pointer-events', 'none')
        .classed('d3-tip e', true)
        .html(html);

      var tooltip = d3.select('#tooltip').node();

      var top = y - (tooltip.offsetHeight / 2);
      ttip
        .style('left', (x + 20) + 'px')
        .style('top', top + 'px');

      showTooltip();
    } else {
      hideTooltip();
    }
  } else {
    hideTooltip();
  }
}

export function closeTooltip () {
  var tooltip = d3.select('#tooltip');
  tooltip.style('opacity', 0).style('pointer-events', 'none');
}

export function showTooltip () {
  var tooltip = d3.select('#tooltip');
  tooltip.style('opacity', 1).style('pointer-events', 'all');
}
