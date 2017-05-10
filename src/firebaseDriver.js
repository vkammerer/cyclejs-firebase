import xs from "xstream";
import { adapt } from "@cycle/run/lib/adapt";
import { initializeApp, auth } from "firebase";

export const createUserWithEmailAndPassword = (email, password) => ({
  type: "CREATE_USER",
  email,
  password
});
export const loginWithEmailAndPassword = (email, password) => ({
  type: "LOGIN_EMAIL",
  email,
  password
});
export const loginWithFacebook = () => ({ type: "LOGIN_FACEBOOK" });
export const logout = () => ({ type: "LOGOUT" });
export const push = ({ path, value }) => ({ type: "PUSH", path, value });
export const remove = path => ({ type: "REMOVE", path });
export const set = ({ path, value }) => ({ type: "SET", path, value });
export const transaction = ({ path, updateFn }) => ({
  type: "TRANSACTION",
  path,
  updateFn
});
export const update = ({ path, value }) => ({ type: "UPDATE", path, value });

export const makeFirebaseDriver = config => output$ => {
  const app = initializeApp(config);
  const appAuth = app.auth();
  const appDatabase = app.database();

  let responseListener = undefined;

  const handleResponse = (promise, action) => {
    if (!responseListener) return;
    const responseStream = adapt(
      xs.create({
        start: listener =>
          promise.then(
            () => listener.next({ action }),
            err => listener.error({ err, action })
          ),
        stop: () => {}
      })
    );
    responseListener.next(responseStream);
  };

  output$.addListener({
    complete: () => {},
    error: err => console.error("Firebase sink error:", err),
    next: action => {
      switch (action.type) {
        case "CREATE_USER": {
          handleResponse(
            appAuth.createUserWithEmailAndPassword(
              action.email,
              action.password
            ),
            action
          );
          break;
        }
        case "LOGIN_EMAIL": {
          handleResponse(
            appAuth.signInWithEmailAndPassword(action.email, action.password),
            action
          );
          break;
        }
        case "LOGIN_FACEBOOK": {
          const provider = new auth.FacebookAuthProvider();
          handleResponse(appAuth.signInWithPopup(provider), action);
          break;
        }
        case "LOGOUT": {
          handleResponse(appAuth.signOut(), action);
          break;
        }
        case "PUSH": {
          handleResponse(
            appDatabase.ref(action.path).push(action.value),
            action
          );
          break;
        }
        case "REMOVE": {
          handleResponse(appDatabase.ref(action.path).remove(), action);
          break;
        }
        case "SET": {
          handleResponse(
            appDatabase.ref(action.path).set(action.value),
            action
          );
          break;
        }
        default:
          console.error("Firebase driver: ACTION TYPE NOT VALID");
          break;
      }
    }
  });

  return {
    authentication: adapt(
      xs.create({
        start: listener =>
          app.auth().onAuthStateChanged(user => listener.next(user)),
        stop: () => {}
      })
    ),
    on: (path, eventType) =>
      adapt(
        xs.create({
          start: listener =>
            appDatabase
              .ref(path)
              .on(eventType, snapshot => listener.next(snapshot.val())),
          stop: () => {}
        })
      ),
    response: adapt(
      xs.create({
        start: listener => (responseListener = listener),
        stop: () => (responseListener = undefined)
      })
    )
  };
};
