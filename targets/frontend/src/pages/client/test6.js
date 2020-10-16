/** @jsx jsx  */
import { jsx } from "theme-ui";

const Test6 = () => {
  const thrower = (error) => {
    throw new Error(error);
  };

  return (
    <>
      <h1>Client Test 3</h1>
      <button onClick={() => thrower({ errorCode: 404 })}>
        Tentative de 404 on y croiiiis
      </button>
      <button onClick={() => thrower("bon bon")}>On se replie !</button>
    </>
  );
};

export default Test6;
