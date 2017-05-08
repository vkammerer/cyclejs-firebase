import xs from "xstream";
import { div, button } from "@cycle/dom";

const view = state$ =>
  state$
    .map(state => div([state.msg, " ", button(".dismiss", " X ")]))
    .fold((acc, i) => acc.concat(i), [])
    .map(feedbacks => div(feedbacks));

const reducer = state$ => xs.of(() => [{ msg: "yes" }]);

const Feedback = sources => ({
  DOM: view(sources.onion.state$),
  onion: reducer(sources.onion.state$)
});

export default Feedback;
