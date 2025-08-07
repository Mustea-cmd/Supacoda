// Web worker for running ESLint in the browser
import { Linter } from "eslint4b";

self.onmessage = function (e) {
  const { code, config } = e.data;
  const linter = new Linter();
  let messages = [];
  try {
    messages = linter.verify(code, config);
  } catch (err) {
    messages = [{
      fatal: true,
      message: err.message,
      line: 1,
      column: 1,
    }];
  }
  self.postMessage(messages);
};
