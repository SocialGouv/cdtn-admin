FROM hasura/graphql-engine:v2.10.2


ENV HASURA_GRAPHQL_ENABLE_TELEMETRY=false
ENV HASURA_GRAPHQL_SERVER_PORT=8080
ENV HASURA_GRAPHQL_MIGRATIONS_SERVER_TIMEOUT=360

COPY ./migrations /migrations
COPY ./metadata /metadata
COPY ./config.yaml /config.yaml

USER 1001
