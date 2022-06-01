import { put } from "redux-saga/effects";

import { comments } from "../../actions";
import toast from "../../libs/toast";
import { GraphQLApi } from "../../libs/GraphQLApi";
import { getAnswerComments } from "../../libs/graphql";

export default function* load({ meta: { answerId } }) {
  try {
    const api = new GraphQLApi();
    const list = yield api.fetch(getAnswerComments, { id: answerId });
    yield put(comments.loadSuccess({ list }));
  } catch (err) /* istanbul ignore next */ {
    toast.error(err.message);
    yield put(comments.loadFailure({ message: null }));
  }
}
