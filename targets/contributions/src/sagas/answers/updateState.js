import { put } from "redux-saga/effects";

import { answers } from "../../actions";
import { ANSWER_STATE, ANSWER_STATE_LABEL } from "../../constants";
import toast from "../../libs/toast";
import { pluralize } from "../../texts";
import { GraphQLApi } from "../../libs/GraphQLApi";
import {deleteAnswersReferences, updateAnswersStates} from "../../libs/graphql";

export default function* updateState({ meta: { ids, next, state } }) {
  try {
    const api = new GraphQLApi();
    let data;

    switch (state) {
      case ANSWER_STATE.TO_DO:
        data = {
          generic_reference: null,
          prevalue: "",
          state,
          user_id: null,
          value: "",
        };
        yield api.delete(deleteAnswersReferences, { ids });
        break;

      case ANSWER_STATE.DRAFT:
      case ANSWER_STATE.PENDING_REVIEW:
      case ANSWER_STATE.UNDER_REVIEW:
        data = {
          state,
        };
        break;

      case ANSWER_STATE.PUBLISHED:
      case ANSWER_STATE.VALIDATED:
        data = { state };
        break;

      default:
        throw new Error(`Ce changement d'état est impossible.`);
    }

    yield api.update(updateAnswersStates, { data, ids});

    toast.success(
      ids.length === 1
        ? `La réponse ${ids[0]} est maintenant ${ANSWER_STATE_LABEL[state]}.`
        : `Les réponses ${ids.join(", ")} sont maintenant ${pluralize(
            ANSWER_STATE_LABEL[state]
          )}.`
    );

    next();
  } catch (err) /* istanbul ignore next */ {
    toast.error(err.message);
    yield put(answers.updateStateFailure({ message: null }));
  }
}
