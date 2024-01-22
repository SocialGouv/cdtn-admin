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
        default: "title",
        rendered: false,
      },
    };
  },

  parseHTML() {
    return this.options.levels.map((level: Level) => ({
      tag: `span`,
      attrs: { level },
    }));
  },

  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];

    return ["span", mergeAttributes({ class: `${level}` }, HTMLAttributes), 0];
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
    };
  },

  addInputRules() {
    return this.options.levels.map((level) => {
      return textblockTypeInputRule({
        find: new RegExp(`^(#{${level}})\\s$`),
        type: this.type,
        getAttributes: {
          level,
        },
      });
    });
  },
});
