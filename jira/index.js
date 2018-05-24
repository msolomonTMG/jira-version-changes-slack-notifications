const request = require('request')

let functions = {
  getProjectDetails: function(projectIdOrKey) {
    return new Promise(function(resolve, reject) {
      
      let basicAuthUrl = 'https://' + process.env.JIRA_EMAIL + ':' + process.env.JIRA_API_TOKEN + '@'
      let projectUrl = 'nowthis.atlassian.net/rest/api/2/project/' + projectIdOrKey
      let url = basicAuthUrl + projectUrl
      
      let options = {
        method: 'get',
        url: url
      }

      request(options, function(err, response, body) {
        if (err) {
          console.error('error posting json: ', err)
          return reject(err)
        } else {
          return resolve(JSON.parse(body))
        }
      })
      
    });
  }
}

module.exports = functions
