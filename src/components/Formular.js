import xs from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { p, input, span, button, form } from "@cycle/dom";

const view = state$ =>
  state$.map(state => {
    if (state.status === "anonymous")
      return p("Log in to add a new article of your own!");
    return form(".formular", [
      p([
        input(".input", {
          attrs: {
            type: "text",
            placeholder: "write something clever!",
            disabled: state.status === "submitting"
          }
        }),
        span(" "),
        button(
          {
            attrs: {
              type: "submit",
              disabled: state.status === "submitting"
            }
          },
          [state.status === "submitting" ? "Submitting..." : "Submit"]
        )
      ])
    ]);
  });

const intent = sources => {
  const auth$ = sources.onion.state$.map(state => state.auth);
  const input$ = sources.DOM
    .select(".input")
    .events("input")
    .map(e => e.target.value);
  const submit$ = sources.DOM
    .select(".formular")
    .events("submit")
    .map(event => event.preventDefault());
  const valueSubmit = submit$
    .compose(sampleCombine(input$))
    .compose(sampleCombine(auth$))
    .map(([[submit, value], auth]) => ({ value, auth }));
  return valueSubmit.map(({ value, auth }) => ({
    type: "FORMULAR_SUBMIT",
    value,
    auth
  }));
};

const Formular = sources => {
  const DOM = view(sources.onion.state$);
  const reducer$ = xs.of(prevState => ({ status: "anonymous" }));
  const actions = intent(sources);
  return {
    DOM,
    onion: reducer$,
    actions
  };
};

export default Formular;
