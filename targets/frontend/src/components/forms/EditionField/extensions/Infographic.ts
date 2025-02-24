import { Node } from "@tiptap/core";

export interface InfographicOptions {
  baseUrl: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    infographic: {
      setInfographic: (
        infoName: string,
        pdfName: string,
        sizePdf: string
      ) => ReturnType;
      updateInfographicSrc: (
        newInfoName: string,
        newPdfName: string,
        newPdfSize: string
      ) => ReturnType;
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
      infoName: {
        parseHTML: (element) =>
          element
            .querySelector("div.infographic")
            ?.getAttribute("data-infographic"),
        renderHTML: (attributes) => {
          return { "data-infographic": attributes.infoName };
        },
      },
      pdfName: {
        parseHTML: (element) =>
          element.querySelector("div.infographic")?.getAttribute("data-pdf"),
        renderHTML: (attributes) => {
          return { "data-pdf": attributes.pdfName };
        },
      },
      pdfSize: {
        parseHTML: (element) =>
          element
            .querySelector("div.infographic")
            ?.getAttribute("data-pdf-size"),
        renderHTML: (attributes) => {
          return { "data-pdf-size": attributes.pdfSize };
        },
      },
    };
  },

  content: "block+",

  group: "block",

  parseHTML() {
    return [
      {
        tag: "div.infographic",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            infoName: el.getAttribute("data-infographic") || "",
            pdfName: el.getAttribute("data-pdf") || "",
            pdfSize: el.getAttribute("data-pdf-size") || "",
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
        "data-pdf": HTMLAttributes["data-pdf"],
        "data-pdf-size": HTMLAttributes["data-pdf-size"],
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
      ["div", {}, 0],
    ];
  },

  addCommands() {
    return {
      setInfographic:
        (infoName: string, pdfName: string, pdfSize: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { infoName, pdfName, pdfSize },
            content: [
              {
                type: "details",
                content: [
                  {
                    type: "detailsSummary",
                    content: [
                      {
                        type: "text",
                        text: "Afficher le contenu de l'infographie",
                      },
                    ],
                  },
                  {
                    type: "detailsContent",
                    content: [
                      {
                        type: "paragraph",
                        content: [
                          {
                            type: "text",
                            text: "Décrire ici le contenu de l'infographie",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          });
        },

      updateInfographicSrc:
        (newInfoName: string, newPdfName: string, newPdfSize: string) =>
        ({ state, chain }) => {
          const { selection } = state;
          const node = selection.$anchor.node();

          if (node.type.name !== "infographic") {
            return false;
          }
          return chain()
            .updateAttributes("infographic", {
              infoName: newInfoName,
              pdfName: newPdfName,
              pdfSize: newPdfSize,
            })
            .run();
        },

      removeInfographic:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const node = selection.$anchor.node();

          if (node.type.name !== "infographic") {
            return false;
          }

          if (dispatch) {
            const tr = state.tr.delete(
              selection.$anchor.before(),
              selection.$anchor.after()
            );
            dispatch(tr);
          }

          return true;
        },
    };
  },
});
