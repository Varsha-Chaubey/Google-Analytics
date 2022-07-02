//  logic for ga 4 api

require('dotenv').config()
const  { google } = require('googleapis')
const{ GoogleAuth} = require('google-auth-library')
const analytics = google.analytics('v3')

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/cloud-platform',
]

//process.env.GOOGLE_APPLICATION_CREDENTIALS = "api/secret/NCFIT-Google-sheets-fb5126866790.json";
var GOOGLE_SERVICE_ACCOUNT_URL = process.env.GOOGLE_SERVICE_ACCOUNT_URL
  ? process.env.GOOGLE_SERVICE_ACCOUNT_URL
  : ''
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'src/services/' + GOOGLE_SERVICE_ACCOUNT_URL

getAdminRealtimeData = async function () {
  var  auth = new GoogleAuth({ scopes: SCOPES })
  const client = await auth.getClient()
  const projectId = await auth.getProjectId()
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/321153260:runPivotReport`
  const body = {
    "metrics": [
        {
            "name": "activeUsers"
          },
      {
        "name": "active7DayUsers"
      },
      {
        "name":"active28DayUsers"
      },      
      {
        "name": "screenPageViews"
      },
      {
        "name":"averageSessionDuration"
      },
      {
        "name": "sessions"
      }
    ],
    "dateRanges": [
      {
        "startDate": "7daysAgo",
        "endDate": "today"
      }
    ]
  }
  const res = await client.request({ url, data:body,method:"POST"})
  return res.data
}
console.log('Get data from google api')
getAdminRealtimeData().catch(console.error);
module.exports = getAdminRealtimeData   