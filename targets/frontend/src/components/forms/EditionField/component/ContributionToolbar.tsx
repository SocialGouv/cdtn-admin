import React, { useState } from "react";
import { Button, Menu, MenuItem, Stack } from "@mui/material";
import { CONTRIBUTION_COLORS } from "../../../utils/contributionColors";
import { Editor } from "@tiptap/react";
import { CONTRIBUTION_VARIABLES } from "@shared/utils";

type ContributionToolbarProps = {
  editor: Editor | null;
  variablesEnabled: boolean;
  disabled?: boolean;
};

/**
 * Barre d'outils propre aux contenus de contribution :
 * - « Insérer une variable » : valeur résolue à l'export (nom de la CC, …)
 *
 * Le surlignage est proposé dans le menu de sélection (MenuStyle).
 */
export const ContributionToolbar = ({
  editor,
  variablesEnabled,
  disabled = false,
}: ContributionToolbarProps) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  if (!editor || !variablesEnabled) {
    return null;
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      role="toolbar"
      aria-label="Outils de la contribution"
      sx={{
        padding: "4px 12px",
        borderBottom: `1px solid ${CONTRIBUTION_COLORS.border}`,
      }}
    >
      <>
        <Button
          size="small"
          variant="outlined"
          disabled={disabled}
          aria-haspopup="true"
          aria-expanded={anchor !== null}
          onClick={(event) => setAnchor(event.currentTarget)}
        >
          Insérer une variable ▾
        </Button>
        <Menu
          anchorEl={anchor}
          open={anchor !== null}
          onClose={() => setAnchor(null)}
        >
          {CONTRIBUTION_VARIABLES.map((variable) => (
            <MenuItem
              key={variable.key}
              onClick={() => {
                editor.chain().focus().insertVariable(variable.key).run();
                setAnchor(null);
              }}
            >
              {variable.label}
            </MenuItem>
          ))}
        </Menu>
      </>
    </Stack>
  );
};
