import Link from "next/link";
import { NextRouter } from "next/router";
import { IoMdCheckmark } from "react-icons/io";
import { Box } from "@mui/material";

import { Button } from "../button";

const ValidationBar = ({
  isDirty,
  loading,
  router,
}: {
  isDirty: boolean;
  loading: boolean;
  router: NextRouter;
}) => {
  return (
    <Box sx={{ alignItems: "center", mt: "medium", display: "flex" }}>
      {/* @ts-ignore */}
      <Button variant="secondary" disabled={loading || !isDirty}>
        {isDirty && (
          <IoMdCheckmark
            sx={{
              height: "iconSmall",
              mr: "xsmall",
              width: "iconSmall",
            }}
          />
        )}
        Enregistrer
      </Button>
      <Link
        href={"/contenus"}
        passHref
        onClick={(e) => {
          e.preventDefault();
          router.back();
        }}
        style={{ textDecoration: "none" }}
      >
        Annuler
      </Link>
    </Box>
  );
};

export { ValidationBar };
