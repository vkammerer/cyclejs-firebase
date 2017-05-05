import xs from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { div, input, span, button, form } from "@cycle/dom";
import flattenSequentially from "xstream/extra/flattenSequentially";

const view = state$ =>
  state$
    .map(articles =>
      articles.map(article =>
        div([span(article.username), span(": "), span(article.content)])
      )
    )
    .map(articles => div(articles));

const Articles = sources => {
  const DOM$ = view(sources.props);

  return {
    DOM: DOM$
  };
};

export default Articles;
