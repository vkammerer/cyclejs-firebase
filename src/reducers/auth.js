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

const toLogged = data => ({
  status: "logged",
  username: data.providerData[0].displayName,
  uid: data.uid
});

export const authReducer = ({ sFireResError$, sFireAuth$ }, actions$) => {
  const aLogin$ = actions$.filter(a => a.type === "LOGIN_FACEBOOK");
  const aLogout$ = actions$.filter(a => a.type === "LOGOUT");
  const sFireAuthLogged$ = sFireAuth$.filter(d => !!d);
  const sFireAuthAnonymous$ = sFireAuth$.filter(d => !d);
  const sFireResLoginError$ = sFireResError$.filter(
    ({ a }) => a.type === "LOGIN_FACEBOOK"
  );
  const all = xs.merge(
    aLogin$.map(toAwaiting),
    aLogout$.map(toAnonymous),
    sFireAuthLogged$.map(toLogged),
    sFireAuthAnonymous$.map(toAnonymous),
    sFireResLoginError$.map(toAnonymous)
  );
  return all.map(auth => prev => ({ ...prev, auth }));
};
