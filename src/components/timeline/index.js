/* eslint-disable no-console */
import React from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
// import { select } from "d3-selection";
// import 'd3-transition';
import { withTranslation } from "react-i18next";
import Card from "../framework/card";
// import { changeColorBy } from "../../actions/colors";
import TimelineChart from "./timelineD3";

@connect((state) => {
  return {
    series: state.timeline.series,
    dateRange: state.timeline.dateRange,
    // mutType: state.controls.mutType,
    // bars: state.entropy.bars,
    // annotations: state.entropy.annotations,
    // geneMap: state.entropy.geneMap,
    // geneLength: state.controls.geneLength,
    // maxYVal: state.entropy.maxYVal,
    // showCounts: state.entropy.showCounts,
    loaded: state.entropy.loaded, 
    colorBy: state.controls.colorBy,
    // zoomMin: state.controls.zoomMin,
    // zoomMax: state.controls.zoomMax,
    // defaultColorBy: state.controls.defaults.colorBy,
    // shouldReRender: false,
    panelLayout: state.controls.panelLayout,
    narrativeMode: state.narrative.display
  };
})

class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hovered: false,
      chart: false
    };
  }
  static propTypes = {
    // dispatch: PropTypes.func.isRequired,
    loaded: PropTypes.bool.isRequired
    // colorBy: PropTypes.string.isRequired,
    // defaultColorBy: PropTypes.string.isRequired,
  //   mutType: PropTypes.string.isRequired
  }

  /* CALLBACKS */
  onHover(d, x, y) {
    // console.log("hovering @", x, y, this.state.chartGeom);
    this.setState({hovered: {d, type: ".tip", x, y}});
  }
  onLeave() {
    this.setState({hovered: false});
  }
  onClick(d) {
    if (this.props.narrativeMode) return;
  //   const colorBy = constructEncodedGenotype(this.props.mutType, d);
  //   analyticsControlsEvent("color-by-genotype");
  //   this.props.dispatch(changeColorBy(colorBy));
  //   this.setState({hovered: false});
  }
  setUp(props) {
    const chart = new TimelineChart(
      this.d3timeline,
      { /* callbacks */
        onHover: this.onHover.bind(this),
        onLeave: this.onLeave.bind(this),
        onClick: this.onClick.bind(this)
      }
    );
    chart.render(props);
    if (props.narrativeMode) {
      // select(this.d3timeline).selectAll(".handle--custom").style("visibility", "hidden");
    }
    this.setState({chart});
  }
  componentDidMount() {
    console.log("timeline mounted", this.props)
    if (this.props.loaded) {
      this.setUp(this.props);
    }
  }
  componentWillReceiveProps(nextProps) {
    console.log("timeline receive props", nextProps)
    if (!nextProps.loaded) {
      this.setState({chart: false});
    }
    if (!this.state.chart) {
      if (nextProps.loaded) {
        this.setUp(nextProps);
      }
      return;
    }
    this.state.chart.render(nextProps)
  }

  render() {
    const { t } = this.props;
    // const styles = getStyles(this.props.width);
    return (
      <Card title={t("Timeline")}>
        <svg
          id="d3timelineParent"
          style={{pointerEvents: "auto"}}
          width={this.props.width}
          height={this.props.height}
        >
          <g ref={(c) => { this.d3timeline = c; }} id="d3timeline"/>
        </svg>
      </Card>
    );
  }
}

const WithTranslation = withTranslation()(Timeline);
export default WithTranslation;