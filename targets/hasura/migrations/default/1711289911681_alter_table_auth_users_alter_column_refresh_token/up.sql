ALTER TABLE "auth"."users" ALTER COLUMN "refresh_token" TYPE text;
ALTER TABLE "auth"."users" ALTER COLUMN "refresh_token" drop default;
