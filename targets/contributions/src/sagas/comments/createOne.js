import { put } from "redux-saga/effects";

import { actionTypes, comments } from "../../actions";
import getCurrentUser from "../../libs/getCurrentUser";
import toast from "../../libs/toast";
import { GraphQLApi } from "../../libs/GraphQLApi";
import { createAnswerComment } from "../../libs/graphql";

export default function* createOne({ meta: { answerId, isPrivate, value } }) {
  try {
    const me = getCurrentUser();

    const api = new GraphQLApi();
    const data = {
      answer_id: answerId,
      is_private: isPrivate,
      user_id: me.id,
      value,
    };

    yield api.create(createAnswerComment, { data });
    yield put({ type: actionTypes.COMMENT_CREATE_ONE_SUCCESS });
    yield put(comments.load(answerId));
  } catch (err) /* istanbul ignore next */ {
    toast.error(err.message);
    yield put(comments.addOneFailure({ message: null }));
  }
}
