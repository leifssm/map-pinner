import { display } from "~/logger.ts";

declare global {
  interface Promise<T> {
    await: T
  }
}

Object.defineProperty(Promise.prototype, "await", {
  get: function() {
    return new Proxy(this, {
      get: async function(target, prop) {
        if (prop === "then") {
          throw new Error("Cannot use the await property on a promise without accessing a property afterwards.");
        }
        const value = (await target)[prop];
        return typeof value === "function"
          ? value.bind(target)
          : value;
      },
    });
  },
});

display.action.info("Extended promises");
