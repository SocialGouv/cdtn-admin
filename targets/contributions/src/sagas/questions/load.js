import React from "react";
import { put } from "redux-saga/effects";

import { questions } from "../../actions";
import toast from "../../libs/toast";
import { GraphQLApi } from "../../libs/graphQLApi";

export default function* load({ meta: { pageIndex, query } }) {
  try {
    const api = new GraphQLApi();
    const list = yield api.fetchAll("/questions");
    yield put(
      questions.loadSuccess({
        list,
        pageIndex,
        pagesLength: 1,
      })
    );
  } catch (err) /* istanbul ignore next */ {
    if (err.response !== undefined && err.response.status === 416) {
      const pageIndex = Math.floor(
        Number(err.response.headers["content-range"].substr(2)) / 10
      );

      toast.error(
        <span>
          {`Cette page est hors de portée.`}
          <br />
          {`Redirection vers la page n° ${pageIndex + 1}…`}
        </span>
      );

      return yield load({ meta: { pageIndex, query } });
    }

    toast.error(err.message);
    yield put(questions.loadFailure({ message: null }));
  }
}
