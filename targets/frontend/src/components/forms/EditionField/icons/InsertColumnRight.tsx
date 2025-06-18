import * as React from "react";
import { memo } from "react";

const InsertColumnRight = (props: any) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="m0 0h24v24h-24z" fill="none" />
    <path d="m10 3c.552 0 1 .448 1 1v16c0 .552-.448 1-1 1h-6c-.552 0-1-.448-1-1v-16c0-.552.448-1 1-1zm-1 2h-4v14h4zm9 2c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm1 2h-2v1.999l-2 .001v2l2-.001v2.001h2v-2.001l2 .001v-2l-2-.001z" />
  </svg>
);

const InsertColumnRightMemo = memo(InsertColumnRight);
export default InsertColumnRightMemo;
