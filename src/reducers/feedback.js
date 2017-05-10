import xs from "xstream";

const toError = ({ err, action }) => ({
  msg: `Error: Type of the action: ${action.type}`
});

const toSuccess = ({ err, action }) => ({
  msg: `Success: Type of the action: ${action.type}`
});

const toLoggedIn = authData => ({
  msg: `Auth: logged in as : ${authData.providerData[0].displayName}`
});

const toAnonymous = authData => ({ msg: `Auth: not logged in` });

export const feedbackReducer = ({
  sFireResError$,
  sFireResSuccess$,
  sFireAuth$
}) => {
  const error$ = sFireResError$.map(toError);
  const success$ = sFireResSuccess$.map(toSuccess);
  const fireAuthLoggedIn$ = sFireAuth$.filter(data => data).map(toLoggedIn);
  const fireAuthLoggedOut$ = sFireAuth$.filter(data => !data).map(toAnonymous);
  const combined = xs.merge(
    error$,
    success$,
    fireAuthLoggedIn$,
    fireAuthLoggedOut$
  );
  return combined.map(feed => prevState => ({
    ...prevState,
    feedback: [...(prevState.feedback || []), feed]
  }));
};
