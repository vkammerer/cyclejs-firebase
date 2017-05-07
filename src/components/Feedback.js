import { div, button } from "@cycle/dom";

const view = state$ =>
  state$
    .map(state => div([state.msg, " ", button(".dismiss", " X ")]))
    .fold((acc, i) => acc.concat(i), [])
    .map(feedbacks => div(feedbacks));

const Feedback = sources => ({
  DOM: view(sources.props)
});

export default Feedback;
