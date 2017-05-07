import xs from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { p, input, span, button, form } from "@cycle/dom";

const intent = sourcesDOM => {
  const input$ = sourcesDOM
    .select(".input")
    .events("input")
    .map(e => e.target.value);
  const submit$ = sourcesDOM
    .select(".formular")
    .events("submit")
    .map(event => event.preventDefault());
  return {
    submit: submit$
      .compose(sampleCombine(input$))
      .map(([submit, input]) => input)
  };
};

const view = state$ =>
  state$.map(state => {
    if (state.status === "unlogged")
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

const Formular = sources => ({
  DOM: view(sources.props),
  actions: intent(sources.DOM)
});

export default Formular;
