/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var client_id = 'ea4ceeed7ac442f0a692fae6b60e70d4'; // Your client id
var client_secret = '69329331d2f847cc9e52216291bd1e76'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var top_tracks = {};

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

//support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());


app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/tracks', function(req, res) {

  res.send(top_tracks);

});

app.get('/events', function(req, res) { 
    res.sendFile(__dirname + '/public/home.html');
});


function eventByYear(date) {

  return new Promise(function(resolve, reject) { 
    request(
      {
        method: "GET",
        url: ("https://www.onthisday.com/date/" + date),
      },
      (err, res, body) => {
        if (err) return console.error(err);
  
        let $ = cheerio.load(body);
  
        let title = $("title");
        let content = $(".event-list");
        //console.log(date);
        //console.log(("https://www.onthisday.com/date/" + date));
  
  
        //console.log(title.text());
        // console.log(content.text());
        // console.log(typeof content.text());
        const diffEventArr = content.text().split('\n');
        //console.log("world events");
  
        //console.log(diffEventArr[1]);
        let newArrEvents = [];
        for (let i = 0; i < diffEventArr.length; i++) {
          if (diffEventArr[i].localeCompare("") != 0) {
            newArrEvents.push(diffEventArr[i]);
            //console.log(i + " || " + diffEventArr[i]);
          }
        }
  
        for (let i = 0; i < newArrEvents.length; i++) {
          //console.log((i + 1) + " || " + newArrEvents[i]);
        }
        //console.log(newArrEvents);
  
        resolve(newArrEvents);
  
      }
    );

  });

}

async function getEvents(years, callback) { 
  var events = [[],[]];
  var promises = [];
  years.forEach(function(item, i) { 
    promises.push(
      eventByYear(parseInt(item)).then(function(eventsF) { 
        events[i] = eventsF;
      })
    );
  });
  await Promise.all(promises);
  callback(events);

}



app.post('/eventsByYear', function(req, res) { 
  var years = req.body.years;
  console.log(years);
  getEvents(years, function (events) { 
    res.send(events);
  });
})

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        var trackOptions = { 
          url: 'https://api.spotify.com/v1/me/top/tracks', 
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        request.get(trackOptions, function(error, response, body) { 
          if (!error && response.statusCode === 200) { 
            console.log('-----TOP TRACKS RESPONSE-----');
            console.log(body);
            console.log('-----------');
            top_tracks = body;
          } else { 
            console.log(response.statusCode);
          }
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening...');
app.listen(process.env.PORT || 8888);
