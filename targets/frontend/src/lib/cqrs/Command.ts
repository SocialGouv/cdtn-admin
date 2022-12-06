export interface Command<Type extends string> {
  readonly type: Type;
}
