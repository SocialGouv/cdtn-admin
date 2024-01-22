import { Mark, markInputRule, mergeAttributes } from "@tiptap/core";

export interface TitleOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    title: {
      setTitle: () => ReturnType;
      toggleTitle: () => ReturnType;
      unsetTitle: () => ReturnType;
    };
  }
}

export const starInputRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))$/;
export const starPasteRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))/g;
export const underscoreInputRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))$/;
export const underscorePasteRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))/g;

export const Title = Mark.create<TitleOptions>({
  name: "title",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  content: 'inline*',
  group: 'block',

  defining: true,

  parseHTML() {
    return [
      {
        tag: "span",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes({ class: "title" }, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setTitle:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleTitle:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetTitle:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addInputRules() {
    return [
      markInputRule({
        find: starInputRegex,
        type: this.type,
      }),
      markInputRule({
        find: underscoreInputRegex,
        type: this.type,
      }),
    ];
  },
});
