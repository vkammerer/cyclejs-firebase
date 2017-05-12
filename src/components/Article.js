import xs from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { div, input, span, button, form } from "@cycle/dom";

const formView = article => {
  const { status, content, username } = article.value;
  const disabled = status === "submitting";
  return form(".form", [
    span(`${username} said: `),
    input(".input", {
      attrs: { type: "text", value: content, disabled }
    }),
    span(" "),
    button(".cancel", { attrs: { type: "button" } }, "Cancel"),
    span(" "),
    button(
      { attrs: { type: "submit", disabled } },
      status === "submitting" ? "Submitting..." : "Submit"
    )
  ]);
};

const articleView = article =>
  div([
    span(`${article.value.username} said: ${article.value.content} `),
    article.value.uid !== article.auth.uid
      ? undefined
      : span([button(".edit", "Edit"), span(" "), button(".delete", "Delete")])
  ]);

const view = state$ =>
  state$.map(article => {
    if (article.value.status === "editing") return formView(article);
    return articleView(article);
  });

const intent = sources => {
  const auth$ = sources.onion.state$.map(state => state.auth);
  const key$ = sources.onion.state$.map(state => state.key);
  const edit$ = sources.DOM
    .select(".edit")
    .events("click")
    .mapTo({ type: "ARTICLE_EDIT" });
  const cancel$ = sources.DOM
    .select(".cancel")
    .events("click")
    .mapTo({ type: "ARTICLE_CANCEL" });
  const delete$ = sources.DOM
    .select(".delete")
    .events("click")
    .compose(sampleCombine(key$))
    .map(([edit, key]) => ({ type: "ARTICLE_DELETE", key }));
  const input$ = sources.DOM
    .select(".input")
    .events("input")
    .map(e => e.target.value);
  const unvalueSubmit$ = sources.DOM
    .select("form")
    .events("submit")
    .map(e => e.preventDefault());
  const valueSubmit = unvalueSubmit$
    .compose(sampleCombine(input$))
    .compose(sampleCombine(auth$))
    .compose(sampleCombine(key$))
    .map(([[[submit, value], auth], key]) => ({ value, auth, key }));
  const submit$ = valueSubmit.map(({ value, auth, key }) => ({
    type: "ARTICLE_SUBMIT",
    value,
    key,
    auth
  }));
  return xs.merge(edit$, cancel$, delete$, submit$);
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
    actions,
    onion: reducer$
  };
};

export default Article;
