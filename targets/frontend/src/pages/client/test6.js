/** @jsx jsx  */
import { jsx } from "theme-ui";

const Test6 = () => {
  if (Math.random > 0.3) {
    // ???
    throw new Error({ statusCode: 404 });
  }

  return <h1>Client Test 3</h1>;
};

export default Test6;
