var r = require("rethinkdb");
var assert = require("assert");
var _ = require("underscore")._;
var async = require("async");


var SecondThought = function(){

  var self = this;
  var config = {};
  var checkForConfig = function(){
    assert.ok(config.tables && config.tables.length > 0, "Be sure to call init before you do anything else");
  }
  self.init = function(args, next){
    assert.ok(args.tables && args.tables.length > 0, "Be sure to set the tables array on the config");
    assert.ok(args.db, "No db specified");

    config.host = args.host || "localhost";
    config.db = args.db;
    config.port = args.port;
    config.tables = args.tables;

    args.tables.forEach(function(table){
      self[table] = r.db(args.db).table(table);

    });

    return self;
  };

  self.save = function(table, record, next){
    checkForConfig();
    var config = getConfig();
    r.connect(config, function(err,conn){
      assert.ok(err === null,err);
      table.insert(record, {upsert : true}).run(conn,function(err,result){
        assert.ok(err === null,err);
        if(result.generated_keys && result.generated_keys.length > 0){
          record.id = _.first(result.generated_keys);
        }
        conn.close();
        next(err,result);
      });
    });
  };

  self.update = function(table, criteria, id, next){
    checkForConfig();
    var config = getConfig();
    r.connect(config, function(err,conn){
      assert.ok(err === null,err);
      table.get(id).update(criteria).run(conn,function(err,result){
        assert.ok(err === null,err);
        conn.close();
        next(null,result.updated > 0);
      });
    });
  };

  self.connect = function(next){
    checkForConfig();
    r.connect(config, next);
  };

  self.deleteRecord = function(table, criteria, next){
    checkForConfig();
    r.connect(config, function(err,conn){
      assert.ok(err === null,err);
      table.delete(criteria).run(conn,function(err,result){
        conn.close();
        next(err,result);
      });
    });
  };

  self.query = function(table, criteria, next){
    checkForConfig();
    var config = getConfig();
    r.connect(config, function(err,conn){
      assert.ok(err === null,err);
      table.filter(criteria).run(conn,function(err,result){
        conn.close();
        result.toArray(next);
      });
    });
  };

  self.first = function(table,criteria, next){
    checkForConfig();
    query(table,criteria, function(err,array){
      next(err, _.first(array));
    });
  };

  self.exists = function(table, criteria, next){
    checkForConfig();
    r.connect(config, function(err,conn){
      assert.ok(err === null,err);
      self.query(table, criteria,function(err,result){
        assert.ok(err === null,err);
        conn.close();
        next(null,result.length > 0);
      });
    });
  };


  //installer
  self.createDb = function(dbName, next){
    checkForConfig();
    r.connect({host : config.host, port : config.port},function(err,conn){
      assert.ok(err === null,err);
      r.dbCreate(dbName).run(conn,function(err,result){
        if(err){
          console.log("Database " + dbName + " already exists");
        }else{
          console.log("Database " + dbName + " created!");
        }
        conn.close();
        next(err,result);
      });
    });
  };

  self.dropDb = function(dbName, next){
    checkForConfig();
    r.connect({host : config.host, port : config.port},function(err,conn){
      assert.ok(err === null,err);
      r.dbDrop(dbName).run(conn,function(err,result){
        assert.ok(err === null,err);
        conn.close();
        next(err,result);
      });
    });
  };


  self.createTable = function(tableName, next){
    checkForConfig();
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
    checkForConfig();
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
    checkForConfig();
    r.connect(config, function(err,conn){
      assert.ok(err === null,err);
      r.dbList().run(conn,function(err,dbs){
        assert.ok(err === null,err);
        conn.close();
        next(null, _.contains(dbs,dbName));
      });
    });
  };

  self.install = function(next){
    checkForConfig();
    self.createDb(config.db, function(err,result){
      async.each(config.tables,createTable, function(err) {
        assert.ok(err === null,err);
        next(err,err===null);
      });
    });
  };
  return self;
};

module.exports = SecondThought();