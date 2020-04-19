/* eslint-disable no-console */
// import _filter from "lodash/filter";
import * as types from "../actions/types";

const Timeline = (state = {loaded: false, series: [], dateRange: []}, action) => {
  switch (action.type) {
    case types.DATA_INVALID:
      return {loaded: false, series: [], dateRange: []};
    case types.URL_QUERY_CHANGE_WITH_COMPUTED_STATE: /* fallthrough */
    case types.CLEAN_START:
      return action.timeline;
    case types.TIMELINE_DATA:
      console.log("TIMELINE_DATA", action)
      return Object.assign({}, state, {
        loaded: true,
        series: action.data,
      });
    default:
      return state;
  }
};

export default Timeline;
