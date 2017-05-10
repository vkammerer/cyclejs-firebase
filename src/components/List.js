import xs from "xstream";
import isolate from "@cycle/isolate";
import { div } from "@cycle/dom";
import { pick, mix } from "cycle-onionify";

const view = childrenSinks$ =>
  childrenSinks$.map(itemVNodes => div(itemVNodes));

const List = Item => sources => {
  const childrenSinks$ = sources.onion.state$.map(state =>
    state.map((item, i) => isolate(Item, i)(sources, i))
  );

  const childrenDoms$ = childrenSinks$.compose(pick("DOM"));
  const childrenDom$ = childrenDoms$.compose(mix(xs.combine));

  const childrenReducers$ = childrenSinks$.compose(pick("onion"));
  const childrenReducer$ = childrenReducers$.compose(mix(xs.merge));

  const DOM = view(childrenDom$);
  const reducer$ = xs.merge(childrenReducer$);

  return {
    DOM,
    onion: reducer$
  };
};

export default List;
