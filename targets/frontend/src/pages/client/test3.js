/** @jsx jsx  */
import { useEffect } from "react";
import { jsx } from "theme-ui";

const Test3 = () => {
  useEffect(() => {
    throw new Error("Client Test 3");
  }, []);

  return <h1>Client Test 3</h1>;
};

export default Test3;
