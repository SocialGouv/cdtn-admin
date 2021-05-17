declare module "unist-util-find" {
  export default function find<T, N>(
    root: T,
    matcher: (node: N) => boolean
  ): N | undefined;
}
