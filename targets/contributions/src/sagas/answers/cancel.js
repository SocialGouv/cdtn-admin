import {put} from "redux-saga/effects";

import {answers} from "../../actions";
import {ANSWER_STATE} from "../../constants";
import toast from "../../libs/toast";
import {GraphQLApi} from "../../libs/GraphQLApi";
import {deleteAnswersReferences, updateAnswersStates,} from "../../libs/graphql";

/**
 * Cancel an answer draft by resettinng all its related data.
 *
 * TODO Replace this saga by `updateState()` one.
 */
export default function* cancel({ meta: { ids, next } }) {
  try {
    const api = new GraphQLApi();
    const data = {
      generic_reference: null,
      prevalue: "",
      state: ANSWER_STATE.TO_DO,
      user_id: null,
      value: "",
    };
    yield api.delete(deleteAnswersReferences, { ids });

    yield api.update(updateAnswersStates, { data, ids });

    toast.success(
      ids.length === 1
        ? `La réponse ${ids[0]} a été annulée.`
        : `Les réponses ${ids.join(", ")} ont été annulées.`
    );

    next();
  } catch (err) /* istanbul ignore next */ {
    toast.error(err.message);
    yield put(answers.cancelFailure({ message: null }));
  }
}
