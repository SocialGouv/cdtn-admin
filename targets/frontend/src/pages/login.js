import Head from "next/head";
import { useRouter } from "next/router";
import { Header } from "src/components/layout/header";
import LoginForm from "src/components/login";
import { setToken } from "src/lib/auth/token";
import { request } from "src/lib/request";
import { Box, Flex } from "theme-ui";

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
      setToken(tokenData);
    });
  };

  return (
    <>
      <Head>
        <title>login | Admin cdtn</title>
      </Head>
      <Header />
      <Flex
        sx={{
          alignItems: "center",
          minHeight: "90vh",
        }}
      >
        <Box p="large" sx={{ flex: 1 }}>
          <LoginForm
            authenticate={authenticate}
            resetPassword={resetPassword}
            onSuccess={goAdmin}
          />
        </Box>
      </Flex>
    </>
  );
}
