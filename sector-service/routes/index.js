var express = require('express');
var router = express.Router();
var yahoo = require('./yahoo');
var twitter = require('./twitter');

/* all home page. */
router.all('/', function(req, res, next) {
    console.log(req.query);
    // get company names from yahoo
    yahoo.companies(req.query, function(err, companies) {
        if (err) return console.error(err);
        // get tweets from tweetland
        twitter.tweets(companies, function(err, tweets) {
            if (err) return console.error(err);
            console.log(tweets);
            res.send(tweets);
        });
    });
});

module.exports = router;
