module.exports = (function() {
    var twit = require('twit'),
        _ = require('underscore'),
        async = require('async');

    var t = new twit({
        consumer_key: 'rslVCDVVVOllSuc5c4elc268o',
        consumer_secret: 'LoVkPGqylAnsQb2bDXxjLnqlxeOQUO5zr8iXvEwh0UpDlW30Fn',
        access_token: '24444344-vFVOU28kC3S6fjai8qjWZRx1oqu9cfx8XSFGeTkMa',
        access_token_secret: 'hEioRrH0WlOIvKtSb9LoYTPiesJWlutKvHOwbljhBJ34o'
    });

    return {
        tweets: tweets
    }

    function tweets(inputs, done) {
        // splitting companies into groups by name length
        // to make smaller queries to twitter
        var groups = _.values(_.groupBy(inputs, 'length'));
        var date = new Date()
        // console.log(groups);
        async.map(groups, function(item, next) {
            //lets go, twitter!
            t.get('search/tweets', {
                q: _.chain(item)
                    //get unique items and remove 'ltd', 'corporation' etc from end
                    .map(function(x) {
                        var temp = x.split(' ');
                        if (temp.length < 2) {
                            return x;
                        }
                        return '\'' + _.initial(temp).join(' ') + '\'';
                    })
                    .uniq()
                    .value()
                    .join(' OR ')
                    + 'since:' + date.getFullYear()
                    + '-' + (date.getMonth() + 1)
                    + '-' + date.getDate(), // for query
                count: 100,
                result_type: 'popular'
            }, next);
        }, function(err, out) {
            if (err) return done(err);
            done(null, _.chain(out)
                        .pluck('statuses')
                        .flatten(true)
                        .compact()
                        .map(function(item) {
                            return {
                                user: item.user.screen_name,
                                tweet: item.text,
                                retweets: item.retweet_count,
                                favorites: item.favorite_count
                            };
                        })
                        .uniq()
                        .sortBy(function(item) {
                            return -(item.retweets + item.favorites);
                        })
                        //sort by most popular and take top 50
                        .first(50)
                        .value());
        });
    }
}());
