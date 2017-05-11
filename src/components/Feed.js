import xs from "xstream";
import { div, button } from "@cycle/dom";

const view = state$ =>
  state$.map(feed => div([feed.msg, " ", button(".dismiss", " X ")]));

const reducer = sources =>
  sources.DOM.select(".dismiss").events("click").mapTo(() => undefined);

const Feed = sources => ({
  DOM: view(sources.onion.state$),
  onion: reducer(sources)
});

export default Feed;
