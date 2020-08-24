#!/usr/bin/env dash

if [ ! -d data ]; then
  echo "no data dir"
  exit 0
fi

for dir in data/*; do  # list directories in the form "/app/data/
  if [ "$dir" = "data/*" ]; then
    echo "data dir is empty"
    exit 0
  fi

  cd ${dir}
  echo "››› cleaning git repo ${dir}"
  git remote prune origin
  git gc --auto
  cd ../..
done
