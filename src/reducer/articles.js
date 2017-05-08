import xs from "xstream";
import { objectPropsToArray } from "../utils";

export const articlesReducer = ({
  sFireAuth$,
  sFireResSuccess$,
  sFireArticles$
}) => {
  const combined = xs.combine(sFireAuth$, sFireArticles$);
  return combined.map(([auth, articles]) => prevState => {
    console.log(auth ? auth.uid : "no auth", articles);
    const articlesArray = objectPropsToArray(articles);
    const augmentedArticles = !auth
      ? articlesArray
      : articlesArray.map(a => {
          if (a.value.uid !== auth.uid) return a;
          return { ...a, value: { ...a.value, userArticle: true } };
        });

    return {
      ...prevState,
      articles: { articles: augmentedArticles }
    };
  });
};
