import * as React from "react";
import { memo } from "react";

const DeleteRow = (props: any) => (
  <svg
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g>
      <path d="m20 6h-16v4h8.101c-.5859.5741-1.0713 1.2504-1.4274 2h-6.6736c-1.10457 0-2-.8954-2-2v-4c0-1.10457.89543-2 2-2h16c1.1046 0 2 .89543 2 2v4c0 .0331-.0008.0659-.0024.0986-.5736-.58481-1.249-1.06936-1.9976-1.42497z" />
      <path d="m20.8508 11.8105c-.9171-1.106-2.3017-1.8105-3.8508-1.8105-1.6358 0-3.0882.7856-4.0004 2-.6277.8357-.9996 1.8744-.9996 3 0 2.7614 2.2386 5 5 5s5-2.2386 5-5c0-1.2123-.4315-2.3239-1.1492-3.1895zm-.8508 2.1895v2h-6v-2z" />
    </g>
  </svg>
);

const DeleteRowMemo = memo(DeleteRow);
export default DeleteRowMemo;
