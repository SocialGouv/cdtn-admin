import { put } from "redux-saga/effects";

import { answers } from "../../actions";
import toast from "../../libs/toast";
import { GraphQLApi } from "../../libs/GraphQLApi";
import { updateAnswerReference } from "../../libs/graphql";

export default function* updateReferences({ meta: { data }, next }) {
  try {
    const api = new GraphQLApi();
    for (let ref of data) {
      const { id, ...data } = ref;
      yield api.create(updateAnswerReference, { id, data });
    }
    if (next !== undefined) {
      next();
    }
  } catch (err) /* istanbul ignore next */ {
    toast.error(err.message);
    yield put(answers.updateReferencesFailure({ message: null }));
  }
}
