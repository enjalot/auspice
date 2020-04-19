import { combineReducers } from "redux";
import metadata from "./metadata";
import tree from "./tree";
import frequencies from "./frequencies";
import entropy from "./entropy";
import timeline from "./timeline";
import controls from "./controls";
import browserDimensions from "./browserDimensions";
import notifications from "./notifications";
import narrative from "./narrative";
import treeToo from "./treeToo";
import general from "./general";

const rootReducer = combineReducers({
  metadata,
  tree,
  frequencies,
  controls,
  entropy,
  timeline,
  browserDimensions,
  notifications,
  narrative,
  treeToo,
  general
});

export default rootReducer;
