const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const port = 8888;

const client_id = 'ea4ceeed7ac442f0a692fae6b60e70d4'; // Your client id
const client_secret = '69329331d2f847cc9e52216291bd1e76'; // Your secret
const redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

let top_artists = {};
const top_artist_names = new Set();
const num_pairs = 5;
const num_artists = 50;
let access_token = '';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
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

// Function to find valid pairs without repeats like "Future and Kanye" and "Kanye and Future"
function findValidPairs(pairData, artistNames) {
  const validPairs = new Set();
  const checkedPairs = new Set();

  while (validPairs.size < num_pairs && pairData.length > 0) {
    const randomPairData = getRandomElement(pairData);
    const [artist1, artist2] = randomPairData.pair;

    // Sort the pair to ensure "Future and Kanye" and "Kanye and Future" are treated the same
    const sortedPair = [artist1, artist2].sort();
    const pairKey = sortedPair.join('-');

    if (artistNames.has(artist1) && artistNames.has(artist2) && !checkedPairs.has(pairKey)) {
      validPairs.add(randomPairData);
      checkedPairs.add(pairKey);
    }

    // Remove the selected pair from the pair data to avoid repetition
    pairData = pairData.filter(pair => pair !== randomPairData);
  }

  return Array.from(validPairs);
}

// Function to fetch artist's albums
async function fetchAlbums(artistId) {
  return new Promise((resolve, reject) => {
    const url = `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50`;
    request.get({
      url: url,
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      },
      json: true
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      resolve(body.items || []);
    });
  });
}

// Function to fetch tracks from an album and filter them based on the artist's presence
async function fetchTracks(albumId, artistId) {
  return new Promise((resolve, reject) => {
    const url = `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`;
    request.get({
      url: url,
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      },
      json: true
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      const filteredTracks = (body.items || []).filter(track => track.artists.some(artist => artist.id === artistId));
      resolve(filteredTracks);
    });
  });
}

// Function to remove featured artists from track names
function removeFeaturedArtists(trackName) {
  return trackName.replace(/ *\([^)]*\) */g, "");
}

// Function to get the artist ID by name
async function fetchArtistId(artistName) {
  return new Promise((resolve, reject) => {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`;
    request.get({
      url: url,
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      },
      json: true
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      if (body.artists.items.length > 0) {
        resolve(body.artists.items[0].id);
      } else {
        reject(new Error(`Artist not found: ${artistName}`));
      }
    });
  });
}

// Main function to get all song names for a given artist
async function getAllSongs(artistId) {
  try {
    const albums = await fetchAlbums(artistId);
    const allTracksSet = new Set();

    for (const album of albums) {
      const tracks = await fetchTracks(album.id, artistId);
      for (const track of tracks) {
        const cleanedTrackName = removeFeaturedArtists(track.name);
        allTracksSet.add(cleanedTrackName);
      }
    }

    return Array.from(allTracksSet); // Convert Set to Array to ensure uniqueness
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
}

// Main function to process pair data and add song names
async function processPairs(pairData) {
  console.log('Starting to process pairs...'); // Debug statement
  for (const pair of pairData) {
    for (const artistName of pair.pair) {
      console.log(`Fetching ID for artist: ${artistName}`); // Debug statement
      const artistId = await fetchArtistId(artistName);
      console.log(`Fetched ID for artist ${artistName}: ${artistId}`); // Debug statement
      const songs = await getAllSongs(artistId);
      console.log(`Fetched songs for artist ${artistName}: ${songs.length} songs`); // Debug statement
      pair[artistName] = songs;
    }
  }
  console.log('Finished processing pairs.'); // Debug statement

  return pairData;
}

const stateKey = 'spotify_auth_state';

const app = express();

// Support parsing of application/json type post data
app.use(bodyParser.json());

// Support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.get('/login', function(req, res) {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // Your application requests authorization
  const scope = 'user-read-private user-read-email user-top-read';
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
  const pairs = findValidPairs(findArtistPairs(top_artists), top_artist_names);
  console.log('Found pairs:', pairs); // Debug statement
  processPairs(pairs).then(processedPairs => {
    console.log('Processed pairs:', processedPairs); // Debug statement
    res.send(processedPairs, null, 2);
  }).catch(error => {
    console.error('Error processing pairs:', error); // Debug statement
    res.status(500).send({ error: 'Failed to process pairs' });
  });
});

app.get('/callback', function(req, res) {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        const refresh_token = body.refresh_token;

        const options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // Use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        const artistList = {
          url: `https://api.spotify.com/v1/me/top/artists/?limit=${num_artists}`,
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        request.get(artistList, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            top_artists = body;

            // Get similar artists for each top artist
            let completedRequests = 0;
            top_artists.items.forEach((artist, index) => {
              top_artist_names.add(artist.name);
              const similarOptions = {
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
  // Requesting access token from refresh token
  const refresh_token = req.query.refresh_token;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening on port ' + port + '...');
app.listen(process.env.PORT || port);
