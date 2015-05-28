module.exports = (function() {
    var request = require('request'),
        _ = require('underscore'),
        async = require('async'),
        csv = require('csv-string'),
        fs = require('fs');

    var sector_id = {
        'basic_materials': 1,
        'conglomerates': 2,
        'consumer_goods': 3,
        'financial': 4,
        'healthcare': 5,
        'industrial_goods': 6,
        'services': 7,
        'technology': 8,
        'utilities': 9
    };

    return {
        companies: companies
    }

    function companies(inputs, done) {
        var sectorName, industries;
        async.waterfall([
            function(done) {

                sectorName = inputs.sector;
                var sectorID = sector_id[inputs.sector];
                //get industries in sector
                request('http://biz.yahoo.com/p/csv/' + sectorID + 'conameu.csv', function(err, res, body) {
                    if (err) return done(err);
                    var temp = csv.parse(body);

                    // first item is header, last item is \u0078
                    done(null, industries = _.chain(temp)
                        .initial()
                        .rest()
                        .pluck(0)
                        .value());
                });
            },
            function(industries, done) {
                fs.readFile(__dirname + '/industries-id.txt', function(err, data) {
                    if (err) return done(err);
                    var industryList = csv.parse(data.toString(), '=');

                    // get ids of industries in sector
                    done(null, _.chain(industryList)
                        .filter(function(item) { return _.contains(industries, item[0]); })
                        .pluck(1)
                        .value());
                });
            },
            function(industryIDs, done) {
                // get companies in industries
                async.map(industryIDs, function(id, next) {
                    request('http://biz.yahoo.com/p/csv/' + id + 'conameu.csv', function(err, res, body) {
                        if (err) return next(err);
                        // first item is header
                        next(null, _.rest(csv.parse(body)));
                    });
                }, function(err, results) {
                    if (err) return done(err);
                    done(null, _.chain(results)
                        .flatten(true)
                        .compact()
                        //industries (and their market caps) are contained in company list. this removes it
                        .filter(function(item) { return !(_.contains(industries, item[0])); })
                        .filter(function(item) { return (item[2] != 'NA' && typeof item[2] != 'undefined'); })
                        .filter(function(item) { return (item[0].toLowerCase() != sectorName) })
                        .sortBy(function(item) {
                            num = item[2];
                            // translating minimized strings to numbers (102.42B ==> 102,420,...)
                            var number = parseFloat(num.substring(0, num.length - 1));
                            var multiplier = num[num.length - 1];
                            if (multiplier == 'B') {
                                return number * 1000000000;
                            } else if (multiplier == 'M') {
                                return number * 1000000;
                            } else {
                                return number;
                            }
                        })
                        .reverse()
                        .first(100)
                        .pluck(0)
                        .value());
                });
            }

        ], done);
    }
}());
