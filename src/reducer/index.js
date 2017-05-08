import xs from "xstream";
import { authReducer } from "./auth.js";
import { formularReducer } from "./formular.js";
import { feedbackReducer } from "./feedback.js";
import { articlesReducer } from "./articles.js";

export const reducer = ({
  sFireResSuccess$,
  sFireResError$,
  sFireAuth$,
  sFireArticles$,
  aAuthLogin$,
  aFormularSubmit$
}) => {
  const authReducer$ = authReducer({
    sFireResError$,
    sFireAuth$,
    aAuthLogin$
  });
  const feedbackReducer$ = feedbackReducer({
    sFireResError$,
    sFireResSuccess$,
    sFireAuth$
  });
  const formularReducer$ = formularReducer({
    sFireResSuccess$,
    sFireAuth$,
    aFormularSubmit$
  });
  const articlesReducer$ = articlesReducer({
    sFireAuth$,
    sFireArticles$,
    aAuthLogin$
  });
  return xs.merge(
    authReducer$,
    feedbackReducer$,
    formularReducer$,
    articlesReducer$
  );
};
