import xs from "xstream";
import { div, input, span, button, form } from "@cycle/dom";

const buttonView = articleValue => {
  if (!articleValue.userArticle) return "";
  return span([button("Edit"), button("Delete")]);
};

const view = state$ =>
  state$.map(state =>
    div(
      !state.articles.length
        ? "No article"
        : state.articles.map(article =>
            div([
              span(article.value.username),
              span(" said: "),
              span(article.value.content),
              buttonView(article.value)
            ])
          )
    )
  );

const reducer = state$ => xs.of(() => ({ articles: [] }));

const Articles = sources => ({
  DOM: view(sources.onion.state$),
  onion: reducer(sources.onion.state$)
});

export default Articles;
