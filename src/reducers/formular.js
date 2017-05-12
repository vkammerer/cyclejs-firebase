import xs from "xstream";
import { toLogged } from "./auth";

const anonymous = { status: "anonymous" };
const toReady = auth => ({ status: "ready", auth: toLogged(auth) });
const toSubmitting = auth => ({ status: "submitting", auth: toLogged(auth) });

export const formularReducer = ({ sFireAuth$, sFireResSuccess$ }, actions$) => {
  const sFireAuthLogged$ = sFireAuth$.filter(d => !!d);
  const sFireAuthAnonymous$ = sFireAuth$.filter(d => !d);
  const aSubmit$ = actions$.filter(a => a.type === "FORMULAR_SUBMIT");
  const validASubmit$ = xs
    .combine(sFireAuth$, aSubmit$)
    .map(arr => arr[0])
    .filter(d => !!d);
  const validSFireResSuccess$ = xs
    .combine(sFireAuth$, sFireResSuccess$)
    .map(arr => arr[0])
    .filter(d => !!d);
  const all = xs.merge(
    sFireAuthAnonymous$.mapTo(anonymous),
    sFireAuthLogged$.map(toReady),
    validASubmit$.map(toSubmitting),
    validSFireResSuccess$.map(toReady)
  );
  return all.map(formular => prev => ({ ...prev, formular }));
};
