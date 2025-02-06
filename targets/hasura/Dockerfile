FROM hasura/graphql-engine:v2.45.1.cli-migrations-v3

# Used for the migration from v1 (https://hasura.io/docs/latest/guides/upgrade-hasura-v2/#hasura-v2-behaviour-changes)
# Need a full test of the admin before removed
ENV HASURA_GRAPHQL_V1_BOOLEAN_NULL_COLLAPSE=true
# Docs: https://hasura.io/docs/2.0/deployment/graphql-engine-flags/reference/
ENV HASURA_GRAPHQL_ENABLE_TELEMETRY=false
ENV HASURA_GRAPHQL_SERVER_PORT=8080
ENV HASURA_GRAPHQL_LIVE_QUERIES_MULTIPLEXED_BATCH_SIZE=1000
ENV HASURA_GRAPHQL_LIVE_QUERIES_MULTIPLEXED_REFETCH_INTERVAL=2000
ENV HASURA_GRAPHQL_LOG_LEVEL=debug

COPY ./migrations /hasura-migrations
COPY ./metadata /hasura-metadata

USER 1001
