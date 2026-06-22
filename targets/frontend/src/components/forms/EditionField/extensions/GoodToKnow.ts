import { Mark } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    goodToKnow: {
      toggleGoodToKnow: () => ReturnType;
    };
  }
}

export const GoodToKnow = Mark.create({
  name: "goodToKnow",

  parseHTML() {
    return [{ tag: "span.good-to-know" }];
  },

  renderHTML() {
    return ["span", { class: "good-to-know" }, 0];
  },

  addCommands() {
    return {
      toggleGoodToKnow:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    };
  },
});
