import {
  Button,
  Checkbox,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import React, { useEffect, useState } from "react";
import { Answer } from "../type";
import { StatusContainer } from "../status";
import { useRouter } from "next/router";
import { fr } from "@codegouvfr/react-dsfr";
import { getLastPublicationDate } from "../publication";
import { StatusPublicationContainer } from "../status/StatusPublication";

type EditQuestionAnswerListProps = {
  answers: Answer[];
  onPublish: (id: string) => Promise<void>;
};

type AnswerCheck = {
  [id: string]: boolean;
};

const contentTypes = {
  ANSWER: {
    description: "Afficher la réponse",
    icon: <DescriptionIcon fontSize="small" />,
  },
  NOTHING: {
    description: "La convention collective ne prévoit rien",
    icon: <CloseIcon fontSize="small" />,
  },
  CDT: {
    description: "La convention collective renvoie au Code du Travail",
    icon: <small>CDT</small>,
  },
  UNFAVOURABLE: {
    description:
      "La convention collective est intégralement moins favorable que le CDT",
    icon: <small>CDT</small>,
  },
  UNKNOWN: {
    description: "Nous n'avons pas la réponse",
    icon: <DoNotDisturbIcon fontSize="small" />,
  },
  SP: {
    description: "Fiche service public",
    icon: <small>SP</small>,
  },
  GENERIC_NO_CDT: {
    description: "Le code du travail ne prévoit rien",
    icon: <CloseIcon fontSize="small" />,
  },
};

export const QuestionAnswerList = ({
  answers,
  onPublish,
}: EditQuestionAnswerListProps): JSX.Element => {
  const router = useRouter();
  const [answersCheck, setAnswersCheck] = useState<AnswerCheck>(
    answers.reduce(
      (obj, { id, status }) => ({
        ...obj,
        ...(status.status === "VALIDATED" ? { [id]: false } : {}),
      }),
      {}
    )
  );
  const [displayPublish, setDisplayPublish] = useState(false);

  const publishAll = async () => {
    const ids = Object.entries(answersCheck).reduce<string[]>(
      (arr, [id, checked]) => {
        if (checked) {
          arr.push(id);
        }
        return arr;
      },
      []
    );
    const promises = ids.map((id) => onPublish(id));
    await Promise.all(promises);
  };
  const redirectToAnswer = (id: string) => {
    router.push(`/contributions/answers/${id}`);
  };
  useEffect(() => {
    const atLeastOneChecked = Object.values(answersCheck).some(
      (checked) => checked
    );
    setDisplayPublish(atLeastOneChecked);
  }, [answersCheck]);
  return (
    <Stack alignItems="stretch">
      <Stack>
        <Stack direction="row" alignItems="start" spacing={2}>
          <Button
            variant="contained"
            type="button"
            color="success"
            disabled={!displayPublish}
            onClick={publishAll}
          >
            Publier
          </Button>
        </Stack>
        <TableContainer component={Paper}>
          <Table size="small" aria-label="purchases">
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  <Checkbox
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setAnswersCheck(
                        Object.keys(answersCheck).reduce<AnswerCheck>(
                          (obj, key) => ({
                            ...obj,
                            [key]: event.target.checked,
                          }),
                          {}
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell align="center">IDCC</TableCell>
                <TableCell>Convention Collective</TableCell>
                <TableCell align="center">Type</TableCell>
                <TableCell align="center">Statut</TableCell>
                <TableCell align="center">Publication</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {answers?.map((answer) => {
                return (
                  <TableRow
                    key={answer.agreement.id}
                    style={{ cursor: "pointer" }}
                    hover
                  >
                    <TableCell scope="row">
                      <Checkbox
                        checked={answersCheck[answer.id]}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) =>
                          setAnswersCheck({
                            ...answersCheck,
                            [answer.id]: event.target.checked,
                          })
                        }
                        disabled={answer.status.status !== "VALIDATED"}
                      />
                    </TableCell>
                    <TableCell
                      scope="row"
                      onClick={() => redirectToAnswer(answer.id)}
                    >
                      {answer?.agreement?.id}
                    </TableCell>
                    <TableCell
                      scope="row"
                      onClick={() => redirectToAnswer(answer.id)}
                    >
                      {answer?.agreement?.name}
                    </TableCell>
                    <TableCell
                      scope="row"
                      align="center"
                      onClick={() => redirectToAnswer(answer.id)}
                    >
                      {answer.contentType && (
                        <Tooltip
                          style={{
                            color:
                              fr.colors.decisions.text.default.grey.default,
                          }}
                          title={contentTypes[answer.contentType].description}
                        >
                          {contentTypes[answer.contentType].icon}
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell
                      scope="row"
                      align="center"
                      onClick={() => redirectToAnswer(answer.id)}
                    >
                      {answer.status && (
                        <StatusContainer
                          status={answer.status.status}
                          exportDate={answer.publication?.export.createdAt}
                          statusDate={answer.status.createdAt}
                          center
                        />
                      )}
                    </TableCell>
                    <TableCell
                      scope="row"
                      align="center"
                      onClick={() => redirectToAnswer(answer.id)}
                    >
                      <StatusPublicationContainer
                        status={answer.status.status}
                        exportDate={answer.publication?.export.createdAt}
                        center
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Stack>
  );
};
