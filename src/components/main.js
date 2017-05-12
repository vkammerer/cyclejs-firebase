import xs from "xstream";
import isolate from "@cycle/isolate";
import { div } from "@cycle/dom";
import { firebaseSink } from "../firebaseSink";
import intent from "../intent";
import reducer from "../reducers/index";
import List from "./List";
import Auth from "./Auth";
import Feed from "./Feed";
import Formular from "./Formular";
import Article from "./Article";

const Feedback = List(Feed);
const Articles = List(Article);

const main = sources => {
  const auth = isolate(Auth, "auth")(sources);
  const feedback = isolate(Feedback, "feedback")(sources);
  const formular = isolate(Formular, "formular")(sources);
  const articles = isolate(Articles, "articles")(sources);

  /* CHILDREN */
  const childrenSinks = [auth, feedback, formular, articles];
  const childrenDOMs$ = xs.combine(...childrenSinks.map(sink => sink.DOM));
  const childrenActions$ = xs.merge(
    ...childrenSinks.map(sink => sink.actions).filter(a => !!a)
  );
  const childrenReducers$ = xs.merge(
    ...childrenSinks.map(sink => sink.onion).filter(a => !!a)
  );

  /* APP */
  const superSources$ = intent(sources);
  const parentReducer$ = reducer(superSources$, childrenActions$);

  const vdom$ = childrenDOMs$.map(doms => div(doms));
  const reducer$ = xs.merge(parentReducer$, childrenReducers$);
  const firebase$ = firebaseSink(childrenActions$);

  return {
    DOM: vdom$,
    onion: reducer$,
    firebase: firebase$
  };
};

export default main;
