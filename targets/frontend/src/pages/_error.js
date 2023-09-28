import NextErrorPage from "next/error";
import PropTypes from "prop-types";
import Page404 from "src/pages/404";

const MyError = ({ statusCode, hasGetInitialPropsRun, err }) => {
  if (statusCode === 404) {
    return <Page404 />;
  }
  return (
    <NextErrorPage
      statusCode={statusCode}
      title="Oups, une erreur s'est produite !"
    />
  );
};

MyError.getInitialProps = async ({ res, err, asPath }) => {
  const errorInitialProps = await NextErrorPage.getInitialProps({
    err,
    res,
  });

  // Workaround for https://github.com/vercel/next.js/issues/8592, mark when
  // getInitialProps has run
  errorInitialProps.hasGetInitialPropsRun = true;
  if (!errorInitialProps.statusCode) {
    errorInitialProps.statusCode = 500;
  }
  // Running on the server, the response object (`res`) is available.
  //
  // Next.js will pass an err on the server if a page's data fetching methods
  // threw or returned a Promise that rejected
  //
  // Running on the client (browser), Next.js will provide an err if:
  //
  //  - a page's `getInitialProps` threw or returned a Promise that rejected
  //  - an exception was thrown somewhere in the React lifecycle (render,
  //    componentDidMount, etc) that was caught by Next.js's React Error
  //    Boundary. Read more about what types of exceptions are caught by Error
  //    Boundaries: https://reactjs.org/docs/error-boundaries.html

  if (res?.statusCode === 404 || err?.statusCode === 404) {
    return { statusCode: 404 };
  }

  return errorInitialProps;
};

MyError.propTypes = {
  err: PropTypes.object,
  hasGetInitialPropsRun: PropTypes.bool,
  statusCode: PropTypes.number,
};

export default MyError;
