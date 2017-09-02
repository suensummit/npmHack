var mysql = require('mysql')
  , events = require('events')
  , Q = require('q')
  ;

var logger = require('./Logger').getLogger('mysql.log');

function MysqlManager()
{
}

MysqlManager.prototype = events.EventEmitter.prototype;

/**
 * Please note that the getManager function both have a return value and the 
 * callback function. It is because while value returning, the actual database
 * connection is not ready.
 */
var Pool = require('mysql/lib/Pool');
Pool.prototype.sql = Pool.prototype.query;

var SqlString = require('mysql/lib/protocol/SqlString');
MysqlManager.prototype.getSQLValue = function(value, stringifyObjects)
{
	stringifyObjects = stringifyObjects || false;
	return SqlString.escape(value, stringifyObjects);
};

MysqlManager.prototype.beginTransaction = function()
{
	var deferred = Q.defer();

	this.getConnection(function(err, conn){
		if (err)
		{
			conn.release();
			deferred.reject(err);
		}
		else
		{
			conn.beginTransaction(function(err) {
				if (err)
					conn.release();
				else
					deferred.resolve(conn);
			});
		}
	});
	return deferred.promise;
};

MysqlManager.prototype.endTransaction = function(conn, err)
{
	var deferred = Q.defer();

	if (typeof(err)!='undefined' && err!=null)
	{
		conn.rollback(function() {
			conn.release();
			deferred.reject(err);
		});
	}
	else
	{
		conn.commit(function(err) {
			if (err) { 
				conn.rollback(function() {
					conn.release();
					deferred.reject(err);
				});
			}
			else
			{
				conn.release();
				deferred.resolve();
			}
		});
	}
	return deferred.promise;
};

MysqlManager.prototype.sqlPromise = function(sql, params)
{
	var deferred = Q.defer();

	params = params || [];
	this.query(sql, params, function(err, data){
		if (err)
		{
			deferred.reject(err);
		}
		else
		{
			deferred.resolve(data);
		}
	});

	return deferred.promise;
};

MysqlManager.prototype.closePromise = function()
{
	var deferred = Q.defer();

	this.end(function(err){
		if (err)
			deferred.reject(err);
		else
			deferred.resolve();
	});

	return deferred.promise;
}

MysqlManager.prototype.getManagerPromise = function(db_config)
{
	var deferred = Q.defer();

	var dbmgr = mysql.createPool(db_config);
	dbmgr.getConnection(function(err, connection) {
		if (err)
		{
			logger.error(err.stack);
			deferred.reject(err);
		}
		else
		{
			connection.release();
			logger.info('MySQL connection to database ' + db_config.database + ' built.');
			deferred.resolve(dbmgr);
		}
	});
	return deferred.promise;
}

MysqlManager.prototype.getManager = function(db_config, callback)
{
	var dbmgr = mysql.createPool(db_config);

	dbmgr.getConnection(function(err, connection) {
		if (err)
		{
			callback(err.stack, null);
		}
		else
		{
			connection.release();
			if (callback)
				callback(null, dbmgr);
		}
	});

	return dbmgr;
};

module.exports = new MysqlManager();

