import { mergeAttributes, Node, wrappingInputRule } from "@tiptap/core";

export interface AlertOptions {}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    alert: {
      setAlert: () => ReturnType;
      toggleAlert: () => ReturnType;
      unsetAlert: () => ReturnType;
    };
  }
}

export const inputRegex = /^\s*>\s$/;

export const Alert = Node.create<AlertOptions>({
  name: "alert",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: "block+",

  group: "block",

  defining: true,

  parseHTML() {
    return [{ tag: "div" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ class: "alert" }, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setAlert:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },
      toggleBlockquote:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      unsetBlockquote:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ];
  },
});
