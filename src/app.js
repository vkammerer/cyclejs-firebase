import xs from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import isolate from "@cycle/isolate";
import { run } from "@cycle/run";
import { div, label, input, span, hr, h1, makeDOMDriver } from "@cycle/dom";
import { objectPropsToArray } from "./utils";
import { makeFirebaseDriver } from "./firebaseDriver";
import firebaseConfig from "./firebaseConfig";
import { model } from "./appModel";
import Auth from "./Auth";
import Feedback from "./Feedback";
import Formular from "./Formular";
import Articles from "./Articles";

const intent = sources => {
  const sourceRes$ = sources.firebase.response
    .map(res => res.replaceError(({ err, action }) => xs.of({ err, action })))
    .flatten();
  const sourceResSuccess$ = sourceRes$.filter(({ err }) => !err);
  const sourceResError$ = sourceRes$.filter(({ err }) => err);
  const sourceAuth$ = sources.firebase.authentication;
  const actionAuthLoginProxy$ = xs.create();
  const actionFormularSubmitProxy$ = xs.create();
  const sourceArticles$ = sources.firebase
    .on("articles", "value")
    .map(objectPropsToArray);
  return {
    sourceResSuccess$,
    sourceResError$,
    sourceAuth$,
    actionAuthLoginProxy$,
    actionFormularSubmitProxy$,
    sourceArticles$
  };
};

const view = ({ auth, feedback, formular, articles }) =>
  xs
    .combine(auth.DOM, feedback.DOM, formular.DOM, articles.DOM)
    .map(([authVDom, feedbackVDOM, formularVDom, articlesVDom]) =>
      div([authVDom, feedbackVDOM, formularVDom, articlesVDom])
    );

const toFirebaseSink = ({ state, login, logout, formularSubmit }) => {
  const loginAction$ = login.map(() => ({
    type: "AUTH_FACEBOOK"
  }));
  const logoutAction$ = logout.map(() => ({
    type: "AUTH_LOGOUT"
  }));
  const formularSubmitAction$ = formularSubmit
    .compose(sampleCombine(state.auth$))
    .filter(([submitValue, auth]) => auth.status === "logged_in")
    .map(([submitValue, auth]) => ({
      type: "PUSH",
      path: "articles",
      value: {
        content: submitValue,
        username: auth.username,
        uid: auth.uid
      }
    }));
  return xs.merge(loginAction$, logoutAction$, formularSubmitAction$);
};

function main(sources) {
  const {
    sourceResSuccess$,
    sourceResError$,
    sourceAuth$,
    actionAuthLoginProxy$,
    actionFormularSubmitProxy$,
    sourceArticles$
  } = intent(sources);

  const state = model({
    sourceResSuccess$,
    sourceResError$,
    sourceAuth$,
    actionAuthLoginProxy$,
    actionFormularSubmitProxy$,
    sourceArticles$
  });

  /* AUTH */
  const authSources = {
    DOM: sources.DOM,
    props: state.auth$
  };
  const auth = isolate(Auth)(authSources);
  actionAuthLoginProxy$.imitate(auth.actions.login);

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
  actionFormularSubmitProxy$.imitate(formular.actions.submit);

  /* ARTICLES */
  const articlesSources = {
    DOM: sources.DOM,
    props: state.articles$
  };
  const articles = isolate(Articles)(articlesSources);

  return {
    DOM: view({ auth, feedback, formular, articles }),
    firebase: toFirebaseSink({
      state,
      login: auth.actions.login,
      logout: auth.actions.logout,
      formularSubmit: formular.actions.submit
    })
  };
}

const drivers = {
  DOM: makeDOMDriver("#root"),
  firebase: makeFirebaseDriver(firebaseConfig)
};

run(main, drivers);
