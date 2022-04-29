export const addTargetTop = (input: string) => {
  let start = null;

  for (let i = 0; i < input.length; i++) {
    if (input[i] === "a" && input[i - 1] === "<") {
      start = i;
    }

    if (start !== null && input[i] === ">") {
      const insertable = ' target="_top"';
      input = input.slice(0, start + 1) + insertable + input.slice(start + 1);
      i += insertable.length;
      start = null;
    }
  }

  return input;
};
