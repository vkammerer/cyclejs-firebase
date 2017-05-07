import xs from "xstream";

const toError = ({ err, action }) => ({
  msg: `Error: Type of the action: ${action.type}`
});

const toSuccess = ({ err, action }) => ({
  msg: `Success: Type of the action: ${action.type}`
});

const fromSFireAuth = authData => {
  if (!authData) return { msg: `Auth: not logged in` };
  return {
    msg: `Auth: logged in as : ${authData.providerData[0].displayName}`
  };
};

export const streamArticles = ({
  sFireAuth$,
  sFireResSuccess$,
  sFireArticles$
}) => {
  return xs.merge(sFireArticles$);
};
