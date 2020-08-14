#!/usr/bin/env sh


for dir in `dirname "$0"`/../data/*/     # list directories in the form "/tmp/dirname/"
do
    dir=${dir%*/}      # remove the trailing "/"
    echo "››› cleaning git ${dir##*/}"
    cd ${dir##*/}    # print everything after the final "/"
    git remote prune origin
    git gc --auto
    cd ..
done
