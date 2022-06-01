import { put } from "redux-saga/effects";

import { answers } from "../../actions";
import { ANSWER_STATE, USER_ROLE } from "../../constants";
import getCurrentUser from "../../libs/getCurrentUser";
import toast from "../../libs/toast";
import { GraphQLApi } from "../../libs/GraphQLApi";
import { updateAnswersStates } from "../../libs/graphql";

/**
 * Update answers to make them generic or not.
 *
 * @description
 * A generic answer can fallback to either Labor Code or its parent national
 * agreement text.
 */
export default function* updateGenericReference({
  meta: { genericReference, ids, next },
}) {
  try {
    const { id: userId, role: userRole } = getCurrentUser();

    const data =
      userRole === USER_ROLE.ADMINISTRATOR
        ? {
            generic_reference: genericReference,
            state: ANSWER_STATE.UNDER_REVIEW,
          }
        : {
            generic_reference: genericReference,
            state: ANSWER_STATE.DRAFT,
            user_id: userId,
          };

    const api = new GraphQLApi();
    yield api.update(updateAnswersStates, { data, ids });

    toast.success(
      ids.length === 1
        ? `La réponse ${ids[0]} a été renvoyée.`
        : `Les réponses ${ids.join(", ")} ont été renvoyées.`
    );

    next();
  } catch (err) /* istanbul ignore next */ {
    toast.error(err.message);
    yield put(answers.updateGenericReferenceFailure({ message: null }));
  }
}
