import Link from "next/link";
import { NextRouter } from "next/router";
import { IoMdCheckmark } from "react-icons/io";
import { Flex, NavLink } from "theme-ui";

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
    <Flex sx={{ alignItems: "center", mt: "medium" }}>
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
      <Link href={"/contenus"} passHref>
        <NavLink
          onClick={(e) => {
            e.preventDefault();
            router.back();
          }}
          sx={{ ml: "medium" }}
        >
          Annuler
        </NavLink>
      </Link>
    </Flex>
  );
};

export { ValidationBar };
