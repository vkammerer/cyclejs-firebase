import xs from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { loginWithFacebook, logout, push } from "./firebaseDriver";

const toFormular = (formularValue, auth) => ({
  path: "articles",
  value: {
    content: formularValue,
    username: auth.username,
    uid: auth.uid
  }
});

// export const firebaseSink = ({
//   state$,
//   aAuthLogin$,
//   aAuthLogout$,
//   aFormularSubmit$
// }) => {
//   const stateAuth$ = state$.map(state => state.auth);
//   const login$ = aAuthLogin$.map(loginWithFacebook);
//   const logout$ = aAuthLogout$.map(logout);
//   const formularAndAuthOnSubmit$ = aFormularSubmit$
//     .compose(sampleCombine(stateAuth$))
//     .filter(([formularValue, auth]) => auth.status === "logged_in");
//   const formular$ = formularAndAuthOnSubmit$.map(([formularValue, auth]) =>
//     push(toFormular(formularValue, auth))
//   );
//   return xs.merge(login$, logout$, formular$);
// };

export const firebaseSink = (state$, actions$) => {
  const stateAuth$ = state$.map(state => state.auth);
  const login$ = actions$
    .filter(a => a.type === "LOGIN_FACEBOOK")
    .map(loginWithFacebook);
  const logout$ = actions$.filter(a => a.type === "LOGOUT").map(logout);
  const formularSubmit$ = actions$
    .filter(a => a.type === "FORMULAR_SUBMIT")
    .map(a => a.value);
  const formularAndAuthOnSubmit$ = formularSubmit$
    .compose(sampleCombine(stateAuth$))
    .filter(([formularValue, auth]) => auth.status === "logged_in");
  const formular$ = formularAndAuthOnSubmit$.map(([formularValue, auth]) =>
    push(toFormular(formularValue, auth))
  );
  return xs.merge(login$, logout$, formular$);
};
