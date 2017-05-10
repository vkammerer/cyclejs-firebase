import xs from "xstream";
import { objectPropsToArray } from "../utils";
import { authReducer } from "../reducers/auth";
import { feedbackReducer } from "../reducers/feedback";
import { formularReducer } from "../reducers/formular";
import { articlesReducer } from "../reducers/articles";

const model = (intent$, actions$) => {
  const authReducer$ = authReducer(intent$, actions$);
  const feedbackReducer$ = feedbackReducer(intent$);
  const formularReducer$ = formularReducer(intent$, actions$);
  const articlesReducer$ = articlesReducer(intent$);
  return xs.merge(
    authReducer$,
    feedbackReducer$,
    formularReducer$,
    articlesReducer$
  );
};

export default model;
