import { put } from "redux-saga/effects";

import { comments } from "../../actions";
import toast from "../../libs/toast";
import { GraphQLApi } from "../../libs/GraphQLApi";
import { deleteAnswerComments } from "../../libs/graphql";

export default function* _delete({ meta: { answerId, ids } }) {
  try {
    const api = new GraphQLApi();
    yield api.delete(deleteAnswerComments, { ids });
    yield put(comments.load(answerId));
  } catch (err) /* istanbul ignore next */ {
    toast.error(err.message);
    yield put(comments.deleteFailure({ message: null }));
  }
}
