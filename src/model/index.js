import xs from "xstream";
import { streamAuth } from "./auth.js";
import { streamFeedback } from "./feedback.js";
import { streamFormular } from "./formular.js";

/* APP */
export const model = ({
  sFireResError$,
  sFireResSuccess$,
  sFireAuth$,
  aAuthLoginProxy$,
  aFormularSubmitProxy$,
  sFireArticles$
}) => ({
  auth$: streamAuth({
    sFireResError$,
    sFireAuth$,
    aAuthLoginProxy$
  }),
  feedback$: streamFeedback({
    sFireResError$,
    sFireResSuccess$,
    sFireAuth$
  }),
  formular$: streamFormular({
    sFireAuth$,
    sFireResSuccess$,
    aFormularSubmitProxy$
  }),
  articles$: sFireArticles$
});
