import { Node } from "@tiptap/core";

export interface InfographicOptions {
  baseUrl: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    infographic: {
      setInfographic: (infoId: string, infoFileName: string) => ReturnType;
      removeInfographic: () => ReturnType;
    };
  }
}

export const Infographic = Node.create<InfographicOptions>({
  name: "infographic",
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      baseUrl: "",
    };
  },

  addAttributes() {
    return {
      infoId: {
        parseHTML: (element) =>
          element
            .querySelector("div.infographic")
            ?.getAttribute("data-infographic-id"),
        renderHTML: (attributes) => {
          return { "data-infographic-id": attributes.infoId };
        },
      },
      infoFileName: {
        parseHTML: (element) =>
          element
            .querySelector("div.infographic")
            ?.getAttribute("data-infographic"),
        renderHTML: (attributes) => {
          return { "data-infographic": attributes.infoFileName };
        },
      },
    };
  },

  atom: true,

  group: "block",

  parseHTML() {
    return [
      {
        tag: "div.infographic",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            infoId: el.getAttribute("data-infographic-id") || "",
            infoFileName: el.getAttribute("data-infographic") || "",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        class: "infographic",
        "data-infographic-id": HTMLAttributes["data-infographic-id"],
        "data-infographic": HTMLAttributes["data-infographic"],
      },
      [
        "img",
        {
          src: `${this.options.baseUrl}/${HTMLAttributes["data-infographic"]}`,
          height: "auto",
          width: "500",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setInfographic:
        (infoId: string, infoFileName: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { infoId, infoFileName },
          });
        },

      removeInfographic:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;

          const selectedNode = (selection as any).node;
          if (selectedNode && selectedNode.type.name === "infographic") {
            if (dispatch) {
              dispatch(state.tr.deleteSelection());
            }
            return true;
          }

          const { $from } = selection;
          for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name === "infographic") {
              if (dispatch) {
                const pos = $from.before(d);
                dispatch(state.tr.delete(pos, pos + node.nodeSize));
              }
              return true;
            }
          }

          return false;
        },
    };
  },
});
