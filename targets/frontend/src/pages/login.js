import Head from "next/head";
import { useRouter } from "next/router";
import { Header } from "src/components/layout/header";
import LoginForm from "src/components/login";
import { request } from "src/lib/request";
import { Box } from "@mui/material";
import { saveTokenSessionStorage } from "src/lib/auth/store";

export default function LoginPage() {
  const router = useRouter();

  const resetPassword = () => {
    router.push("/reset_password");
  };

  const goAdmin = () => {
    router.push("/");
  };

  const authenticate = ({ email, password }) => {
    return request("/api/login", {
      body: { password, username: email },
      headers: {
        "Cache-Control": "no-cache",
      },
    }).then((tokenData) => {
      saveTokenSessionStorage(tokenData);
    });
  };

  return (
    <>
      <Head>
        <title>login | Admin cdtn</title>
      </Head>
      <Header />
      <Box
        style={{
          alignItems: "center",
          display: "flex",
          minHeight: "90vh",
        }}
      >
        <Box style={{ flex: 1, padding: "20px" }}>
          <LoginForm
            authenticate={authenticate}
            resetPassword={resetPassword}
            onSuccess={goAdmin}
          />
        </Box>
      </Box>
    </>
  );
}
