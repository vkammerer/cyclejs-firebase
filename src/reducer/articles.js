import xs from "xstream";
import { objectPropsToArray } from "../utils";

const augmentArticles = (auth, articlesArray) =>
  !auth
    ? articlesArray
    : articlesArray.map(a => {
        if (a.value.uid !== auth.uid) return a;
        return { ...a, value: { ...a.value, userArticle: true } };
      });

export const articlesReducer = ({
  sFireAuth$,
  sFireResSuccess$,
  sFireArticles$
}) => {
  const combined = xs.combine(sFireAuth$, sFireArticles$);
  return combined.map(([auth, articles]) => prevState => {
    const articlesArray = objectPropsToArray(articles);

    return {
      ...prevState,
      articles: augmentArticles(auth, articlesArray)
    };
  });
};
