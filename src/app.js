import xs from "xstream";
import isolate from "@cycle/isolate";
import { run } from "@cycle/run";
import { div, makeDOMDriver } from "@cycle/dom";
import onionify from "cycle-onionify";
import { makeFirebaseDriver } from "./firebaseDriver";
import { firebaseConfig } from "./firebaseConfig";
import { firebaseSink } from "./firebaseSink";
import { reducer } from "./reducer";
import Auth from "./components/Auth";
import Feedback from "./components/Feedback";
import Formular from "./components/Formular";
import Articles from "./components/Articles";

const intent = sources => {
  const sFireRes$ = sources.firebase.response
    .map(res => res.replaceError(({ err, action }) => xs.of({ err, action })))
    .flatten();
  const sFireResSuccess$ = sFireRes$.filter(({ err }) => !err);
  const sFireResError$ = sFireRes$.filter(({ err }) => err);
  const sFireAuth$ = sources.firebase.authentication;
  const sFireArticles$ = sources.firebase.on("articles", "value");
  return {
    sFireResSuccess$,
    sFireResError$,
    sFireAuth$,
    sFireArticles$
  };
};

const view = ({ auth, feedback, formular, articles }) =>
  xs
    .combine(auth.DOM, feedback.DOM, formular.DOM, articles.DOM)
    .map(doms => div(doms));

function main(sources) {
  /* AUTH */
  const auth = isolate(Auth, "auth")(sources);
  const aAuthLogin$ = auth.actions.login;
  const aAuthLogout$ = auth.actions.logout;

  /* FEEDBACK */
  const feedback = isolate(Feedback, "feedback")(sources);

  /* FORMULAR */
  const formular = isolate(Formular, "formular")(sources);
  const aFormularSubmit$ = formular.actions.submit;

  /* ARTICLES */
  const articles = isolate(Articles, "articles")(sources, {
    sFireAuth$,
    sFireResSuccess$,
    sFireArticles$
  });

  /* APP */
  const childrenOnions$ = xs.merge(
    ...[auth, feedback, formular, articles].map(sink => sink.onion)
  );
  const {
    sFireResSuccess$,
    sFireResError$,
    sFireAuth$,
    sFireArticles$
  } = intent(sources);

  const reducer$ = xs.merge(
    childrenOnions$,
    reducer({
      sFireResSuccess$,
      sFireResError$,
      sFireAuth$,
      sFireArticles$,
      aAuthLogin$,
      aFormularSubmit$
    })
  );

  const state$ = sources.onion.state$;

  return {
    DOM: view({ auth, feedback, formular, articles }),
    onion: reducer$,
    firebase: firebaseSink({
      state$,
      aAuthLogin$,
      aAuthLogout$,
      aFormularSubmit$
    })
  };
}

const drivers = {
  DOM: makeDOMDriver("#root"),
  firebase: makeFirebaseDriver(firebaseConfig)
};

const wrappedMain = onionify(main);

run(wrappedMain, drivers);
