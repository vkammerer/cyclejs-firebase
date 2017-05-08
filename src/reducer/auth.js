import xs from "xstream";

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

const toLoggedIn = data => ({
  status: "logged_in",
  username: data.providerData[0].displayName,
  uid: data.uid
});

export const authReducer = ({ sFireResError$, sFireAuth$, aAuthLogin$ }) => {
  const fireAuthLoggedIn$ = sFireAuth$.filter(data => data).map(toLoggedIn);
  const fireAuthLoggedOut$ = sFireAuth$.filter(data => !data).map(toAnonymous);
  const login$ = aAuthLogin$.map(toAwaiting);
  const resLoginError$ = sFireResError$
    .filter(({ action }) => action.type === "LOGIN_FACEBOOK")
    .map(toAnonymous);
  const combined = xs.merge(
    fireAuthLoggedIn$,
    fireAuthLoggedOut$,
    login$,
    resLoginError$
  );
  return combined.map(auth => prevState => ({
    ...prevState,
    auth
  }));
};
