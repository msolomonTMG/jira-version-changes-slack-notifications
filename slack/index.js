const request = require('request')

let helpers = {
  sendSlackMessage: function(postData) {
    return new Promise(function(resolve, reject) {
      
      let options = {
        method: 'post',
        body: postData,
        json: true,
        url: process.env.SLACK_URL
      }

      request(options, function(err, response, body) {
        if (err) {
          console.error('error posting json: ', err)
          return reject(err)
        } else {
          console.log('alerted Slack')
          return resolve(body)
        }
      })
      
    });
  },
  formatReleaseDate: function(version) {
    
    if (version.userReleaseDate) {
      return version.userReleaseDate
    } else {
      return 'TBD'
    }
    
  }
}


let functions = {
  sendVersionCreatedMessage: function(version, project) {
    return new Promise(function(resolve, reject) {
      
      const releaseDate = helpers.formatReleaseDate(version)
      
      let postData = {
        text: `A version has been created!`,
        attachments: [
          {
            fallback: `A version has been updated!`,
            color: 'good',
            title: `${project.name}: ${version.name}`,
            // thumb_url isn't working for project avatars
            // i suspect that the url we are given doesn't
            // acutally resolve to a true image
            thumb_url: `${project.avatarUrls["48x48"]}`,
            fields: [
              {
                title: 'Release Date',
                value: `${releaseDate}`,
                short: true
              }
            ]
          }
        ]
      }
      
      // if there is a description, include it!
      if (version.description != '') {
        postData.attachments[0].fields.push({
          title: 'Description',
          value: `${version.description}`,
          short: false
        })
      }
      
      helpers.sendSlackMessage(postData)
      
    });
  },
  sendVersionUpdatedMessage: function(version, previousDate, project) {
    return new Promise(function(resolve, reject) {
      
      const releaseDate = helpers.formatReleaseDate(version)
      
      let postData = {
        text: `A version has been updated!`,
        attachments: [
          {
            fallback: `A version has been updated!`,
            color: 'warning',
            title: `${project.name}: ${version.name}`,
            // thumb_url isn't working for project avatars
            // i suspect that the url we are given doesn't
            // acutally resolve to a true image
            thumb_url: `${project.avatarUrls["48x48"]}`,
            fields: [
              {
                title: 'Previous Date',
                value: `${previousDate}`,
                short: true
              },
              {
                title: 'Updated Date',
                value: `${releaseDate}`,
                short: true
              }
            ]
          }
        ]
      }
      
      // if there is a description, include it!
      if (version.description != '') {
        postData.attachments[0].fields.push({
          title: 'Description',
          value: `${version.description}`,
          short: false
        })
      }
      
      helpers.sendSlackMessage(postData)
      .then(success => {
        return resovle(success)
      })
      .catch(err => {
        return reject(err)
      })
      
    });
  }
}

module.exports = functions
