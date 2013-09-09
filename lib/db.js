var r = require("rethinkdb");
var assert = require("assert");
var _ = require("underscore")._;
var async = require("async");
var Table = require("./table");


var SecondThought = function(){

  var self = this;
  var config = {};
  var connection = {};

  var setConfig = function(args){

    assert.ok(args.db, "No db specified");

    config.host = args.host || "localhost";
    config.db = args.db;
    config.port = args.port || 28015;
  };

  self.connect = function(args, next){

    setConfig(args);
    //get a list of tables and loop them
    r.connect(config, function(err,conn){
      assert.ok(err === null,err);
      r.tableList().run(conn, function(err,tables){
        if(!err){
          //enumerate the tables and drop them onto this object
          _.each(tables, function(table){
            self[table]= new Table(config, table);
          });
        }

        next(err,self);
      });
    });
  };

  self.createDb = function(dbName, next){

    r.connect({host : config.host, port : config.port},function(err,conn){
      assert.ok(err === null,err);
      r.dbCreate(dbName).run(conn,function(err,result){
        //assert.ok(err === null,err);
        conn.close();
        next(err,result);
      });
    });
  };

  self.dropDb = function(dbName, next){

    r.connect({host : config.host, port : config.port},function(err,conn){
      assert.ok(err === null,err);
      r.dbDrop(dbName).run(conn,function(err,result){
        conn.close();
        next(err,result);
      });
    });
  };


  self.createTable = function(tableName, next){

    r.connect(config, function(err,conn){
      assert.ok(err === null,err);
      r.tableCreate(tableName).run(conn,function(err,result){
        assert.ok(err === null,err);
        conn.close();
        next();
      });
    });
  };

  self.tableExists = function(tableName, next){

    r.connect(config, function(err,conn){
      assert.ok(err === null,err);
      r.tableList().run(conn,function(err,tables){
        assert.ok(err === null,err);
        conn.close();
        next(null, _.contains(tables,tableName));
      });
    });
  };

  self.dbExists = function(dbName, next){

    r.connect(config, function(err,conn){
      assert.ok(err === null,err);
      r.dbList().run(conn,function(err,dbs){
        assert.ok(err === null,err);
        conn.close();
        next(null, _.contains(dbs,dbName));
      });
    });
  };

  self.install = function(tables, next){
    assert.ok(tables && tables.length > 0, "Be sure to set the tables array on the config");
    self.createDb(config.db, function(err,result){
      async.each(tables,self.createTable, function(err) {
        assert.ok(err === null,err);
        next(err,err===null);
      });
    });
  };
  
  return self;
};

module.exports = new SecondThought();