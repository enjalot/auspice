/* eslint-disable no-console */
/* eslint no-underscore-dangle: off */
import { select, event as d3event } from "d3-selection";
import 'd3-transition';
import { scaleLinear, scaleBand } from "d3-scale";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { format } from "d3-format";

const TimelineChart = function TimelineChart(ref, callbacks) {
  this.svg = select(ref);
  this.callbacks = callbacks;
};

/* "PUBLIC" PROTOTYPES */
TimelineChart.prototype.render = function render(props) {
  this.props = props;
  const margin = ({top: 0, right: 10, bottom: 20, left: 15});
  const x = scaleBand()
    .domain(props.dateRange)
    .rangeRound([margin.left, props.width - margin.right]);
  const ys = scaleLinear()
    .domain([0, max(props.series, (d) => max(d, (d) => d[1]))]).nice()
    .range([props.height - margin.bottom, margin.top]);

  console.log("timeline render", props);
  const svg = this.svg;
  svg.append("g")
    .selectAll("rect.bg")
    .data(props.dateRange)
    .join("rect")
      .classed("bg", true)
      .attr("x", (d) => x(d))
      .attr("y", (d) => margin.top)
      .attr("width", x.bandwidth())
      .attr("height", (d) => props.height - margin.bottom)
      .style("fill", "#fff");

  svg.append("g")
    .selectAll("g")
    .data(props.series)
    .join("g")
      .attr("fill", (d) => { 
        // return "#aaa";
        return d[0].data.color.color
      })
      .style("pointer-events", "none")
      .call((g) => {
        return g.selectAll("rect")
        .data((d) => { return d})
        .join("rect")
          .attr("x", (d) => {
            return x(d.data.date);
          })
          .attr("y", (d) => ys(d[1]))
          .attr("width", x.bandwidth())
          .attr("height", (d,i) => {return ys(d[0]) - ys(d[1])});
      });
 
}

TimelineChart.prototype.update = function render(props) {
  this.props = props;
  console.log("timeline update", props)
}

export default TimelineChart;