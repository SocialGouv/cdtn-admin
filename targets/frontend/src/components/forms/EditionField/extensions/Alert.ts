import { mergeAttributes, Node, wrappingInputRule } from "@tiptap/core";

export interface AlertOptions {}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    alert: {
      setAlert: () => ReturnType;
    };
  }
}

export const inputRegex = /^\s*\!\!\s$/;

export const Alert = Node.create<AlertOptions>({
  name: "alert",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: "block+",

  group: "block",

  parseHTML() {
    return [{ tag: "div.alert" }];
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
