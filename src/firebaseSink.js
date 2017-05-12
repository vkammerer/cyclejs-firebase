import xs from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { loginWithFacebook, logout, push, set, remove } from "./firebaseDriver";

const toFirebaseArticleCreation = (value, auth) => ({
  path: "articles",
  value: {
    content: value,
    username: auth.username,
    uid: auth.uid
  }
});

const toFirebaseArticleUpdate = (value, key, auth) => ({
  path: `articles/${key}`,
  value: {
    content: value,
    username: auth.username,
    uid: auth.uid
  }
});

const createArticle = ({ value, auth }) =>
  push(toFirebaseArticleCreation(value, auth));
const updateArticle = ({ value, key, auth }) =>
  set(toFirebaseArticleUpdate(value, key, auth));
const deleteArticle = ({ key }) => remove(`articles/${key}`);

export const firebaseSink = actions$ => {
  const login$ = actions$.filter(a => a.type === "LOGIN_FACEBOOK");
  const logout$ = actions$.filter(a => a.type === "LOGOUT");
  const formular$ = actions$.filter(a => a.type === "FORMULAR_SUBMIT");
  const article$ = actions$.filter(a => a.type === "ARTICLE_SUBMIT");
  const delete$ = actions$.filter(a => a.type === "ARTICLE_DELETE");
  return xs.merge(
    login$.map(loginWithFacebook),
    logout$.map(logout),
    formular$.map(createArticle),
    article$.map(updateArticle),
    delete$.map(deleteArticle)
  );
};
