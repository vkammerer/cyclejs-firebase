import xs from "xstream";

const toAnonymous = () => ({ status: "anonymous" });
const toReady = () => ({ status: "ready" });
const toSubmitting = () => ({ status: "submitting" });

export const formularReducer = ({ sFireAuth$, sFireResSuccess$ }, actions$) => {
  const sFireAuthLogged$ = sFireAuth$.filter(d => !!d);
  const sFireAuthAnonymous$ = sFireAuth$.filter(d => !d);
  const aSubmit$ = actions$.filter(a => a.type === "FORMULAR_SUBMIT");
  const validASubmit$ = xs
    .combine(sFireAuth$, aSubmit$)
    .filter(arr => arr[0])
    .map(arr => arr[1]);
  const validSFireResSuccess$ = xs
    .combine(sFireAuth$, sFireResSuccess$)
    .filter(arr => arr[0])
    .map(arr => arr[1]);
  const all = xs.merge(
    sFireAuthAnonymous$.map(toAnonymous),
    sFireAuthLogged$.map(toReady),
    validASubmit$.map(toSubmitting),
    validSFireResSuccess$.map(toReady)
  );
  return all.map(formular => prev => ({ ...prev, formular }));
};
