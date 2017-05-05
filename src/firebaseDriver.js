import xs from "xstream";
import { adapt } from "@cycle/run/lib/adapt";
import { initializeApp, auth } from "firebase";

export const makeFirebaseDriver = config => output$ => {
  const firebaseApp = initializeApp(config);
  const firebaseAuth = firebaseApp.auth();
  const firebaseDatabase = firebaseApp.database();

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
        case "AUTH_FACEBOOK": {
          const provider = new auth.FacebookAuthProvider();
          handleResponse(firebaseAuth.signInWithPopup(provider), action);
          break;
        }
        case "AUTH_LOGOUT": {
          handleResponse(firebaseAuth.signOut(), action);
          break;
        }
        case "PUSH": {
          console.log(action);

          // handleResponse(
          //   firebaseAuth.ref(action.path).push(action.values),
          //   action
          // );
          break;
        }
        case "REMOVE": {
          handleResponse(firebaseDatabase.ref(action.path).remove(), action);
          break;
        }
        case "SET": {
          handleResponse(
            firebaseAuth.ref(action.path).set(action.values),
            action
          );
          break;
        }
        default:
          console.error("ACTION TYPE NOT VALID");
          break;
      }
    }
  });

  return {
    authentication: adapt(
      xs.create({
        start: listener =>
          firebaseApp.auth().onAuthStateChanged(user => listener.next(user)),
        stop: () => {}
      })
    ),
    on: (path, eventType) =>
      adapt(
        xs.create({
          start: listener =>
            firebaseDatabase
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
