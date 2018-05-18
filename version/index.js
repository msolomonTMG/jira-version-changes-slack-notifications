var mongoose = require('mongoose');

var versionSchema = new mongoose.Schema({
  jiraId: String,
  releaseDate: String,
  name: String
});

var Version = mongoose.model('Versions', versionSchema);

var functions = {
  update: function(mongoId, updates) {
    console.log('I AM UPDATING Version ' + mongoId)
    return new Promise(function(resolve, reject) {
      Version.update(
        { _id: mongoId },
        { $set: updates },
        function(err, result) {
          if (err) {
            return reject(err);
          } else {
            Version.findOne({
              _id: mongoId
            }, function(err, version) {
              if(!err) {
                return resolve(version)
              } else {
                return reject(err)
              }
            })
          }
        }
      );
    })
  },
  deleteAll: function() {
    return new Promise(function(resolve, reject) {
      Version.remove({}, function(err, result) {
        if(!err) {
          return resolve(result)
        } else {
          return reject(err)
        }
        
      })
    })
  },
  create: function(versionObj) {
    return new Promise(function (resolve, reject) {
      newVersion = new Version ({
        jiraId: versionObj.jiraId,
        releaseDate: versionObj.releaseDate,
        name: versionObj.name
      });
      newVersion.save(function (err, createdVersion) {
        if (err) {
          return reject(err)
        } else {
          return resolve(createdVersion)
        }
      });

    })
  },
  getAll: function() {
    return new Promise(function(resolve, reject) {
      
      Version.find({}, function(err, versions) {
        if(!err) {
          return resolve(versions)
        } else {
          return reject(err)
        }
      })
      
    });
  },
  getByJiraId: function(jiraId) {
    return new Promise(function(resolve, reject) {

      Version.findOne({
        jiraId: jiraId
      }, function(err, version) {
        if(!err) {
          return resolve(version)
        } else {
          return reject(err)
        }
      })

    });
  }
}

module.exports = functions;
