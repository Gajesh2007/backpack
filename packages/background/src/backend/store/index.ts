// This "store" module defines all the persistent model objects for the storage
// layer of the app.

import { LocalStorageDb } from "./db";

export * from "./preferences";
export * from "./navigation";
export * from "./db";
export * from "./keyring";
export * from "./keyname";
export * from "./feature-gates";
export * from "./xnft-preferences";
export * from "./usernames";

export function reset() {
  return LocalStorageDb.reset();
}
