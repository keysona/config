cd ~
git add .
git checkout 

time=`date`

git add .
git commit -m "$time"
proxychains git push
