FROM hasura/graphql-engine:v2.0.0-alpha.4

# Used for the migration from v1 (https://hasura.io/docs/latest/guides/upgrade-hasura-v2/#hasura-v2-behaviour-changes)
# Need a full test of the admin before removed
ENV HASURA_GRAPHQL_V1_BOOLEAN_NULL_COLLAPSE=true

ENV HASURA_GRAPHQL_ENABLE_TELEMETRY=false
ENV HASURA_GRAPHQL_SERVER_PORT=8080
ENV HASURA_GRAPHQL_MIGRATIONS_SERVER_TIMEOUT=360

COPY ./migrations /hasura-migrations
COPY ./metadata /hasura-metadata
COPY ./config.yaml /config.yaml

USER 1001
