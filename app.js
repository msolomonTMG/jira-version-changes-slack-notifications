'use strict';

const
  express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  version = require('./version'),
  jira = require('./jira'),
  slack = require('./slack'),
  mongoose = require('mongoose'),
  MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mongo_test";

mongoose.connect(MONGO_URI, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + MONGO_URI + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + MONGO_URI);
  }
});

var app = express();
app.set('port', process.env.PORT || 5000);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

function handleVersionCreated(req, res) {
  let createdVersion = req.body.version
  
  let versionObj = {
    jiraId: createdVersion.id,
    name: createdVersion.name
  }
  
  if (createdVersion.userReleaseDate) {
    versionObj.releaseDate = createdVersion.userReleaseDate
  } else {
    versionObj.releaseDate = 'TBD'
  }
  
  
  version.create(versionObj)
  .then(versionDetails => {
    jira.getProjectDetails(createdVersion)
    .then(projectDetails => {
      slack.sendVersionCreatedMessage(createdVersion, projectDetails)
    })
  })
  
  //res.sendStatus(200)
}

function handleVersionUpdated(req, res) {
  let updatedVersion = req.body.version
  
  version.getByJiraId(updatedVersion.id)
  .then(thisVersion => {
    if (!thisVersion) {
      console.log('didnt find a version so here we are')
      // if we've never seen this version before, create it and send a slack msg
      version.create({
        jiraId: updatedVersion.id,
        releaseDate: updatedVersion.userReleaseDate,
        name: updatedVersion.name
      }).then(versionDetails => {
        jira.getProjectDetails(updatedVersion)
        .then(projectDetails => {
          slack.sendVersionUpdatedMessage(updatedVersion, 'unknown', projectDetails)
        })
      })
      

      res.sendStatus(200)
      
    } else if (thisVersion.releaseDate != updatedVersion.userReleaseDate) {
      // if the release data was changed, send a slack message!
      jira.getProjectDetails(updatedVersion)
      .then(projectDetails => {
        console.log('project is ' + projectDetails.name)
        let previousDate = thisVersion.releaseDate
        slack.sendVersionUpdatedMessage(updatedVersion, previousDate, projectDetails)
        
        // update our records
        version.update(thisVersion._id, {
          releaseDate: updatedVersion.userReleaseDate
        })
      })
      .catch(err => {
        console.log('error')
        console.log(err)
      })
      
    } else {
      // do nothing, version date was not updated
      console.log('something else was updated')
    }
  })
}

app.get('/', function(req, res) {
  version.getAll().then(result => {
    res.send(result)
  })
})

app.post('/', function(req, res) {
  switch(req.body.webhookEvent) {
    case 'jira:version_updated':
      handleVersionUpdated(req, res)
      break;
    case 'jira:version_created':
      handleVersionCreated(req, res)
    break;
  }
  return res.sendStatus(200)  
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
module.exports = app;
