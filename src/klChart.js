import d3 from 'd3';

import KeyLines from 'KeyLines';

import { normalise, centralityMeasures } from './stats.js';

import makeFillRange from './palette.js';

import jsonToDataStruct from './json.js';

import tooltip_mixin from './tooltip.js';

export default function klChart ( args ) {
  if ( ! args.object ) {
    console.error( 'No keylines chart object supplied' );
    return;
  }

  let _chart = tooltip_mixin({
    kl: args.object
  }),

  // the dom ID of the chart object
  _domId = args.object.id(),

  // current chart settings
  _current = {
    layout: 'standard',
    kCores: 0
  },

  _prop = {
    // dom id for the controls
    control_id: 'controls',
    // untransformed link/node data
    data: null
  },

  // transformed link/node data
  _data,

  // characters, indexed by ID
  _char_ix,

  // centrality measures
  _rslts = {};

  _chart.domId = function () {
    return _domId;
  };

  _chart._char_ix = function () {
    return _char_ix;
  };

  // data for the chart
  _chart.data = function (_) {
    if ( arguments.length ) {
      _prop.data = _;
      return _chart;
    }
    return _prop.data;
  };

  // shortcut to allow us to initialise the chart and load data into it
  _chart.setup = function (args) {
    _chart.init( args );
    _chart.loadData();
    return _chart;
  };

  /**
  * perform various initialisation functions on the chart, including event binding
  *
  * @method init
  * @param  args object containing (we hope) control_id and data key/value pairs
  * @returns _chart object
  */
  _chart.init = function (args) {
    // transfer the args
    [ 'control_id', 'data' ].forEach( d => {
      if ( args[d] ) {
        _prop[d] = args[d];
      }
    });

    _chart.kl.options({
      handMode: true,
      selectionColour: '#000'
    });

    var tip = _chart.tip.init( '#tooltip' );
    tip
      .attr('class','d3-tip')
      .offset([-12, 30]) // offset tooltip padding
      .direction('e')
      .html( (item) => {
        return '<dl><dt style="color: ' + item.b
          + '" class="name">' + item.d.nice_name
          + '</dt>'
          + '<dd>' + _char_ix[ item.id ].links.length + ' connection'
          + (_char_ix[ item.id ].links.length === 1
            ? ''
            : 's')
          + ( _current.kCores > 0 ? ' (inc. hidden nodes)' : '' )
          + '</dd>'
          + ( _current.measure && _current.measure !== 'false'
            ? '<dd class="measure">' + _current.measure.charAt(0).toUpperCase()
              + _current.measure.slice(1) + ': ' + (item.e - 1).toFixed(2) + '<br>(normalised to range 0 - 10)</dd>'
            : '' )
          + '</dl>';
      });

    if ( tip ) {
      // Bind a function called when the mouse goes over a node
      _chart.kl.bind('hover', tip.show);
      // or tap it on a mobile device
      _chart.kl.bind('hover', tip.show);
      // Close the tooltip as soon as anything happens
      _chart.kl.bind('viewchange', tip.hide);
    }

    // don't drag links
    _chart.kl.bind('dragstart', name => (name === 'offset') );

    // prevent the user from deleting or editing the selection
    _chart.kl.bind('delete', () => true );
    _chart.kl.bind('edit', () => true );

    return _chart;

  };

  /**
  * applies the d3.schemeSet3 colours to nodes and links according to the group
  * that each node is in. This could/should be made more generic for different
  * colour schemes
  *
  * @method _colourData
  */

  _chart._colourData = function () {
    // prepare the chart colours
    const cols = makeFillRange( d3.schemeSet3 );

    let tmp = [];

    _chart.kl.each({}, (item) => {
      if ( item.type === 'node' ) {
        item.b = cols.border[ _char_ix[ item.id ].group ];
        item.c = cols.fill[ _char_ix[ item.id ].group ];
      }
      else {
        item.c = cols.border[ _char_ix[ item.id1 ].group ];
        item.c2 = cols.border[ _char_ix[ item.id2 ].group ];
      }
      tmp.push( item );
    });

    return tmp;

  };

  /**
  * ensure data is in the correct form, and then load it into the chart
  * calls jsonToDataStruct to format data and _chart.colourData() to add colours
  *
  * @method loadData
  */
  _chart.loadData = function () {
    // prepare data
    if ( ! _data ) {
      const parsed = jsonToDataStruct( _prop.data );
      _char_ix = parsed.char_ix;
      _data = parsed.node_link;
    }

    if ( ! _data ) {
      console.error('Could not find any associated chart data!');
      return;
    }

    _chart.kl.load({
      type: 'LinkChart',
      items: _data
    }, () => {
      // add the colour data to the nodes, then set the layout and zoom to fit
      _chart.kl.animateProperties( _chart._colourData(), { time:100 }, function () {
        _chart.kl.layout( _current.layout );
      });

      _chart.postLoad();

    });
    return _chart;
  };

  /**
  * functions performed after the chart data has loaded
  * - addition of resizing capabilities
  * - adding controls
  * - calculating the centrality measures
  * @method postLoad
  */

  _chart.postLoad = function () {
    _chart.addSizeListeners();
    _chart.addControls();
    _rslts = _chart.calculateAll();
  };

  /**
  * @method resizeChart
  * @param w chart width in pixels
  * @param h chart height in px; set to 0.6 * w by default
  */
  function resizeChart ( w, h = 0.75 * w ) {
    KeyLines.setSize( _domId, w, h );
    _chart.kl.zoom('fit');
  }

  /**
  * sets up chart resizing according to the media queries supplied
  * @method addSizeListeners
  */

  _chart.addSizeListeners = function () {


    // add in plenty of MQs or the chart gets stuck at some sizes
    const mq_h = {
      '(max-width: 399px)': 300,
      '(min-width: 400px) and (max-width: 499px)': 400,
      '(min-width: 500px) and (max-width: 599px)': 500,
      '(min-width: 600px) and (max-width: 699px)': 600,
      '(min-width: 700px) and (max-width: 799px)': 700,
      // start showing controls now
      '(min-width: 800px) and (max-width: 979px)': 700,
      // over 980: set to 800; actual width includes 24px each side
      '(min-width: 980px) and (max-width: 1199px)': 800,
      '(min-width: 1200px)': 950

    };

    Object.keys( mq_h ).forEach( (e) => {
      const mq = window.matchMedia( e );
      if ( mq.matches ) {
        resizeChart( mq_h[e] );
      }
      mq.addListener( (mqw) => {
        if ( mqw.matches ) {
          resizeChart( mq_h[e] );
        }
      });
    });
  };

  /**
  * Generic click handler added to all control elements
  * @method controlClickHandler
  * @param this - DOM element that triggered the click
  */
  function controlClickHandler () {
    // get the ancestor li element, mark as active, mark siblings as inactive
    this.parentNode.parentNode.childNodes.forEach( (e) => {
      e.classList.remove('active');
    } );
    this.parentNode.classList.add('active');
    _chart.animate({ name: this.name, value: this.value });
  }

  /**
  * Adds the controls for manipulating the graph display. controlObj holds the
  * magical properties and the elements are added using the d3 data-binding paradigm
  *
  * @method addControls
  */
  _chart.addControls = function () {
    const meas = centralityMeasures(),

    controlObj = {
      // Standard: our default force-directed graph layout which tries to keep link lengths consistent.
      // Organic: an alternative, highly performant force-based layout which uses a circular arrangement.
      // Hierarchy: lays out tree-like data top down, usually from a specified node.
      // Sequential: places nodes at distinct levels and minimises crossed links.
      // Lens: places the node in a circle-like grid, with connected nodes next to each other.
      // Radial: places nodes in concentric circles. ==>
      // Structural: places nodes which are structurally similar together in the network.
      // Tweak
      layout: {
        title: 'Chart layout',
        default: 'standard',
        data: ['standard','organic','lens','structural'].map(function (l){
          return { value: l, label: l.charAt(0).toUpperCase() + l.slice(1) };
        } )
      },
      measure: {
        title: 'Centrality measure',
        data: Object.keys(meas).map( function (m) {
          return Object.assign( { label: m.charAt(0).toUpperCase() + m.slice(1), value: m }, meas[m] );
        })
      },
      weights: {
        title: 'Use link weights',
        data: [{ label: 'Yes', value: true }, { label: 'No', value: false }]
      },
      //   all: {
      //     title: 'Include hidden nodes in analysis',
      //     data: [{ label: 'Yes', value: true }, { label: 'No', value: false }]
      //   },
      kCores: {
        title: 'Hide nodes with fewer than n connections',
        data: [
          { label: "Show all", value: false },
          { label: '1 connection', value: '1' },
          { label: '2 connections', value: '2' },
          { label: '3 connections', value: '3' },
          { label: '4 connections', value: '4' }
        ]
      }
    },

    order = ['measure', 'weights', 'kCores', 'layout'],
    cntrl = d3.select( _prop.control_id );

    // add 'none'
    controlObj.measure.data.push({ label: 'None', value: 'false' });

    order.forEach( function (token) {

      let container = cntrl.append('fieldset')
        .classed('control__container', true);

      container
        .append('h4')
        .classed('control__title--' + token, true)
        .text( controlObj[token].title );

      let lis = container
        .append('ul')
        .classed('noDot control__list--' + token, true)
        .selectAll('li')
        .data(controlObj[token].data)
        .enter()
        .append('li')
        .classed('control__item--' + token, true);
      lis
        .append('input')
        .classed('control__radio--' + token, true)
        .attr('type', 'radio')
        .attr('id', d => 'radio__' + d.value + '--' + token )
        .attr('value', d => d.value )
        .attr('name', token)
        .attr('hidden', '')
        .on('change', controlClickHandler);
      lis
        .append('label')
        .classed('control__label--' + token, true)
        .attr('for', d => 'radio__' + d.value + '--' + token )
        .text( d => d.label );
      let dflt = controlObj[token].default || 'false';

      document.querySelector('#radio__' + dflt + '--' + token)
        .setAttribute('checked', '');
      document.querySelector('#radio__' + dflt + '--' + token)
        .parentNode.classList.add('active');
    });
  };

  /**
  * filter the chart nodes according to the number of connections they have
  *
  * @method setkCores
  * @param {value} the number of connections per node to filter by
  */
  function setkCores ( value ) {
    if ( ! _rslts.kCores ) {
      _rslts.kCores = _chart.kl.graph().kCores({ all: true });
    }

    if ( value === 'false' ) {
      value = 0;
      _chart.kl.show( Object.keys(_rslts.kCores.values), true );
    }
    else if ( value > _current.kCores ) {
      _chart.kl.hide( Object.keys(_rslts.kCores.values).filter(function (id) {
        return ( _rslts.kCores.values[id] <= +value );
      }) );
    }
    else {
      _chart.kl.show( Object.keys(_rslts.kCores.values).filter(function (id) {
        return ( _rslts.kCores.values[id] > +value );
      }), true );
    }
    _current.kCores = value;
  }

  /**
  * set the chart layout, and sets _current.layout to that value
  *
  * @method setLayout
  * @param {value} the new chart layout
  */
  function setLayout ( value ) {
    _current.layout = value;
    // omit 'sequential','hierarchy','radial' for now

    _chart.kl.layout( _current.layout );
  }

  /**
  * responds to input from the controls; depending on the parameters, it may
  * set the chart layout, filter the nodes in the chart, or apply one of the
  * centrality measures.
  *
  * @method animate
  * @param {args} object with keys name (name of param to set) and value (value to set)
  */
  _chart.animate = function ( args ) {
    if ( args.name === 'kCores' ) {
      return setkCores( args.value );
    }

    if ( args.name === 'layout' ) {
      return setLayout( args.value );
    }

    const measures = centralityMeasures();
    let opt = {},
    tmp = [],
    id;

    if ( args.name === 'measure' && args.value === 'false' ) {
      delete _current.measure;
      if ( ! _rslts['false'] ) {
        // run the standard layout
        _chart.kl.each({ type:'node' }, function (item) {
          tmp.push( { id: item.id, value: 1 } );
        });
        _rslts['false'] = tmp;
      }
      _chart.layoutAndAnimate(_rslts['false']);
      return;
    }

    if ( ! _current.measure && args.name !== 'measure' ) {
      alert('Please choose a centrality measure');
      return; // can't do anything!
    }

    _current[ args.name ] = args.value;
    id = _current.measure + '__'
      + ( _current.weights ? 'wt_true' : 'wt_false' );
    // + '__' + ( _current.all ? 'all_true' : 'all_false' );
    if ( _rslts[id] ) {
      _chart.layoutAndAnimate(_rslts[id]);
      return;
    }

    [ 'weights' /* , 'all' */ ].forEach( function (v) {
      if ( _current[ v ] ) {
        opt[v] = _current[v];
      }
    });
    if ( Object.keys(opt).length > 0 ) {
      opt.value = 'value';
    }

    if (measures[ _current.measure ].async) {
      _chart.kl.graph()[ _current.measure ]( opt, function (measure_res){
        _rslts[id + '_abs'] = measure_res;
        _rslts[id] = normalise( measure_res );
        _chart.layoutAndAnimate(_rslts[id]);
      });
    }
    else {
      _rslts[id + '_abs'] = _chart.kl.graph()[ _current.measure ](opt);
      _rslts[id] = normalise( _rslts[id + '_abs'] );
      _chart.layoutAndAnimate(_rslts[id]);
    }
  };

  /**
  * Takes an array of objects representing nodes and applies the appropriate
  * node size transformation
  *
  * @param results array, containing objects with keys id and value
  *
  */
  _chart.layoutAndAnimate = function (results) {
    _chart.kl.animateProperties( results.map( d => {
      d.e = d.value + 1;
      return d;
    }), {}, function () {
      _chart.kl.layout( _current.layout );
    });
  };

  /**
  * calculateAll: calculates all unweighted centrality measures
  * and stores them in an object, keyed by measure_name + '__wt_false'
  *
  * @returns rslts object, to be stored in _rslts for global access
  */
  _chart.calculateAll = function () {
    const measures = centralityMeasures(),
    opt = { all: true },
    rslts = {};

    Object.keys(measures).forEach( (m) => {
      if (measures[m].async) {
        _chart.kl.graph()[m](opt, (measure_res) => {
          rslts[m + '__wt_false_abs'] = measure_res;
          rslts[m + '__wt_false'] = normalise( measure_res );
        });
      }
      else {
        rslts[m + '__wt_false_abs'] = _chart.kl.graph()[m](opt);
        rslts[m + '__wt_false'] = normalise( rslts[m + '__wt_false_abs'] );
      }
    });
    return rslts;
  };

  return _chart;

}
