import xs from "xstream";
import { objectPropsToArray } from "../utils";

const augmentArticles = (auth, articlesArr) =>
  articlesArr.map(a => ({
    ...a,
    userArticle: a.value.uid === auth.uid
  }));

const toAugmentedArticles = ({ auth, articles }) =>
  augmentArticles(auth, objectPropsToArray(articles));

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
    loggedArticles$.map(toAugmentedArticles)
  );
  return all.map(articles => prev => ({ ...prev, articles }));
};
