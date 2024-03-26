import Head from "next/head";
import { useRouter } from "next/router";
import { Header } from "src/components/layout/header";
import LoginForm from "src/components/login";
import { Box } from "@mui/material";
import { signIn } from "next-auth/react";
import { UseFormSetError } from "react-hook-form";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { GetServerSidePropsContext } from "next";

export default function LoginPage() {
  const router = useRouter();

  const resetPassword = () => {
    router.push("/reset_password");
  };

  const onLogin = async (
    email: string,
    password: string,
    setError: UseFormSetError<any>
  ) => {
    const response = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (!response || response.error) {
      setError(
        "password",
        {
          message: response?.error ?? "Erreur non identifiée",
          type: "manual",
        },
        { shouldFocus: true }
      );
      return;
    }
    router.push("/");
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
          <LoginForm resetPassword={resetPassword} onLogin={onLogin} />
        </Box>
      </Box>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // const session = await getServerSession(context.req, context.res, authOptions);

  // if (session) {
  //   return { redirect: { destination: "/" } };
  // }

  return { props: {} };
}
