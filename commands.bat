git add .
git commit -m "added tests and mongodb db"
git push origin master
git push heroku master
heroku logs --tail
