import xs from "xstream";
import isolate from "@cycle/isolate";
import { div } from "@cycle/dom";
import Article from "./Article";
import { pick, mix } from "cycle-onionify";
import { articlesReducerFlat } from "../reducer/articles.js";

const view = childrenSinks$ =>
  childrenSinks$
    .compose(pick(sinks => sinks.DOM))
    .compose(mix(xs.combine))
    .map(itemVNodes => div(itemVNodes));

const Articles = (
  sources,
  { sFireAuth$, sFireResSuccess$, sFireArticles$ }
) => {
  const childrenSinks$ = sources.onion.state$.map(state =>
    state.map((item, i) => isolate(Article, i)(sources))
  );
  const childrenReducers$ = childrenSinks$.compose(pick("onion"));
  const childrenReducer$ = childrenReducers$.compose(mix(xs.merge));
  const reducer$ = xs.merge(childrenReducer$);

  return {
    DOM: view(childrenSinks$),
    onion: reducer$
  };
};

export default Articles;
