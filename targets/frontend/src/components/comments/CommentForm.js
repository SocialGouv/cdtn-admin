import VisuallyHidden from "@reach/visually-hidden";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { TextField } from "@mui/material";

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
      <div sx={{ alignItems: "center", display: "flex" }}>
        <TextField
          sx={{
            width: "100%",
          }}
          autoComplete="off"
          type="text"
          {...register("comment", { required: true })}
          placeholder="Laisser un commentaire..."
        />
        <VisuallyHidden>
          <Button type="submit">Envoyer le commentaire</Button>
        </VisuallyHidden>
      </div>
    </form>
  );
}

CommentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};
