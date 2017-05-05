import { div, p, span, button } from "@cycle/dom";

const intent = sourceDOM => ({
  logout: sourceDOM.select(".logout").events("click"),
  login: sourceDOM.select(".login").events("click")
});

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

const Auth = sources => {
  const { logout, login } = intent(sources.DOM);
  const DOM$ = view(sources.props);

  return {
    DOM: DOM$,
    actions: { logout, login }
  };
};

export default Auth;
