import { put } from "redux-saga/effects";

import { answers } from "../../actions";
import toast from "../../libs/toast";
import { GraphQLApi } from "../../libs/GraphQLApi";
import { createAnswerReferences } from "../../libs/graphql";

export default function* addReferences({ meta: { data }, next }) {
  try {
    const api = new GraphQLApi();
    console.log("Create ref XYZ : ", data);
    yield api.create(createAnswerReferences, { data });

    next();
  } catch (err) /* istanbul ignore next */ {
    toast.error(err.message);
    yield put(answers.addReferencesFailure({ message: null }));
  }
}
