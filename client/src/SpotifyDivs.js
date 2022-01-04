import React, { Component } from 'react';
import "./App.css";
import { user_id, reqheader, reqheader2 } from './config';
import reportWebVitals from './reportWebVitals';
import $ from 'jquery';

var counter = 0;
var max = 50;
var maxCycles = 5;
var thisCycle = 0;
var special_value;
var intervalId;
var requestSongs_done = false;
var generatePlaylist_done = false;
var top10Genres;
var curGenreIndex = 0;
var playlist_id = '';

const urlParams = new URLSearchParams(document.location.search);

export default class SpotifyDivs extends Component {

    constructor(props) {
        super(props);
        this.state = { apiResponse: "" };
    }

    componentDidMount() {
        //COATI: turn this on and off to get all the functionality running
        //intervalId = window.setInterval(checkIfReady, 1000);
    }
    
    render() {
        return(
        <div>
            <div id="test-div-1">
                <p id="test-p-1">Genres:</p>
            </div>
            <div id="test-div-2">
                <p id="test-p-2">Playlist ID:</p>
            </div>
            <div id="test-div-3">
                <p id="test-p-3">Songs for each genre:</p>
            </div>
        </div>
        )
    }

}

// Spotify functionality

function requestSongs(_max, _thisCycle) {
    //window.setInterval(checkIfReady, 1000);
    $.ajax({
        url: 'https://api.spotify.com/v1/me/tracks?limit=' + _max + '&offset=' + _max * _thisCycle,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + reqheader
        },
        success: function(resultA) {
            special_value = resultA;
            var top100artists = [];

            for (var i = 0; i < _max; i++) {
                try {
                    top100artists.push(resultA.items[i].track.artists[0].id);
                } catch {}
            }

            for (var i = 0; i < top100artists.length; i++) {
                function getAjax() {
                    return $.ajax({
                            url: 'https://api.spotify.com/v1/artists/' + top100artists[i],
                            type: 'GET',
                            headers: {
                                'Authorization': 'Bearer ' + reqheader
                            },
                            success: function(resultB) { }
                    })
                }
                getAjax().done(function(response) {
                    counter++;
                    $('#test-p-1').after('<p>' + response.genres + '</p>');
                });
                getAjax().fail(function(error) {
                    $('#test-p-1').after('<p>null</p>');
                });
            }
        }
    });
};

function checkIfReady() {
    console.log('got here');
    var testdiv1 = document.getElementById('test-div-1');
    var testp2 = document.getElementById('test-p-2');

    if (requestSongs_done == false) {
        if (testdiv1.children.length >= max * thisCycle + 1) {
            thisCycle++;
            if (thisCycle < maxCycles) {
                requestSongs(max, thisCycle);
            } else {
                doMLStuff();
            }
        }
    } /*else if (generatePlaylist_done == true) {
        if (curGenreIndex < top10Genres.length) {
            clearInterval(intervalId);
            curGenreIndex++;
            addSongsToPlaylist(playlist_id, top10Genres[curGenreIndex - 1]);
        }
    }
    */
    
}

function doMLStuff() {
    alert(counter);
    var testdiv1 = document.getElementById('test-div-1');
    var testp2 = document.getElementById('test-p-2');

    var genreCounts = new Object();
    if (testdiv1.children.length >= max + 1) {
        var testDiv1Children = testdiv1.children;
        for (var i = 1; i < testDiv1Children.length; i++) {
            var str = testDiv1Children[i].innerText;
            try {
                var thisDivGenres = str.split(',');
                for (var j = 0; j < thisDivGenres.length; j++) {
                    if (genreCounts[thisDivGenres[j]] == null) {
                        genreCounts[thisDivGenres[j]] = 1;
                    }
                    else {
                        genreCounts[thisDivGenres[j]]++;
                    }
                }
            } catch { }
        }
    }

    var dictString = '';
    var genreCountsKeys = Object.keys(genreCounts);
    function sortByCount(array) {
        return array.sort(function(a, b) {
            var x = genreCounts[a];
            var y = genreCounts[b];
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
    }
    sortByCount(genreCountsKeys);
    
    for (var i = 0; i < genreCountsKeys.length; i++) {
        dictString += genreCountsKeys[i] + ': ' + genreCounts[genreCountsKeys[i]] + '\n';
    }

    /*
    generate playlist based on top 10 genres: take the 10 lowest predicted genres based on the top 10 that
    are within the algorithm, and for each one, pull 5 random songs from the radio playlist for that genre
    */
    //allowedGenres: just set as a placeholder for now
    var allowedGenres = ['pop', 'rock', 'country', 'dance pop', 'indie rock', 'alternative rock', 'permanent wave',
    'alternative metal', 'new rave', 'punk', 'indie soul', 'indie poptimism', 'nu metal', 'emo', 'indietronica',
    'indie soul', 'urban contemporary', 'pop rap', 'classic rock', 'trance', 'soft rock', 'indie soul'];
    var _top10Genres = [];
    var i = 0;
    var genresMatched = 0;
    while (genresMatched < 10) {
        try {
            if (allowedGenres.includes(genreCountsKeys[i])) {
                top10Genres.push(genreCountsKeys[i]);
                genresMatched++;
            }
            i++;
        } catch { }
    }
    alert(_top10Genres);
    top10Genres = _top10Genres;
    //createPlaylist(_top10Genres);
    
    testp2.innerText = dictString;
}

function createPlaylist(_top10Genres) {
    //TODO: get ID of playlist once it's created so you can POST songs to it

    function getAjax() {
        return $.ajax({
                url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
                type: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + reqheader2
                },
                data: JSON.stringify({
                    'name': 'Worst Songs ' + Math.floor(Math.random() * 1000000).toString(),
                    'description': 'Just try them!',
                    'public': false
                }),
                dataType: 'json',
                success: function(resultA) {
                    //alert(JSON.stringify(resultA));
                    //console.log(JSON.stringify(resultA));
                    generatePlaylist_done = true;
                },
                error: function(err) {
                    alert(user_id + '..........');
                    alert(JSON.stringify(err));
                }
        });
    }
    getAjax().done(function(response) {
        playlist_id = response.id;
        $('#test-p-2').after('<p>' + response.id + '</p>');
    });
    getAjax().fail(function(error) {
        $('#test-p-2').after('<p>null</p>');
    });
    
};

function addSongsToPlaylist(_playlist_id, _genre) {
    var songsThisGenre = getSongsOneGenre(_genre);
    $.ajax({
        url: 'https://api.spotify.com/v1/playlists/' + _playlist_id + '/tracks',
        type: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + reqheader2
        },
        data: JSON.stringify({
            //'uris': ['spotify:track:7g3jW7rQ81Ddoqu5vxvqYi']
            'uris': songsThisGenre
        }),
        dataType: 'json',
        success: function(resultA) {
            alert(JSON.stringify(resultA));
            console.log(JSON.stringify(resultA));
            generatePlaylist_done = true;
        },
        error: function(err) {
            alert(user_id + '..........');
            alert(JSON.stringify(err));
        }
    });
}

function getSongsOneGenre(_genre) {
    //TODO: return songs from playlist of each genre instead
    switch (_genre) {
        case 'pop':
            return ['spotify:track:7xbWAw3LMgRMn4omR5yVn3'];
        case 'punk':
            return ['spotify:track:64yrDBpcdwEdNY9loyEGbX'];
        case 'indie soul':
            return ['spotify:track:7kC97zPE0PxrcItXyGdk8P'];
        case 'indie poptimism':
            return ['spotify:track:3FpEXAupLwCHwzeUBxF99S'];
        case 'nu metal':
            return ['spotify:track:7mQwxVogsnpR3h6AJLQLlR'];
        default:
            return ['spotify:track:1nedyHXLtbomGOaa7BOwYl'];
    }
}

function getLeastLikedGenres(_top10Genres) {
    //TODO: actually retrieve most anticorrelated genres from ML, this is just a placeholder
    //TODO: store the playlist for each genre in a CSV and access that so you don't have to alter the code
    var leastLikedGenres = [];
    var leastLikedGenresDict = {
        'pop': 'black metal',
        'punk': 'free jazz',
        'indie soul': 'bollywood',
        'indie poptimism': 'country road',
        'nu metal': 'soul'
    }
    for (var i = 0; i < _top10Genres.length; i++) {
        if (leastLikedGenresDict[_top10Genres[i]] != null) {
            leastLikedGenres += leastLikedGenresDict[_top10Genres[i]];
        }
    }
    return leastLikedGenres;
}