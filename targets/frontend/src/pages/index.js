/** @jsx jsx  */
import Link from "next/link";
import { jsx } from "theme-ui";

export const IndexPage = () => (
  <div style={{ margin: "0 auto", maxWidth: 700 }}>
    <ul>
      <li>Client exceptions</li>
      <ul>
        <li>
          There is a top-of-module Promise that rejects, but its result is not
          awaited. Sentry should record Error(Client Test 1).{" "}
          <Link href="/client/test1">
            <a>Perform client side navigation</a>
          </Link>{" "}
          or{" "}
          <a href="/client/test1" target="_blank">
            Open in a new tab
          </a>
        </li>
        <li>
          There is a top-of-module exception. _error.js should render and record
          ReferenceError(process is not defined) in Sentry.{" "}
          <Link href="/client/test2">
            <a>Perform client side navigation</a>
          </Link>{" "}
          or{" "}
          <a href="/client/test2" target="_blank">
            Open in a new tab
          </a>
        </li>
        <li>
          There is an exception during React lifecycle that is caught by Next.js
          React Error Boundary. In this case, when the component mounts. This
          should cause _error.js to render and record Error(Client Test 3) in
          Sentry.{" "}
          <Link href="/client/test3">
            <a>Perform client side navigation</a>
          </Link>{" "}
          or{" "}
          <a href="/client/test3" target="_blank">
            Open in a new tab
          </a>
        </li>
        <li>
          There is an unhandled Promise rejection during React lifecycle. In
          this case, when the component mounts. Sentry should record
          Error(Client Test 4).{" "}
          <Link href="/client/test4">
            <a>Perform client side navigation</a>
          </Link>{" "}
          or{" "}
          <a href="/client/test4" target="_blank">
            Open in a new tab
          </a>
        </li>
        <li>
          An Error is thrown from an event handler. Sentry should record
          Error(Client Test 5).{" "}
          <Link href="/client/test5">
            <a>Perform client side navigation</a>
          </Link>{" "}
          or{" "}
          <a href="/client/test5" target="_blank">
            Open in a new tab
          </a>
        </li>
        <li>
          An Error is thrown in the most simple way. Error page should be shown.
          Sentry should record Error(Client Test 6).{" "}
          <Link href="/client/test6">
            <a>Perform client side navigation</a>
          </Link>{" "}
          or{" "}
          <a href="/client/test6" target="_blank">
            Open in a new tab
          </a>
        </li>
      </ul>
    </ul>
  </div>
);

export default IndexPage;
