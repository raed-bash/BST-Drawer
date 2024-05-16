export function debounce(fun, delay = 1000) {
  let timeId;

  return function (...args) {
    clearInterval(timeId);

    timeId = setTimeout(() => {
      fun.apply(this, args);
    }, delay);
  };
}
