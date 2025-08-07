// Web worker for running Prettier in the browser
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import parserTypescript from "prettier/parser-typescript";

self.onmessage = function (e) {
  const { code, options } = e.data;
  let formatted = code;
  let error = null;
  try {
    formatted = prettier.format(code, {
      ...options,
      plugins: [parserBabel, parserTypescript],
    });
  } catch (err) {
    error = (err as Error).message;
  }
  self.postMessage({ formatted, error });
};
