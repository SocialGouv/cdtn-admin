FROM hasura/graphql-engine:v1.3.3.cli-migrations-v2 AS x86
ENV HASURA_GRAPHQL_ENABLE_TELEMETRY false
COPY ./migrations /hasura-migrations
COPY ./metadata /hasura-metadata

FROM fedormelexin/graphql-engine-arm64:v1.3.3.cli-migrations-v2 AS arm
ENV HASURA_GRAPHQL_ENABLE_TELEMETRY false
COPY ./migrations /hasura-migrations
COPY ./metadata /hasura-metadata