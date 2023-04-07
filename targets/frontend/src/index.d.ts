declare module "*.graphql" {
  const content: any;
  export default content;
}

declare module "@codegouvfr/react-dsfr/next-pagesdir" {
  interface RegisterLink {
    Link: typeof Link;
  }
}
