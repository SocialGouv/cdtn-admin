// @ts-check

import React from "react";
import { put, select } from "redux-saga/effects";

import * as actions from "../../actions";
import { ANSWER_STATES, USER_ROLE } from "../../constants";
import shortenAgreementName from "../../helpers/shortenAgreementName";
import getCurrentUser from "../../libs/getCurrentUser";
import toast from "../../libs/toast";
import { getAnswersFilters } from "../../selectors";
import { GraphQLApi } from "../../libs/graphQLApi";
import { getAnswersWithFilters } from "../../libs/graphql";

export default function* load({ meta: { pagesIndex } }) {
  try {
    const api = new GraphQLApi();
    const filters = yield select(getAnswersFilters);

    const states =
      filters.states.length > 0
        ? filters.states.map(({ value }) => value)
        : ANSWER_STATES;

    let variables = {
      isGeneric: filters.isGeneric,
      states,
      limit: filters.pageLength,
      offset: pagesIndex > 0 ? pagesIndex * filters.pageLength : 0,
    };

    const { agreements: userAgreementIds, role: userRole } = getCurrentUser();
    if (filters.agreements.length > 0) {
      const selectedAgreementIds = filters.agreements.map(({ value }) => value);
      variables = {
        ...variables,
        agreements:
          userRole === USER_ROLE.ADMINISTRATOR
            ? selectedAgreementIds
            : selectedAgreementIds.filter((id) =>
                userAgreementIds.includes(id)
              ),
      };
    } else if (userRole === USER_ROLE.CONTRIBUTOR) {
      variables = {
        ...variables,
        agreements: userAgreementIds,
      };
    }
    if (userRole === USER_ROLE.ADMINISTRATOR) {
      if (filters.agreements.length > 0) {
        variables = {
          ...variables,
          agreements: filters.agreements.map(({ value }) => value),
        };
      }
    }

    if (filters.questions.length > 0) {
      variables = {
        ...variables,
        questions: filters.questions.map(({ value }) => value),
      };
    }

    if (filters.query.length > 0) {
      variables = {
        ...variables,
        query: `%${filters.query}%`,
      };
    }

    const {
      data: answers,
      pagesLength,
      totalLength,
    } = yield api.queryPagination(getAnswersWithFilters, variables);

    /** @type {FullAnswer.WithReferences[]} */
    const answersWithReferences = answers.map((item) => ({
      ...item,
      agreement_name:
        item.agreement != null
          ? item.agreement.name !== null
            ? shortenAgreementName(item.agreement.name)
            : null
          : null,
      agreement_idcc: item.agreement != null ? item.agreement.idcc : null,
      question_index: item.question.index,
      question_value: item.question.value,
    }));

    yield put(
      actions.answers.loadSuccess({
        length: totalLength,
        list: answersWithReferences,
        pagesIndex,
        pagesLength,
      })
    );
  } catch (err) /* istanbul ignore next */ {
    if (err.response !== undefined && err.response.status === 416) {
      toast.error(
        <span>
          {`Cette page est hors de portée.`}
          <br />
          {`Redirection vers la première page…`}
        </span>
      );

      return yield put(actions.answers.setFilter("page", 0));
    }

    toast.error(err.message);
    yield put(actions.answers.loadFailure({ message: null }));
  }
}
