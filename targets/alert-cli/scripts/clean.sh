#!/usr/bin/env sh

currentdir=`dirname "$0"`
datadir="${currentdir}/../data/*/"

for dir in $datadir
do
  # list directories in the form "/tmp/dirname/"
  echo $dir

    # dir=`realpath "$0"`/../data/${dir%*/}      # remove the trailing "/"
    # echo "››› cleaning git ${dir##*/}"
    # cd ${dir##*/}    # print everything after the final "/"
    # git remote prune origin
    # git gc --auto
    # cd ..
done
