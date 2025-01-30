import { Node } from "@tiptap/core";

export interface InfographicOptions {}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    infographic: {
      setInfographic: (
        src: string,
        urlPdf: string,
        sizePdf: string
      ) => ReturnType;
      updateInfographicSrc: (
        newSrc: string,
        newUrlPdf: string,
        newSizePdf: string
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
    };
  },

  addAttributes() {
    return {
      src: {
        parseHTML: (element) =>
          element.querySelector("img")?.getAttribute("src"),
        renderHTML: (attributes) => {
          return { src: attributes.src };
        },
      },
      urlPdf: {
        parseHTML: (element) =>
          element.querySelector("div.infographic")?.getAttribute("data-pdf"),
        renderHTML: (attributes) => {
          return { "data-pdf": attributes.urlPdf };
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
            src: el.querySelector("img")?.getAttribute("src") || "",
            urlPdf: el.getAttribute("data-pdf") || "",
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
      },
      [
        "img",
        {
          src: HTMLAttributes.src,
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
        (src: string, urlPdf: string, pdfSize: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { src, urlPdf, pdfSize },
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
        (newSrc: string, newUrlPdf: string, newSizePdf: string) =>
        ({ state, chain }) => {
          const { selection } = state;
          const node = selection.$anchor.node();

          if (node.type.name !== "infographic") {
            return false;
          }
          return chain()
            .updateAttributes("infographic", {
              src: newSrc,
              urlPdf: newUrlPdf,
              pdfSize: newSizePdf,
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
