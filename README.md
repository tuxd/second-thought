# Some Light Abstraction for RethinkDB

The RethinkDB Node driver is already very simple to use, but there are methods that I wish I "just had" at the ready. Those are:

 - Query, which returns an array
 - First, Exists
 - Save, which upserts a record
 - Automatic table/db config
 - DB Manipulation (Create/Drop)

So I created it. That's what we have here.

## Usage

Install using

```
npm install second-thought --save
```

To use this in your code, just configure what you need:

```javascript
var db = require("second-thought").init({db : "test", tables : ['foo', 'bar']});
```

The `init` method sets the database name as well as drops the tables on the DB prototype as fields. This is interesting for a number of reasons!

Each table that you send into init is a full-blown RethinkDB table, so you can step outisde the abstraction at any point:

```javascript
db.connect(function(err,conn){

  //this is a ReQL query
  db.foo.eqJoin('bar_id', db.bar).run(conn, function(err,cursor){
    //run the joined action
  });
});

```

In addition you can do all kinds of fun things, like...

```javascript
//installation of the DB and tables
db.install();

//querying
db.query(db.foo, {category : "beer"}, function(err,beers){
  //beers is an array, so have at it
});

db.first(db.bar, {email : "rob@tekpub.com"}, function(err,rob){
  //hi Rob
});

db.exists(db.foo, {name : "bill"}, function(err, exists){
  //exists will tell you if it's there
});

```

## Wanna Help?
Just do me a favor and open a PR with some ideas and hopefully a test or two. Thanks!