//@ts-expect-error
import nctx from "nctx";

export const context = nctx.create(Symbol("app"));
