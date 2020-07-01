import Git from 'nodegit'

declare module "nodegit" {
    export class Commit extends Git.Commit {
      getTree(): Promise<Tree>
    }
    export class Tree extends Git.Tree {
      diff(tree: Tree, callback?: Function): Promise<Git.Diff>;
    }
}
