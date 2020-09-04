import * as Sentry from "@sentry/node";
import PropTypes from "prop-types";
import React from "react";
import Page404 from "src/pages/404";

function MyError({ statusCode }) {
  if (statusCode === 404) {
    return <Page404 />;
  }
  return (
    <h1 style={{ textAlign: "center", width: "100%" }}>
      Oups, une erreur s’est produite !
    </h1>
  );
}

MyError.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  if (statusCode >= 400 && statusCode !== "404") {
    Sentry.captureException(err);
  }
  return { statusCode };
};

MyError.propTypes = {
  statusCode: PropTypes.number.isRequired,
};

export default MyError;
