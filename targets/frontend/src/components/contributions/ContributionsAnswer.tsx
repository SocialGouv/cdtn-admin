import {
  Alert,
  AlertColor,
  Breadcrumbs,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
} from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { MarkdownEditor, TitleBox } from "../utils";
import { useContributionAnswerUpdateMutation } from "./ContributionsAnswer.mutation";
import { useContributionAnswerQuery } from "./ContributionsAnswer.query";

export type ContributionsAnswerProps = {
  questionId: string;
  agreementId: string;
};

export const ContributionsAnswer = ({
  questionId,
  agreementId,
}: ContributionsAnswerProps): JSX.Element => {
  const answer = useContributionAnswerQuery({ agreementId, questionId });
  const [data, setData] = useState(answer);
  const updateAnswer = useContributionAnswerUpdateMutation();
  const [snack, setSnack] = useState<{ open: boolean; severity?: AlertColor }>({
    open: false,
  });
  useEffect(() => {
    setData(answer);
  }, [answer]);
  if (!data || !data.questionId || !data.agreementId) {
    return <></>;
  }
  return (
    <>
      <Breadcrumbs aria-label="breadcrumb">
        <Link href={"/contributions"}>Contributions</Link>
        <Link href={`/contributions/${questionId}`}>
          {answer?.question?.content}
        </Link>
        <div>{answer?.agreement?.id}</div>
      </Breadcrumbs>
      <h2>{answer?.agreement?.name}</h2>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await updateAnswer({
              content: data.content,
              agreementId: data.agreementId,
              questionId: data.questionId,
              otherAnswer: data.otherAnswer,
              status: "DONE",
            });
            setSnack({ open: true, severity: "success" });
          } catch (e) {
            setSnack({ open: true, severity: "error" });
          }
        }}
      >
        <FormControl
          style={{
            display: "flex",
            height: "calc(100% - 50px)",
            padding: "0 12px",
            width: "100%",
          }}
        >
          <MarkdownEditor
            content={data.content}
            onUpdate={(content) => {
              setData({
                ...data,
                content,
                otherAnswer: content ? undefined : data.otherAnswer,
              });
            }}
          />
          <TitleBox title="Autres réponses">
            <StyledRadioGroup
              aria-labelledby="other-answers"
              name="other_answers"
              value={data?.otherAnswer}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setData({
                  ...data,
                  content: "",
                  otherAnswer: event.target.value,
                });
              }}
            >
              <FormControlLabel
                value="NOTHING"
                control={<Radio />}
                label="La convention collective ne prévoit rien"
              />
              <FormControlLabel
                value="UNKNOWN"
                control={<Radio />}
                label="Nous n'avons pas la réponse"
              />
            </StyledRadioGroup>
          </TitleBox>
          <Stack alignItems="end" padding={2}>
            <Button variant="contained" type="submit">
              Sauvegarder
            </Button>
          </Stack>
        </FormControl>
        <Snackbar
          open={snack.open}
          autoHideDuration={6000}
          onClose={() => setSnack({ open: false })}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Alert
            onClose={() => setSnack({ open: false })}
            severity={snack.severity}
            sx={{ width: "100%" }}
          >
            {snack?.severity}
          </Alert>
        </Snackbar>
      </form>
    </>
  );
};

const StyledRadioGroup = styled(RadioGroup)`
  width: 330px;
`;
