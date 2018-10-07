import d3 from 'd3';

/**
  * Normalise centrality (or other) data to be on a 0 - 10 scale.
  *
  * @method normalise
  * @param  results - object containing centrality data, keyed by character ID
  * @returns array of objects with keys id: character ID, value: normalised value,
  *          abs: absolute value
  */

export function normalise ( results ) {
  const scale = d3.scaleLinear()
    .domain( d3.extent( Object.values(results) ) )
    .range([0, 10]);
  return Object.keys(results).map( (id) => {
    return { id: id, abs: results[id], value: scale(results[id]) };
  });
}

/**
  * Objectified data about the keylines chart centrality functions
  *
  * @method centralityMeasures
  * @returns object with the centrality function name as key and properties as values
  */

export function centralityMeasures () {
  return {
    'betweenness': {
      opt: {
        value: 'value',
        all: [ false, true ],
        directed: [false, true],
        normalization: ['component', 'chart', 'unnormalized'],
        weights: [false, true]
      },
      async: true
    },
    'closeness': {
      opt: {
        value: 'value',
        all: [ false, true ],
        direction: ['any', 'to', 'from'],
        normalization: ['component', 'chart'],
        weights: [false, true]
      },
      async: true
    },
    'degrees': {
      opt: {
        value: 'value',
        all: [ false, true ],
        direction: ['any', 'to', 'from'],
        weights: [false, true]
      }
    },
    'eigenCentrality': {
      opt: {
        value: 'value',
        all: [ false, true ]
      }
    },
    'pageRank': {
      opt: {
        value: 'value',
        all: [ false, true ],
        directed: [false, true]
      }
    }
  };
}

export default centralityMeasures;