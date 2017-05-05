import xs from "xstream";

/* AUTH */
const toAnonymousAuthProps = () => ({
  status: "anonymous",
  username: null,
  uid: null
});

const toAwaitingAuthProps = () => ({
  status: "awaiting_response",
  username: null,
  uid: null
});

const fromSourceAuthToAuthProps = authData => {
  if (!authData) return toAnonymousAuthProps();
  return {
    status: "logged_in",
    username: authData.providerData[0].displayName,
    uid: authData.uid
  };
};

const streamAuthProps = ({
  sourceResError$,
  sourceAuth$,
  actionAuthLoginProxy$
}) => {
  const actionAuthProps$ = actionAuthLoginProxy$.map(toAwaitingAuthProps);
  const sourceErrorAuthProps$ = sourceResError$
    .filter(({ action }) => action.type === "AUTH_FACEBOOK")
    .map(toAnonymousAuthProps);
  const sourceAuthProps$ = sourceAuth$.map(fromSourceAuthToAuthProps);
  return xs.merge(actionAuthProps$, sourceErrorAuthProps$, sourceAuthProps$);
};

/* FEEDBACK */
const toErrorFeedbackProps = ({ err, action }) => ({
  feedback: { msg: `Error: Type of the action: ${action.type}` }
});

const toSuccessFeedbackProps = ({ err, action }) => ({
  feedback: { msg: `Success: Type of the action: ${action.type}` }
});

const toAuthFeedbackProps = authData => {
  if (!authData) return { feedback: { msg: `Auth: not logged in` } };
  return {
    feedback: {
      msg: `Auth: logged in as : ${authData.providerData[0].displayName}`
    }
  };
};

const streamFeedbackProps = ({
  sourceResError$,
  sourceResSuccess$,
  sourceAuth$
}) => {
  const errorFeedbackProps$ = sourceResError$.map(toErrorFeedbackProps);
  const successFeedbackProps$ = sourceResSuccess$.map(toSuccessFeedbackProps);
  const authFeedbackProps$ = sourceAuth$.map(toAuthFeedbackProps);
  return xs.merge(
    errorFeedbackProps$,
    successFeedbackProps$,
    authFeedbackProps$
  );
};

/* FORMULAR */
const streamFormularProps = ({
  sourceAuth$,
  sourceResSuccess$,
  actionFormularSubmitProxy$
}) => {
  const submissionProps$ = actionFormularSubmitProxy$.map(() => ({
    status: "submitting"
  }));
  const responseProp$ = sourceResSuccess$
    .map(() => ({ status: "ready" }))
    .startWith({ status: "ready" });
  const submissionOrResponseProp$ = xs.merge(submissionProps$, responseProp$);
  return xs
    .combine(sourceAuth$, submissionOrResponseProp$)
    .map(([authData, authenticatedProp]) => {
      if (!authData) return { status: "unlogged" };
      return authenticatedProp;
    });
};

/* ARTICLES */
const streamArticlesProps = sourceArticles$ =>
  sourceArticles$.map(articles => articles);

/* APP */
export const model = ({
  sourceResError$,
  sourceResSuccess$,
  sourceAuth$,
  actionAuthLoginProxy$,
  actionFormularSubmitProxy$,
  sourceArticles$
}) => ({
  auth$: streamAuthProps({
    sourceResError$,
    sourceAuth$,
    actionAuthLoginProxy$
  }),
  feedback$: streamFeedbackProps({
    sourceResError$,
    sourceResSuccess$,
    sourceAuth$
  }),
  formular$: streamFormularProps({
    sourceAuth$,
    sourceResSuccess$,
    actionFormularSubmitProxy$
  }),
  articles$: streamArticlesProps(sourceArticles$)
});
