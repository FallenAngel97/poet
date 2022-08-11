import express from 'express';
const app = express();
import Poet from '@decodeapps/neopoet';
import type { Post } from "@decodeapps/neopoet/poet/defaults";

var poet = Poet(app, {
  postsPerPage: 3,
  posts: './_posts',
  sortingFunction: (firstPost: Post, secondPost: Post) => {
      if (firstPost.date > secondPost.date) return 1;
      if (firstPost.date < secondPost.date) return -1;
      return 0;
  },
  metaFormat: 'json',
  routes: {
    '/myposts/:post': 'post',
    '/pagination/:page': 'page',
    '/mytags/:tag': 'tag',
    '/mycategories/:category': 'category'
  }
});

poet.init().then(function () {
  // initialized
});

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) { res.render('index');});

app.listen(3000);
