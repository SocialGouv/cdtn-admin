import { mergeAttributes, Node, textblockTypeInputRule } from "@tiptap/core";

export type Level = "title" | "sub-title";

export interface TitleOptions {
  levels: Level[];
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    title: {
      setTitle: (attributes: { level: Level }) => ReturnType;
      toggleTitle: (attributes: { level: Level }) => ReturnType;
      unsetTitle: () => ReturnType;
    };
  }
}

export const Title = Node.create<TitleOptions>({
  name: "title",

  addOptions() {
    return {
      levels: ["title", "sub-title"],
      HTMLAttributes: {},
    };
  },

  content: "inline*",

  group: "block",

  defining: true,

  addAttributes() {
    return {
      level: {
        parseHTML: (element) => element.getAttribute("class"),
        rendered: false,
      },
    };
  },

  parseHTML() {
    return this.options.levels.map((level: Level) => ({
      tag: `span`,
      getAttrs: (node) =>
        (node as HTMLSpanElement).className === level ? null : false,
    }));
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({ class: `${node.attrs.level}` }, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setTitle:
        (attributes) =>
        ({ commands }) => {
          if (!this.options.levels.includes(attributes.level)) {
            return false;
          }

          return commands.setNode(this.name, attributes);
        },
      toggleTitle:
        (attributes) =>
        ({ commands }) => {
          if (!this.options.levels.includes(attributes.level)) {
            return false;
          }

          return commands.toggleNode(this.name, "paragraph", attributes);
        },
      unsetTitle:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
