export const passwordValidation =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{12,32}$/;

export enum Role {
  SUPER = "super",
  USER = "user",
}
