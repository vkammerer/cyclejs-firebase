import xs from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { loginWithFacebook, logout, push } from "../firebaseDriver";

export const streamFirebase = ({
  stateAuth$,
  aAuthLoginProxy$,
  aAuthLogout$,
  aFormularSubmitProxy$
}) => {
  const login$ = aAuthLoginProxy$.map(loginWithFacebook);
  const logout$ = aAuthLogout$.map(logout);
  const formularSubmit$ = aFormularSubmitProxy$
    .compose(sampleCombine(stateAuth$))
    .filter(([formularValue, auth]) => auth.status === "logged_in")
    .map(([formularValue, auth]) =>
      push({
        path: "articles",
        value: {
          content: formularValue,
          username: auth.username,
          uid: auth.uid
        }
      })
    );
  return xs.merge(login$, logout$, formularSubmit$);
};
