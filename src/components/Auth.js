import xs from "xstream";
import { div, p, span, button } from "@cycle/dom";

const view = state$ =>
  state$.map(state => {
    if (state.status === "logged_in")
      return p([
        span(`Logged in as ${state.username}. `),
        button(".logout", "Log out")
      ]);
    else if (state.status === "awaiting_response")
      return p([button({ attrs: { disabled: "true" } }, "authenticating...")]);
    return p([button(".login", "Log in")]);
  });

const intent = sourceDOM => {
  const loginAction$ = sourceDOM
    .select(".login")
    .events("click")
    .map(() => ({ type: "LOGIN_FACEBOOK" }));
  const logoutAction$ = sourceDOM
    .select(".logout")
    .events("click")
    .map(() => ({ type: "LOGOUT" }));
  return xs.merge(loginAction$, logoutAction$);
};

const Auth = sources => {
  const actions = intent(sources.DOM);
  const reducer$ = xs.of(prevState => ({ status: "anonymous" }));
  const DOM = view(sources.onion.state$);
  return {
    DOM,
    onion: reducer$,
    actions
  };
};

export default Auth;
