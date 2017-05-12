import xs from "xstream";
import { objectPropsToArray } from "../utils";
import { toLogged } from "./auth";

const augmentArticles = ({ auth, articles }) =>
  objectPropsToArray(articles).map(a => ({ ...a, auth: toLogged(auth) }));

export const articlesReducer = ({ sFireAuth$, sFireArticles$ }) => {
  const c_auth_articles = xs.combine(sFireAuth$, sFireArticles$);
  const anonymousArticles$ = c_auth_articles
    .filter(arr => !arr[0])
    .map(arr => arr[1]);
  const loggedArticles$ = c_auth_articles
    .filter(arr => !!arr[0])
    .map(arr => ({ auth: arr[0], articles: arr[1] }));
  const all = xs.merge(
    anonymousArticles$.map(objectPropsToArray),
    loggedArticles$.map(augmentArticles)
  );
  return all.startWith([]).map(articles => prev => ({ ...prev, articles }));
};
