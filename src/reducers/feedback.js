import xs from "xstream";

const toError = ({ action }) => ({
  msg: `Error: Type of the action: ${action.type}`
});

const successfullArticleCreation = {
  msg: "Article successfully saved!"
};

const successfullArticleEdition = {
  msg: "Article successfully updated!"
};

export const feedbackReducer = ({ sFireResError$, sFireResSuccess$ }) => {
  const successfullArticleCreation$ = sFireResSuccess$.filter(
    ({ action }) => action.type === "PUSH"
  );
  const successfullArticleEdition$ = sFireResSuccess$.filter(
    ({ action }) => action.type === "SET"
  );
  const all = xs.merge(
    sFireResError$.map(toError),
    successfullArticleCreation$.mapTo(successfullArticleCreation),
    successfullArticleEdition$.mapTo(successfullArticleEdition)
  );
  return all.startWith({}).map(feed => prev => ({
    ...prev,
    feedback: prev && prev.feedback ? [...prev.feedback, feed] : []
  }));
};
