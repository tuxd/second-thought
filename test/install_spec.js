var db = require("../db").init({db : "test", tables : ['foo', 'bar']});
var _ = require("underscore")._;
var should = require("chai").should();

//describe("Installer", function(){
//
//  beforeEach(function(done){
//    db.dropDb("test", function(err,result){
//      done();
//    });
//  });
//
//  describe("database creation", function(){
//    beforeEach(function(done){
//      db.install(function(err,result){
//        done();
//      });
//    });
//
//    it("creates the test db", function(done){
//      db.dbExists("test", function(err,exists){
//        exists.should.equal(true);
//        done();
//      });
//    });
//    it("creates the foo table", function(done){
//      db.tableExists("foo", function(err,exists){
//        exists.should.equal(true);
//        done();
//      });
//    });
//    it("creates the bar table", function(done){
//      db.tableExists("bar", function(err,exists){
//        exists.should.equal(true);
//        done();
//      });
//    });
//  });
//
//});