// const chart

import json from '../data/miserables.json';

import KeyLines from 'KeyLines';

import klChart from './klChart.js';

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
