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
var port = 8888;

var client_id = 'ea4ceeed7ac442f0a692fae6b60e70d4'; // Your client id
var client_secret = '69329331d2f847cc9e52216291bd1e76'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var top_artists = {};
var top_artist_names = new Set();
var num_pairs = 5;
var num_artists = 50;

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

function findArtistPairs(data) {
  const artistPairs = [];
  data.items.forEach(artist => {
    artist.similar_artists.forEach(similarArtist => {
      const commonGenres = artist.genres.filter(genre => similarArtist.genres.includes(genre));
      if (commonGenres.length > 0) {
        artistPairs.push({ pair: [artist.name, similarArtist.name], genres: commonGenres });
      }
    });
  });
  return artistPairs;
}

// Function to get a random element from an array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to find valid pairs
function findValidPairs(pairData, artistNames) {
  const validPairs = new Set();
  const checkedPairs = new Set();

  while (validPairs.size < 5 && pairData.length > 0) {
    const randomPairData = getRandomElement(pairData);
    const [artist1, artist2] = randomPairData.pair;

    const pairKey = artist1 + "-" + artist2;

    if (artistNames.has(artist1) && artistNames.has(artist2) && !checkedPairs.has(pairKey)) {
      validPairs.add(randomPairData);
      checkedPairs.add(pairKey);
    }

    // Remove the selected pair from the pair data to avoid repetition
    pairData = pairData.filter(pair => pair !== randomPairData);
  }

  return Array.from(validPairs);
}


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

app.get('/artists', function(req, res) {
  var pair_list = findValidPairs(findArtistPairs(top_artists), top_artist_names);
  res.send(pair_list);
});



app.get('/callback', function(req, res) {

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

        var artistList = { 
          url: 'https://api.spotify.com/v1/me/top/artists/?limit=' + num_artists, 
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        request.get(artistList, function(error, response, body) { 
          if (!error && response.statusCode === 200) { 
            top_artists = body;

            // Get similar artists for each top artist
            var completedRequests = 0;
            top_artists.items.forEach((artist, index) => {
              top_artist_names.add(artist.name);
              var similarOptions = {
                url: `https://api.spotify.com/v1/artists/${artist.id}/related-artists`,
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
              };

              request.get(similarOptions, function(error, response, body) {
                if (!error && response.statusCode === 200) {
                  top_artists.items[index].similar_artists = body.artists;
                } else {
                  top_artists.items[index].similar_artists = [];
                }
                completedRequests++;
                if (completedRequests === top_artists.items.length) {
                  // All requests completed
                  res.redirect('/#' +
                    querystring.stringify({
                      access_token: access_token,
                      refresh_token: refresh_token
                    }));
                }
              });
            });
          } else { 
            console.log(response.statusCode);
          }
        });
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

console.log('Listening on port ' + port + '...');
app.listen(process.env.PORT || port);
