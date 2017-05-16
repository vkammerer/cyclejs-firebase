import xs from "xstream";

const anonymous = {
  status: "anonymous",
  username: null,
  uid: null
};

const awaiting = {
  status: "awaiting_response",
  username: null,
  uid: null
};

export const toLogged = data => ({
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
    ({ action }) => action.type === "LOGIN_FACEBOOK"
  );
  const all = xs.merge(
    aLogin$.mapTo(awaiting),
    aLogout$.mapTo(anonymous),
    sFireAuthLogged$.map(toLogged),
    sFireAuthAnonymous$.mapTo(anonymous),
    sFireResLoginError$.mapTo(anonymous)
  );
  return all.map(auth => prev => ({ ...prev, auth }));
};
