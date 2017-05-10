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

const intent = sourcesDOM => {
  const input$ = sourcesDOM
    .select(".input")
    .events("input")
    .map(e => e.target.value);
  const submit$ = sourcesDOM
    .select(".formular")
    .events("submit")
    .map(event => event.preventDefault());
  const validSubmit = submit$
    .compose(sampleCombine(input$))
    .map(([submit, value]) => value);
  return validSubmit.map(value => ({
    type: "FORMULAR_SUBMIT",
    value
  }));
};

const Formular = sources => {
  const DOM = view(sources.onion.state$);
  const reducer$ = xs.of(prevState => ({ status: "anonymous" }));
  const actions = intent(sources.DOM);
  return {
    DOM,
    onion: reducer$,
    actions
  };
};

export default Formular;
