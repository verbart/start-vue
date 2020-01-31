export const debounce = (fn, delay = 500) => {
  let timeout = null;

  return function (...args) {
    clearTimeout(timeout);

    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
};
