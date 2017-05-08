import xs from "xstream";

const toUnlogged = () => ({ status: "unlogged" });
const toReady = () => ({ status: "ready" });
const toSubmitting = () => ({ status: "submitting" });

export const formularReducer = ({
  sFireAuth$,
  sFireResSuccess$,
  aFormularSubmit$
}) => {
  const submitting$ = aFormularSubmit$.map(toSubmitting);
  const ready$ = sFireResSuccess$.map(toReady);
  const readyOrSubmitting$ = xs.merge(submitting$, ready$).startWith(toReady());
  return xs
    .combine(sFireAuth$, readyOrSubmitting$)
    .map(([authData, readyOrSubmitting]) => {
      if (!authData) return toUnlogged();
      return readyOrSubmitting;
    })
    .map(formular => prevState => ({
      ...prevState,
      formular
    }));
};
