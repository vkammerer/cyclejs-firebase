import xs from "xstream";

const toError = ({ err, action }) => ({
  msg: `Error: Type of the action: ${action.type}`
});

const toSuccess = ({ err, action }) => ({
  msg: `Success: Type of the action: ${action.type}`
});

const fromSFireAuth = authData => {
  if (!authData) return { msg: `Auth: not logged in` };
  return {
    msg: `Auth: logged in as : ${authData.providerData[0].displayName}`
  };
};

export const feedbackReducer = ({
  sFireResError$,
  sFireResSuccess$,
  sFireAuth$
}) => {
  const error$ = sFireResError$.map(toError);
  const success$ = sFireResSuccess$.map(toSuccess);
  const auth$ = sFireAuth$.map(fromSFireAuth);
  const combined = xs.merge(error$, success$, auth$);
  return combined.map(feedback => prevState => ({
    ...prevState,
    feedback
  }));
};