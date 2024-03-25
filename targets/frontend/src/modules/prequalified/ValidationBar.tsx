import Link from "next/link";
import { NextRouter } from "next/router";
import { IoMdCheckmark } from "react-icons/io";
import { Box } from "@mui/material";

import { Button } from "../../components/button";
import { theme } from "src/theme";

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
    <Box
      sx={{
        alignItems: "center",
        marginTop: theme.space.medium,
        display: "flex",
      }}
    >
      <Button variant="contained" disabled={loading || !isDirty} type="submit">
        {isDirty && (
          <IoMdCheckmark
            style={{
              height: theme.sizes.iconSmall,
              marginRight: theme.space.xsmall,
              width: theme.sizes.iconSmall,
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
        style={{ textDecoration: "none", marginLeft: theme.space.small }}
      >
        Annuler
      </Link>
    </Box>
  );
};

export { ValidationBar };
