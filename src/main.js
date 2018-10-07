// const chart

import json from '../data/miserables.json';

import KeyLines from 'KeyLines';

import klChart from './klChart.js';

import tip from './tooltip.js';

// var tip = d3.tip()
//   .attr('class', 'd3-tip')
//   .html(function(d) { return d; })
//
// var vis = d3.select(document.body)
//   .append('svg')
//   // REQUIRED:  Call the tooltip on the context of the visualization
//   .call(tip)
//

// tip.show
//
// Show a tooltip on the screen.
//
// rect.on('mouseover', tip.show)
// rect.on('mouseover', function(d, i) {
//   tip.show(d, i)
// })
// Explicit targets
//
// Sometimes you need to manually specify a target to act on. For instance, maybe you want the tooltip to appear over a different element than the one that triggered a mouseover event. You can specify an explicit target by passing an SVGElement as the last argument.
//
// tip.show(data, target)



//   .attr('class', 'd3-tip')
//   .html(function(item) {
//     var html = '<dl><dt style="color: ' + colours.fill[ item.d.group ]
//       + '" class="name">' + item.d.name.replace('.', '. ')
//       + '</dt>'
//       + '<dd>' + char_ix[ item.id ].links.length + ' connection'
//       + (parsed.char_ix[ item.id ].links.length === 1
//         ? '</dd>'
//         : 's</dd>')
//       + ( current.measure && current.measure !== 'false'
//         ? '<dd class="measure">' + current.measure.charAt(0).toUpperCase()
//           + current.measure.slice(1) + ': ' + item.e.toFixed(2) + '<br>(max: 10)</dd>'
//         : '' )
//       + '</dl>';
//     return html;
// });
KeyLines.paths({ assets: 'assets/' });

function init () {
  KeyLines.create( 'kl', function (err, keylines_chart) {
    if ( err ) {
      console.error( err );
      return;
    }

    var chart = klChart({ id: 'kl', object: keylines_chart });

    chart.setup({
      control_id: '#controls',
      data: json
    });
  });
}

window.onload = init;
