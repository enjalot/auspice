/* eslint-disable no-console */

import { hierarchy } from "d3-hierarchy";
import { stack } from "d3-shape";
import { nest} from "d3-collection";
import { timeDay } from "d3-time";
import { timeFormat } from "d3-time-format";
import { rollup, min, max } from "d3-array";
import { numericToCalendar } from "../util/dateHelpers";

let colorScales = {}

function pivotKeys(pivot, nodes) {
  return nest()
    .key((d) => d.data.node_attrs[pivot].value)
    .rollup((leaves) => leaves.length)
    .entries(nodes)
    .map((d) => d.key)
    .sort((a,b) => {
      return colorScales[pivot](a).index - colorScales[pivot](b).index
    })

}

function pivotNodes(pivot, nodes, dateRange) {
  const rolledup = rollup(nodes, 
    // we return the list of nodes as a Map
    (v) => v.length || 0,
    // first we group by the date as a string
    (d) => numericToCalendar(d.data.node_attrs.num_date.value), 
    // then we group by the division
    (d) => d.data.node_attrs[pivot].value
  );
  const keys = pivotKeys(pivot, nodes);
  // this is me not being super familiar with d3.stack and using maps
  // I'm going to create empty entries for missing divisions/date combinations
  dateRange.forEach((d) => {
    let m = rolledup.get(d);
    if (!m) {
      m = new Map();
    }
    keys.forEach((key) => {
      if (!m.get(key)) {
        m.set(key, 0);
      }
    });
    rolledup.set(d, m);
  });
  return rolledup;
}

// gives us an array with one row for each division, each of those rows is an array of 85 dates
function pivotSeries(pivot, nodes, dateRange, stackOrder) {
  const keys = pivotKeys(pivot, nodes);
  const pivotedNodes = pivotNodes(pivot, nodes, dateRange);
  
  // create an intermediate datastructure that we can pass into d3.stack
  const entries = Array.from(pivotedNodes)
    .sort((a, b) => a[0].localeCompare(b[0])) // order by date ascending
    .map((d) => ({ date: d[0], map: d[1] }))   // store each element as an object instead of array
    ;
  
  let stacked = stack()
    .keys(keys)
    .value((group, key) => { 
      return group.map.get(key);
    })
  
  if (stackOrder) {
    stacked = stacked.offset(stackOrder)
  }
  stacked = stacked(entries);
  
  // post-processing the stack so that each datapoint (what will become a rectangle or a piece of the stream)
  // has all it's associated metadata in the .data property, 
  // this way we don't need to look it up by index later
  // I wonder if there is a way to do this with d3.stack
  keys.forEach((key,i) => {
    const stack = stacked[i];
    stack.forEach((s) => {
      let d = s.data;
      s.data = {
        date: d.date,
        key: key,
        // group: regionsBy[pivot].get(key),
        value: d.map.get(key),
        color: colorScales[pivot](key)
      }
    });
  });
  return stacked;
}

export const timelineCreateState = (tree, metadata) => {
  if (tree) {
    const root = hierarchy(tree)
    const nodes = root.descendants().filter((d) => d.data.node_attrs.author && d.data.node_attrs.division);
    const min_num_date = min(nodes, (d) => d.data.node_attrs.num_date.value)
    const start_date = numericToCalendar(min_num_date)
    const max_num_date = max(nodes, (d) => d.data.node_attrs.num_date.value)
    const end_date = numericToCalendar(max_num_date)

    // TODO: generalize this to work using repository logic for making a scale
    // an important thing we want is the index of the color for sorting tooltip items
    let obj = {}
    console.log("metadata", metadata);
    metadata.colorings.filter((d) => d.title == "Country")[0].scale.forEach((d,i) => {
      obj[d[0]] = {color: d[1], index: i };
    });
    const countryColors = function(key) {
      return obj[key] || { color: "gray", index: -1 };
    };
    colorScales["country"] = countryColors;

    const dateRange = timeDay.range(new Date(start_date), timeDay.offset(new Date(end_date),1)).map(timeFormat("%Y-%m-%d"))
    // TODO: don't hard code the "pivot", it should be determined by colorBy
    const series = pivotSeries("country", nodes, dateRange);
    return {
      // showCounts: false,
      loaded: true,
      series,
      dateRange
    };
  }
  return {
    // showCounts: false,
    loaded: false,
    series: [],
    dateRange: []
  };
};