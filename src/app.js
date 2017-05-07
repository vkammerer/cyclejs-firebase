import xs from "xstream";
import isolate from "@cycle/isolate";
import { run } from "@cycle/run";
import { div, makeDOMDriver } from "@cycle/dom";
import { objectPropsToArray } from "./utils";
import { makeFirebaseDriver } from "./firebaseDriver";
import { firebaseConfig } from "./firebaseConfig";
import { streamFirebase } from "./model/firebase";
import { model } from "./model";
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
  const aAuthLoginProxy$ = xs.create();
  const aFormularSubmitProxy$ = xs.create();
  const sFireArticles$ = sources.firebase
    .on("articles", "value")
    .map(objectPropsToArray);
  return {
    sFireResSuccess$,
    sFireResError$,
    sFireAuth$,
    aAuthLoginProxy$,
    aFormularSubmitProxy$,
    sFireArticles$
  };
};

const view = ({ auth, feedback, formular, articles }) =>
  xs
    .combine(auth.DOM, feedback.DOM, formular.DOM, articles.DOM)
    .map(doms => div(doms));

function main(sources) {
  const {
    sFireResSuccess$,
    sFireResError$,
    sFireAuth$,
    aAuthLoginProxy$,
    aFormularSubmitProxy$,
    sFireArticles$
  } = intent(sources);

  const state = model({
    sFireResSuccess$,
    sFireResError$,
    sFireAuth$,
    aAuthLoginProxy$,
    aFormularSubmitProxy$,
    sFireArticles$
  });

  /* AUTH */
  const authSources = {
    DOM: sources.DOM,
    props: state.auth$
  };
  const auth = isolate(Auth)(authSources);
  aAuthLoginProxy$.imitate(auth.actions.login);
  const aAuthLogout$ = auth.actions.logout;

  /* FEEDBACK */
  const feedbackSources = {
    DOM: sources.DOM,
    props: state.feedback$
  };
  const feedback = isolate(Feedback)(feedbackSources);

  /* FORMULAR */
  const formularSources = {
    DOM: sources.DOM,
    props: state.formular$
  };
  const formular = isolate(Formular)(formularSources);
  aFormularSubmitProxy$.imitate(formular.actions.submit);

  /* ARTICLES */
  const articlesSources = {
    DOM: sources.DOM,
    props: state.articles$
  };
  const articles = isolate(Articles)(articlesSources);

  return {
    DOM: view({ auth, feedback, formular, articles }),
    firebase: streamFirebase({
      stateAuth$: state.auth$,
      aAuthLoginProxy$,
      aAuthLogout$,
      aFormularSubmitProxy$
    })
  };
}

const drivers = {
  DOM: makeDOMDriver("#root"),
  firebase: makeFirebaseDriver(firebaseConfig)
};

run(main, drivers);
