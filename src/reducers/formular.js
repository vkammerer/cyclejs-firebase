import xs from "xstream";

const toAnonymous = () => ({ status: "anonymous" });
const toReady = () => ({ status: "ready" });
const toSubmitting = () => ({ status: "submitting" });

export const formularReducer = ({ sFireAuth$, sFireResSuccess$ }, actions$) => {
  const submitting$ = actions$
    .filter(a => a.type === "FORMULAR_SUBMIT")
    .map(toSubmitting);
  const ready$ = sFireResSuccess$.map(toReady);
  const readyOrSubmitting$ = xs.merge(submitting$, ready$).startWith(toReady());
  return xs
    .combine(sFireAuth$, readyOrSubmitting$)
    .map(([authData, readyOrSubmitting]) => {
      if (!authData) return toAnonymous();
      return readyOrSubmitting;
    })
    .map(formular => prevState => ({
      ...prevState,
      formular
    }));
};
