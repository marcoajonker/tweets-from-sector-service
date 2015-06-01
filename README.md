# tweets-from-sector-service
Service to return popular tweets from companies in a sector.

index.js
--------
sets up route to query for strings at '.com/{sector}'

yahoo.js
--------
makes a series of calls to yahoo's business api.<br>
https://code.google.com/p/yahoo-finance-managed/wiki/CSVAPI<br>
  retrieves industries in queried sector (sectors passed in by string: https://code.google.com/p/yahoo-finance-managed/wiki/enumSectors ) <br>
  --> retrieves companies in retrieved industries<br>
      --> orders companies by market cap<br>
returns top 100 companies in a sector
      
twitter.js
----------
queries twitter for tweets containing company names and orders them by popularity<br>
  popularity == retweets + favorites<br>
returns top 50 tweets about company<br>
  obj -> {<br>
    username, tweet, retweets, favorites<br>
    }
