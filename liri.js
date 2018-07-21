// Environment variables set & read  with dotenv package
require("dotenv").config();

// Required NPM modules and files //
var request = require("request");
//Grab the Spotify package to send requests to the Spotify API.
var Spotify = require('node-spotify-api');
//Grap the Twitter package to send requests to the Twitter API.
var Twitter = require('twitter');
// fs is a core Node package for reading and writing files
var fs = require("fs");

// keys - other users will need to supply their own
var keys = require('./keys');
var spotifyKey = new Spotify(keys.spotify);
var twitterKey = new Twitter(keys.twitter);

//Tweet limit variable
var tweetLimit = 20;

//User input
var userInput = process.argv[2];

//commands available to the user
switch(userInput) {
    case 'my-tweets':
        console.log('my tweets');
        myTweets();
        break;

    case 'spotify-this-song':
        console.log('spotify this song');
        spotifyRequests();
        break;

    case 'movie-this':
        console.log('OMBD my movie');
        omdbRequests();
        break;

    case 'do-what-it-says':
        console.log('LIRI gets to pick!');
        doAsYourTold();
        break;

    default:
    console.log('Sorry, that is not recognized. Please try one of the following commands, instead: '
    + '\n' + '1) "my-tweets" to read latest tweets from the linked account'
    + '\n' + '2) "spotify-this-song" + a song name or lyric'
    + '\n' + '3) "movie-this" + a film title (please include your film title in quotes)'
    + '\n' + '4) "do-what-it-says"');
}

//Twitter API (last 20 tweets or what's available)
function myTweets () {
    var params = {screen_name: 'ChrisFalk16', count: tweetLimit};
    twitterKey.get('statuses/user_timeline', params, function(error, tweets, response) {
      if (error) {
        console.log(error);
        }
      else if (!error) {
        console.log("\nThese are your last " + (tweets.length) + " tweets: \n");
        for (var i = 0; i < tweets.length; i++) {
          console.log("Tweet # " + (i+1) + ": " + "\n" + tweets[i].text +
          "\n" + "Created on: " + tweets[i].created_at);
          console.log("--------------------");
        }
      }
    });
}

//Spotify API
function spotifyRequests () {
    var songRequest = process.argv[3];

    spotifyKey.search({
        type: 'track',
        query: songRequest,
        limit: 5
      },

  function(err, data) {
      if (err) {
        return console.log('error: ' + err);
      }

    //NOTE: https://developer.spotify.com/web-api/object-model/
    for (var i = 0; i < 5; i++) {
        var songData = data.tracks.items;
        var artistName = songData[i].album.artists[0].name;
        var songTitle = songData[i].name;
        var albumTitle = songData[i].album.name;
        var songUrl = '';

     if (songUrl === null) {
         songUrl = 'no preview found :-(';
     }
     else {
         console.log('--------------------------');
         console.log(`Artist Name: ${artistName}`);
         console.log(`Song Title: ${songTitle}`);
         console.log(`Album Title: ${albumTitle}`);
         songUrl = songData[i].preview_url;

         console.log(`Preview URL: ${songUrl}`);
          }
    }
    });
}

//OMDB API
function omdbRequests () {
    var omdbRequest = require("request");
    var movieTitle = process.argv[3];
        //Okay to use Trilogy's key for now.
        var omdbApiKey = 'trilogy';
        var fullRequest = `http://www.omdbapi.com/?t=${movieTitle}&y=&plot=short&apikey=${omdbApiKey}`;

        omdbRequest(fullRequest, function(error, response, body) {
       
        if (!error && response.statusCode === 200) {
         
            console.log("Title: " +JSON.parse(body).Title
            + "\n " + "Genre(s): " +JSON.parse(body).Genre
            + "\n " + "Year Released: " + JSON.parse(body).Released
            + "\n " + "Maturity Rating: " + JSON.parse(body).Rated
            + "\n " + "Original Language: " + JSON.parse(body).Language
            + "\n " + "Actors: " + JSON.parse(body).Actors
            + "\n " + "Plot Summary: " + JSON.parse(body).Plot
            );
        }
        });
}
// doAsYerTold will read in a file to determine the desired command and then execute
function doAsYourTold() {
	// Append the command to the log file
	fs.appendFile('./log.txt', 'User Command: node liri.js do-what-it-says\n\n', (err) => {
		if (err) throw err;
	});

	// Read in the file containing the command (Not working but I don't think I need the switch commands here-still working on it)
	fs.readFile('./random.txt', 'utf8', function (error, data) {
		if (error) {
			console.log('ERROR: Reading random.txt -- ' + error);
			return;
		} else {
			// Split out the command name and the parameter name
			var cmdString = data.split(',');
			var command = cmdString[0].trim();
			var param = cmdString[1].trim();

			switch(command) {
				case 'my-tweets':
					myTweets(); 
					break;

				case 'spotify-this-song':
					spotifyRequests(param);
					break;

				case 'movie-this':
					omdbRequests(param);
					break;
			}
		}
	});
}