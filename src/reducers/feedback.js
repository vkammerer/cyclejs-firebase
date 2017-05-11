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
  const sFireAuthLoggedIn$ = sFireAuth$.filter(d => !!d);
  const sFireAuthLoggedOut$ = sFireAuth$.filter(d => !d);
  const all = xs.merge(
    sFireResError$.map(toError),
    sFireResSuccess$.map(toSuccess),
    sFireAuthLoggedIn$.map(toLoggedIn),
    sFireAuthLoggedOut$.map(toAnonymous)
  );
  return all.map(feed => prevState => ({
    ...prevState,
    feedback: [...(prevState.feedback || []), feed]
  }));
};
