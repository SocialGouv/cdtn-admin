import { usePrequalifiedQuery } from "./prequalified.query";
import { PrequalifiedForm } from "./PrequalifiedForm";

export const Prequalified = ({ id }: { id: string }): JSX.Element => {
  const prequalified = usePrequalifiedQuery({ id });

  return (
    <>
      <PrequalifiedForm data={prequalified}></PrequalifiedForm>
    </>
  );
};
