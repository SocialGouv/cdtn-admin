/** @jsx jsx */
import { jsx, Box } from "theme-ui";

import Head from "next/head";
import { useRouter } from "next/router";
import LoginForm from "src/components/login";
import { setToken } from "src/lib/auth";
import { request } from "src/lib/request";
import { Header } from "src/components/layout/header";

export default function LoginPage() {
  const router = useRouter();

  const resetPassword = () => {
    router.push("/reset_password");
  };

  const goAdmin = () => {
    console.log("[goAdmin]");
    router.push("/");
  };

  const authenticate = ({ email, password }) => {
    return request("/api/login", {
      headers: {
        "Cache-Control": "no-cache",
      },
      body: { username: email, password },
    }).then((tokenData) => {
      setToken(tokenData);
    });
  };

  return (
    <>
      <Head>
        <title>login | Admin cdtn</title>
      </Head>
      <Header />
      <div
        sx={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box p="large" sx={{ flex: 1 }}>
          <LoginForm
            authenticate={authenticate}
            resetPassword={resetPassword}
            onSuccess={goAdmin}
          />
        </Box>
      </div>
    </>
  );
}
