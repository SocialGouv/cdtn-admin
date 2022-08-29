FROM hasura/graphql-engine:v2.0.0-alpha.4
ENV HASURA_GRAPHQL_ENABLE_TELEMETRY false
COPY ./migrations /hasura-migrations
COPY ./metadata /hasura-metadata
COPY ./config.yaml /config.yaml
