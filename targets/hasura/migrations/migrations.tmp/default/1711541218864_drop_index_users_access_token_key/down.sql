CREATE  INDEX "users_access_token_key" on
  "auth"."users" using btree ("access_token");
