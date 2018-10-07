/**
  * given a data structure with an array of nodes and an array of links,
  * return a data structure containing an array of nodes and links for the chart
  * and an index of characters
  *
  * @method jsonToDataStruct
  * @param  json object with keys nodes: [chart nodes] and links: [chart links]
  * @returns object with keys char_ix and node_link -- char_ix is an index of
  * characters by ID, and node_link is an array containing the nodes and links
  * to add to the chart
  */
export default function jsonToDataStruct ( json ) {

  let char_ix = {},
  node_arr = json.nodes.map(function (n,i) {
    n.nice_name = n.name
      .replace('.','. ')
      .replace(/de([A-Z])/g, 'de $1')
      .replace(/([a-z])([A-Z\d])/g, '$1 $2');
    char_ix[i] = n;
    char_ix[i].links = [];
    return {
      type: 'node',
      d: n,
      id: i,
      bw: 6, // border width
      t: n.nice_name
    };
  }),

  link_arr = json.links.map(function (l){
    char_ix[ l.source ].links.push( l.target );
    char_ix[ l.target ].links.push( l.source );
    return {
      type: 'link',
      id:   l.source + '_' + l.target,
      id1:  l.source,
      id2:  l.target,
      d:    l,
      w: l.value
    };
  });
  return { char_ix: char_ix, node_link: node_arr.concat(link_arr) };
}
