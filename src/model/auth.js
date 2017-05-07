import xs from "xstream";

/* AUTH */
const toAnonymous = () => ({
  status: "anonymous",
  username: null,
  uid: null
});

const toAwaiting = () => ({
  status: "awaiting_response",
  username: null,
  uid: null
});

const fromSFireAuth = authData => {
  if (!authData) return toAnonymous();
  return {
    status: "logged_in",
    username: authData.providerData[0].displayName,
    uid: authData.uid
  };
};

export const streamAuth = ({
  sFireResError$,
  sFireAuth$,
  aAuthLoginProxy$
}) => {
  const fireAuth$ = sFireAuth$.map(fromSFireAuth);
  const login$ = aAuthLoginProxy$.map(toAwaiting);
  const resError$ = sFireResError$
    .filter(({ action }) => action.type === "LOGIN_FACEBOOK")
    .map(toAnonymous);
  return xs.merge(fireAuth$, login$, resError$);
};
