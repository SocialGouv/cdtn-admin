import { IoMdCheckmark } from "react-icons/io";

import { Button } from "../button";

export const SectionButton = ({
  disabled,
  isDirty,
  label,
}: {
  disabled: boolean;
  isDirty: boolean;
  label: string;
}) => (
  <Button
    variant="secondary"
    //@ts-ignore
    disabled={disabled}
  >
    {isDirty && (
      <IoMdCheckmark
        sx={{
          height: "iconSmall",
          mr: "xsmall",
          width: "iconSmall",
        }}
      />
    )}
    {label}
  </Button>
);
