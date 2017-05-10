import { run } from "@cycle/run";
import { makeDOMDriver } from "@cycle/dom";
import onionify from "cycle-onionify";
import main from "./components/main";
import { makeFirebaseDriver } from "./firebaseDriver";
import { firebaseConfig } from "./firebaseConfig";

const drivers = {
  DOM: makeDOMDriver("#root"),
  firebase: makeFirebaseDriver(firebaseConfig)
};

const wrappedMain = onionify(main);

run(wrappedMain, drivers);
