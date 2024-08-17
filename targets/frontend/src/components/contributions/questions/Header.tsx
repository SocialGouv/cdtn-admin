import { Breadcrumb, BreadcrumbLink } from "../../utils";
import { useQuestionQuery } from "./Question.query";

type Props = {
  questionId: string;
};

export const Header = ({ questionId }: Props) => {
  const data = useQuestionQuery({ questionId });

  return (
    <>
      <Breadcrumb>
        <BreadcrumbLink href={"/contributions"}>Contributions</BreadcrumbLink>
        <BreadcrumbLink>{`${data?.order} - ${data?.content}`}</BreadcrumbLink>
      </Breadcrumb>
    </>
  );
};
