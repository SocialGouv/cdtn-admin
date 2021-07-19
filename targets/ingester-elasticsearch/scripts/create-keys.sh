#!/bin/sh

set -e

#
# This creates two tokens for a given ES instance
#


ELASTICSEARCH_URL=${ELASTICSEARCH_URL:-""}
ELASTICSEARCH_USER=${ELASTICSEARCH_USER:-"elastic"}
ELASTICSEARCH_PASSWORD=${ELASTICSEARCH_PASSWORD:-"password"}

# token to read data
read_payload()
{
  cat <<EOF
{
  "name": "cdtn_api",
  "role_descriptors": {
    "role-api": {
      "cluster": ["all"],
      "index": [
        {
          "names": ["cdtn-*"],
          "privileges": ["read"]
        }
      ]
    }
  }
}
EOF
}

# token to created index / aliases
ingest_payload()
{
  cat <<EOF
{
  "name": "cdtn_ingest",
  "role_descriptors": {
    "role-ingest": {
      "cluster": ["all"],
      "index": [
        {
          "names": ["cdtn-*"],
          "privileges": ["create", "create_index", "delete_index", "manage"]
        }
      ]
    }
  }
}
EOF
}

# token to update index
update_payload()
{
  cat <<EOF
{
  "name": "cdtn_update",
  "role_descriptors": {
    "role-update": {
      "cluster": ["all"],
      "index": [
        {
          "names": ["cdtn-*"],
          "privileges": ["index"]
        }
      ]
    }
  }
}
EOF
}

create_token() {
    PAYLOAD="$1"
    RES=$(curl --silent -u "$ELASTICSEARCH_USER:$ELASTICSEARCH_PASSWORD" -H "Content-Type: application/json" -X POST --data "$PAYLOAD" "$ELASTICSEARCH_URL/_security/api_key")
    TOKEN=$(echo "$RES" | jq '.id + ":" + .api_key' | xargs echo -n | base64)
    echo "$TOKEN"
}

echo ""
echo "Creating tokens with user $ELASTICSEARCH_USER on $ELASTICSEARCH_URL"
echo ""


echo "Read token -----------------------------------------------------"

READ_TOKEN=$(create_token "$(read_payload)")
echo "cdtn_api: ${READ_TOKEN}" 

echo ""

echo "Ingest token -----------------------------------------------------"

INGEST_TOKEN=$(create_token "$(ingest_payload)")
echo "cdtn_ingest: ${INGEST_TOKEN}" 

echo ""

echo "Update token -----------------------------------------------------"

UPDATE_TOKEN=$(create_token "$(update_payload)")
echo "cdtn_update: ${UPDATE_TOKEN}" 

echo ""

#
# make some tests on generated tokens
#

echo "Testing permissions -----------------------------------------------------"
echo ""

TEST_INDEX=cdtn-test-index

# should fail
RES=$(curl --silent --output /dev/null --write-out "%{http_code}" -H "Authorization: ApiKey $READ_TOKEN" -H "Content-Type: application/json" -X PUT "$ELASTICSEARCH_URL/$TEST_INDEX")
if [ "$RES" -ne 403 ]
then
  echo "❌ error : read token can create index : $RES"
  exit 1
else
  echo "✔️  read token cannot create index"
fi
echo ""

# should fail
RES=$(curl --silent --output /dev/null --write-out "%{http_code}" -H "Authorization: ApiKey $UPDATE_TOKEN" -H "Content-Type: application/json" -X PUT "$ELASTICSEARCH_URL/$TEST_INDEX")
if [ "$RES" -ne 403 ] 
then
  echo "❌ error: update token can create index : $RES"
  exit 1
else
  echo "✔️  update token cannot create index"
fi
echo ""

# should work
RES=$(curl --silent --output /dev/null --write-out "%{http_code}" -H "Authorization: ApiKey $INGEST_TOKEN" -H "Content-Type: application/json" -X PUT "$ELASTICSEARCH_URL/$TEST_INDEX")
if [ "$RES" -ne 200 ]
then
  echo "❌ error: ingest token cannot create index : $RES"
  exit 1
else
  echo "✔️  ingest token can create index"
fi
echo ""

# should work
RES=$(curl --silent --output /dev/null --write-out "%{http_code}" -H "Authorization: ApiKey $INGEST_TOKEN" -H "Content-Type: application/json" -X DELETE "$ELASTICSEARCH_URL/$TEST_INDEX")
if [ "$RES" -ne 200 ]
then
  echo "❌ error: ingest token cannot delete index : $RES"
  exit 1
else
  echo "✔️  ingest token can delete index"
fi

