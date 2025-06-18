import * as React from "react";
import { memo } from "react";

const DeleteColumn = (props: any) => (
  <svg
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g>
      <path d="m6 4v16h2.67363c.35561.7486.84016 1.424 1.42497 1.9976-.0327.0016-.0655.0024-.0986.0024h-4c-1.10457 0-2-.8954-2-2v-16c0-1.10457.89543-2 2-2h4c1.1046 0 2 .89543 2 2v6.6736c-.7496.3561-1.4259.8415-2 1.4274v-8.101z" />
      <path d="m10 17c0-1.6358.7856-3.0882 2-4.0004.8357-.6277 1.8744-.9996 3-.9996 2.7614 0 5 2.2386 5 5s-2.2386 5-5 5c-1.2123 0-2.3239-.4315-3.1895-1.1492-1.106-.9171-1.8105-2.3017-1.8105-3.8508zm2 1h6v-2h-6z" />
    </g>
  </svg>
);

const DeleteColumnMemo = memo(DeleteColumn);
export default DeleteColumnMemo;
