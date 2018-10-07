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
    char_ix[i] = n;
    char_ix[i].links = [];
    return {
      type: 'node',
      d: n,
      id: i,
      bw: 6, // border width
      t: n.name.replace('.','. ').replace(/(a-z)(A-Z)/g, '$1 $2'),
      /*
bu
Bubble
An object describing the bubble shown on the node.

donut
Donut
An object describing the donut border shown on the node. Only applies to nodes with 'circle' shape. If both donut and b are set then donut takes precedence.

e
number
default: 1
The enlargement factor for the node.

fb
boolean
default: false
Whether the label should be displayed in bold font.

fbc
string (Colour)
The background colour of the font. The default is a subtle effect using white with an alpha channel.

fc
string (Colour)
default: black
The colour for the label font.

fi
FontIcon
The font icon used on the node.

fs
number
default: 14
The font size (pt) of the node label.

g
array of Glyphs
An array of objects describing the glyphs shown on the node.

ha0-9
Halo
The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9.

hi
boolean
default: false
Whether the node is hidden.

oc
OpenStyleOptions
The style of a combo when open.

sh
string ('box'|'circle')
default: 'circle'
The node shape
*/
      /*
string
default: No label
The node label. Use new lines for multiline labels.

tc
boolean
default: false for nodes with images, true for other nodes
If the tc parameter ('text centre') is true, the label is shown in the centre of the node. If it is false then the label is shown at the bottom of the node.
*/
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
      /*
//       c:    cols.border[ char_ix[l.source].group ],
//       c2:   cols.border[ char_ix[l.target].group ],

a1 / a2
boolean
default: false
Whether to show an arrow at the id1/id2 end
b1 / b2
number
default: 0
The distance to back-off from end id1 as a ratio of the total length of the link line. Value in the range 0 to 1.
bg
boolean
default: false
Whether the link is displayed in the background.
bu
Bubble
An object describing the bubble shown on the link.
c
string (Colour)
default: grey
The colour of the link line itself.
c2
Beta
string (Colour)
If specified, the link will have a colour gradient, with colour c at the id1 end and colour c2 at the id2 end. The linkStyle transition setting controls the gradient's appearance.
fb
boolean
default: false
Whether the label should be displayed in bold font.
fbc
string (Colour)
The background colour of the font. The default is a subtle effect using white with an alpha channel.
fc
string (Colour)
default: black
The colour for the label font.
fs
number
default: 14
The font size (pt) of the link label.
g
array of Glyphs
An array of objects describing the glyphs shown next to the link label.
hi
boolean
default: false
Whether the link is hidden.
ls
string
default: 'solid'
The style of the link line. This can be either 'solid', 'dashed' or 'dotted'. Newer HTML5 browser versions support this.
off
number
default: 0
Specifies the offset of the midpoint of the link, and so controls how curved the link is. A zero offset gives a straight line for links between two different nodes.

Note: If you run chart.layout with default settings, it will override this offset and display straight lines. This is because the chart.layout straighten option is true by default. To prevent this, set chart.layout straighten to false.

For self links, it specifies how far the link is offset from its default position close to the node. Increasing the offset value increases the size of the arc. For examples, see Self Links.

t
string
The label positioned at the centre of the link. Use new lines for multiline labels.
*/
      /*
number
default: 1
The width of the link line. If you add arrows to links, this width will affect the size of the arrowheads.
*/

    };
  });
  return { char_ix: char_ix, node_link: node_arr.concat(link_arr) };
}
