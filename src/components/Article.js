import xs from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { div, input, span, button, form } from "@cycle/dom";

const formView = article => {
  const disabled = article.value.status === "submitting";
  return div(
    form([
      input(".input", {
        attrs: {
          type: "text",
          value: article.value.content,
          disabled
        }
      }),
      button(".cancel", { attrs: { type: "button" } }, "Cancel"),
      button(
        { attrs: { type: "submit", disabled } },
        article.value.status === "submitting" ? "Submitting..." : "Submit"
      )
    ])
  );
};

const articleView = article =>
  div([
    span(article.value.username),
    span(" said: "),
    span(article.value.content),
    !article.value.userArticle
      ? undefined
      : span([button(".edit", "Edit"), button(".delete", "Delete")])
  ]);

const view = state$ =>
  state$.map(article => {
    if (article.value.status === "editing") return formView(article);
    return articleView(article);
  });

const intent = sources => {
  const edit$ = sources.DOM
    .select(".edit")
    .events("click")
    .map(() => ({ type: "ARTICLE_EDIT" }));
  const cancel$ = sources.DOM
    .select(".cancel")
    .events("click")
    .map(() => ({ type: "ARTICLE_CANCEL" }));
  const delete$ = sources.DOM
    .select(".delete")
    .events("click")
    .map(() => ({ type: "ARTICLE_DELETE" }));
  const input$ = sources.DOM
    .select(".input")
    .events("input")
    .map(e => e.target.value);
  const submit$ = sources.DOM
    .select(".formular")
    .events("submit")
    .map(event => event.preventDefault());
  const validSubmit = submit$
    .compose(sampleCombine(input$))
    .map(([submit, value]) => value);
  const submitAction$ = validSubmit.map(value => ({
    type: "ARTICLE_SUBMIT",
    value
  }));
  return xs.merge(edit$, cancel$, delete$, submitAction$);
};

const reducer = actions$ => {
  const edit$ = actions$
    .filter(a => a.type === "ARTICLE_EDIT")
    .mapTo(prevState => ({
      ...prevState,
      value: { ...prevState.value, status: "editing" }
    }));
  const cancel$ = actions$
    .filter(a => a.type === "ARTICLE_CANCEL")
    .mapTo(prevState => ({
      ...prevState,
      value: { ...prevState.value, status: "read" }
    }));
  const submit$ = actions$
    .filter(a => a.type === "ARTICLE_SUBMIT")
    .mapTo(prevState => ({
      ...prevState,
      value: { ...prevState.value, status: "submitting" }
    }));
  return xs.merge(edit$, cancel$, submit$);
};

const Article = (sources, i) => {
  const DOM = view(sources.onion.state$);
  const actions = intent(sources);
  const reducer$ = reducer(actions);
  return {
    DOM,
    onion: reducer$
  };
};

export default Article;
