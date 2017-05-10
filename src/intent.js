import xs from "xstream";

const intent = sources => {
  const sFireRes$ = sources.firebase.response
    .map(res => res.replaceError(({ err, action }) => xs.of({ err, action })))
    .flatten();
  const sFireResSuccess$ = sFireRes$.filter(({ err }) => !err);
  const sFireResError$ = sFireRes$.filter(({ err }) => err);
  const sFireAuth$ = sources.firebase.authentication;
  const sFireArticles$ = sources.firebase.on("articles", "value");
  return {
    sFireResSuccess$,
    sFireResError$,
    sFireAuth$,
    sFireArticles$
  };
};

export default intent;
