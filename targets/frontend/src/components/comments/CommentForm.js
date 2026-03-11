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
      <div sx={{ alignItems: "center", display: "flex", marginTop: "10px" }}>
        <TextField
          sx={{
            width: "100%",
          }}
          autoComplete="off"
          type="text"
          {...register("comment", { required: true })}
          placeholder="Laisser un commentaire..."
        />
        <span
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            borderWidth: 0,
          }}
        >
          <Button type="submit">Envoyer le commentaire</Button>
        </span>
      </div>
    </form>
  );
}

CommentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};
