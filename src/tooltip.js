import d3 from 'd3';

/**

  Adapted from d3-tip, https://github.com/Caged/d3-tip

*/

// Public - mixes in tooltip functionality into the chart object
//
// Returns the chart object
export default function tooltip_mixin ( _chart ) {

  function d3TipDirection () { return 'n'; }
  function d3TipOffset () { return [0, 0]; }
  function d3TipHTML () { return ' '; }

  var direction   = d3TipDirection,
  offset      = d3TipOffset,
  html        = d3TipHTML,
  rootElement = null,
  node        = initNode(),
  chartNode   = null,
  tip         = {};

  // initialise a tip and return the tip object
  tip.init = function (el) {
    chartNode = getChartNode();
    if (!chartNode) return;
    rootElement = d3.select(el).node();
    rootElement.appendChild(node);
    return _chart.tip;
  };
  // Public - show the tooltip on the screen
  //
  // Returns a tip
  tip.show = function (id) {

    if ( null === id || ! id ) {
      tip.hide();
      return;
    }

    var item = _chart.kl.getItem(id);
    if (item.type !== 'node') {
      tip.hide();
      return;
    }
    var
    coords  = _chart.kl.viewCoordinates(item.x, item.y),
    content = html(item),
    poffset = offset(),
    dir     = direction(),
    nodel   = getNodeEl(),
    i       = directions.length,
    scrollTop  = document.documentElement.scrollTop ||
      rootElement.scrollTop,
    scrollLeft = document.documentElement.scrollLeft ||
      rootElement.scrollLeft;

    nodel.html(content)
      .style('opacity', 1).style('pointer-events', 'all');

    while (i--) {
      nodel.classed(directions[i], false);
    }

    nodel.classed(dir, true)
      .style('top', (coords.y + poffset[0]) + scrollTop + 'px')
      .style('left', (coords.x + poffset[1]) + scrollLeft + 'px');

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
  function getChartNode () {
    var node = d3.select('#' + _chart.domId() ).node();
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

  var directions = ['n','s','e','w','ne','nw','se','sw'];
  /**
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

    var coords = chartObj.viewCoordinates(targetShape.x, targetShape.y);
    var itemx = coords.x;
    var itemy = coords.y;



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
*/
  // Private - replace D3JS 3.X d3.functor() function
  function functor (v) {
    return typeof v === 'function' ? v : function () {
      return v;
    };
  }

  _chart.tip = tip;
  return _chart;
}
