FROM docker.elastic.co/elasticsearch/elasticsearch:8.6.2

WORKDIR /usr/share/elasticsearch

RUN set -x \
  #
  && bin/elasticsearch-plugin install --silent analysis-icu \
  && bin/elasticsearch-keystore create \
  #
  ;

COPY ./elasticsearch.yml config/elasticsearch.yml
