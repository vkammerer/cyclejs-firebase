import { div, button } from "@cycle/dom";

const model = sourcesProps => sourcesProps.map(props => props.feedback);

const view = state$ =>
  state$
    .map(feedback => div([feedback.msg, " ", button(".dismiss", " X ")]))
    .fold((acc, i) => acc.concat(i), [])
    .map(feedbacks => div(feedbacks));

const Feedback = sources => {
  const state = model(sources.props);
  const DOM$ = view(state);
  return {
    DOM: DOM$
  };
};

export default Feedback;
