import xs from "xstream";
import { div, input, span, button, form } from "@cycle/dom";

const view = state$ =>
  state$
    .map(articles =>
      articles.map(article =>
        div([
          span(article.value.username),
          span(": "),
          span(article.value.content)
        ])
      )
    )
    .map(articles => div(articles));

const Articles = sources => ({
  DOM: view(sources.props)
});

export default Articles;
