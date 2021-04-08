import VisuallyHidden from "@reach/visually-hidden";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { Input, Label } from "theme-ui";

import { Button } from "../button";

export function CommentForm({ onSubmit }) {
  const { register, handleSubmit, reset } = useForm();

  async function submitHandler(data) {
    try {
      await onSubmit(data.comment);
      reset();
    } catch {
      console.log("send errror");
    }
  }

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <Label sx={{ alignItems: "center", display: "flex" }}>
        <Input
          sx={{
            border: "1px solid",
            borderColor: "neutral",
            borderRadius: "small",
            padding: "xsmall",
            paddingRight: "xlarge",
            width: "100%",
          }}
          autoComplete="off"
          type="text"
          {...register("comment", { required: true })}
          placeholder="laisser un commentaire..."
        />
        <VisuallyHidden>
          <Button type="submit">Envoyer le commentaire</Button>
        </VisuallyHidden>
      </Label>
    </form>
  );
}

CommentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};
