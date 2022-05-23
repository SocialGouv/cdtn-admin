import { put } from "redux-saga/effects";

import { answers } from "../../actions";
import shortenAgreementName from "../../helpers/shortenAgreementName";
import toast from "../../libs/toast";
import { GraphQLApi } from "../../libs/GraphQLApi";
import { getAnswer } from "../../libs/graphql";

export default function* loadOne({ meta: { id } }) {
  try {
    const api = new GraphQLApi();
    const answer = yield api.fetch(getAnswer, { id });

    if (answer.agreement !== null) {
      answer.agreement = {
        ...answer.agreement,
        name: shortenAgreementName(answer.agreement.name),
      };
    }

    yield put(answers.loadOneSuccess(answer));
  } catch (err) /* istanbul ignore next */ {
    toast.error(err.message);
    yield put(answers.loadOneFailure({ message: null }));
  }
}
