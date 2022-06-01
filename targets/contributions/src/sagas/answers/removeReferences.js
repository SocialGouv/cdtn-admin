import { put } from "redux-saga/effects";

import { answers } from "../../actions";
import toast from "../../libs/toast";
import { GraphQLApi } from "../../libs/GraphQLApi";
import { deleteAnswerReference } from "../../libs/graphql";

export default function* removeReferences({ meta: { ids }, next }) {
  try {
    const api = new GraphQLApi();
    yield api.delete(deleteAnswerReference, { ids });

    next();
  } catch (err) /* istanbul ignore next */ {
    toast.error(err.message);
    yield put(answers.removeReferencesFailure({ message: null }));
  }
}
