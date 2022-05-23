import React from "react";
import { put } from "redux-saga/effects";

import { agreements } from "../../actions";
import shortenAgreementName from "../../helpers/shortenAgreementName";
import toast from "../../libs/toast";
import { GraphQLApi } from "../../libs/graphQLApi";
import { getAgreements } from "../../libs/graphql";

export default function* load({ meta: { pageIndex, query } }) {
  try {
    const api = new GraphQLApi();
    let request = undefined;
    if (query.length > 0) {
      request = {
        name: query,
      };
    }
    const data = yield api.query(getAgreements, request);

    const list = data.map(({ name, ...props }) => ({
      name: shortenAgreementName(name),
      ...props,
    }));

    yield put(
      agreements.loadSuccess({
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
    yield put(agreements.loadFailure({ message: null }));
  }
}
