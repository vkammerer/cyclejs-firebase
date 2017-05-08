import xs from "xstream";
import { div, input, span, button, form } from "@cycle/dom";

const buttonView = articleValue => {
  if (!articleValue.userArticle) return "";
  return span([button("Edit"), button("Delete")]);
};

const view = state$ =>
  state$.map(article => {
    if (!article.value) return div("");
    return div([
      span(".delete", article.value.username),
      span(" said: "),
      span(article.value.content),
      buttonView(article.value)
    ]);
  });

const reducer = sources =>
  sources.DOM
    .select(".delete")
    .events("click")
    .mapTo(function removeReducer(prevState) {
      return undefined;
    });

const Article = sources => {
  return {
    DOM: view(sources.onion.state$),
    onion: reducer(sources)
  };
};

export default Article;
