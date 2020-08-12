const express = require('express');
const cors = require('cors');
const request = require('superagent');
const app = express();
app.use(cors());
app.use(express.static('public'));
const { WEATHER_KEY, LOCATION_KEY, HIKING_KEY } = process.env;

async function getLatLong(cityName) {
    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${LOCATION_KEY}&q=${cityName}&format=json`);

    const city = response.body[0];

    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon,
    };
}

async function getWeather(lat, lon) {
    const response = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${WEATHER_KEY}`);    

    const weather = response.body.data;

    const mappedWeather = weather.map((forcast) => {
        return {
            weather: forcast.weather.description,
            time: new Date(forcast.ts * 1000),
            sunrise: new Date(forcast.sunrise_ts * 1000),
            sunset: new Date(forcast.sunset_ts * 1000)
        };
    })

    return mappedWeather;
}

async function getHikes(lat, lon) {
    const response = await request.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${HIKING_KEY}`);

    const hikes = response.body.trails;

    const mappedHikes = hikes.map((hike) => {
        return {
            name: hike.name,
            location: hike.location,
            length: hike.length,
            summary: hike.summary
        };
    });

    return mappedHikes;
}

app.get('/', (req, res) => {
    res.send('Hello World!\nGo to /location & /weather2 & /trails2 to search by city name.\nOr go to /weather & /trails to search by latitude and longitude.\nYou can also go to /pokemon to search for pokemon by their name.');
  })

app.get('/location', async (req, res) => {
    try {
        const userInput = req.query.search;

        const mungedData = await getLatLong(userInput);

        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/weather', async (req, res) => {
    try {
        const userLatitude = req.query.latitude;
        const userLongitude = req.query.longitude;

        const mungedWeather = await getWeather(userLatitude, userLongitude);

        res.json(mungedWeather);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/weather2', async (req, res) => {
    try {
        const userInput = req.query.search;

        const mungedWeatherData = await getLatLong(userInput);

        const mungedWeather2 = await getWeather(mungedWeatherData.latitude, mungedWeatherData.longitude);

        res.json(mungedWeather2);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/trails', async (req, res) => {
    try {
        const userLatitude = req.query.latitude;
        const userLongitude = req.query.longitude;

        const mungedTrails = await getHikes(userLatitude, userLongitude);

        res.json(mungedTrails);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/trails2', async (req, res) => {
    try {
        const userInput = req.query.search;

        const mungedTrailData = await getLatLong(userInput);

        const mungedTrails2 = await getHikes(mungedTrailData.latitude, mungedTrailData.longitude);

        res.json(mungedTrails2);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/pokemon', async (req, res) => {
    try {
        const userPoke = req.query.search;
        const response = await request.get(`https://alchemy-pokedex.herokuapp.com/api/pokedex?pokemon=${userPoke}`);
        const pokemonResults = response.body.results;

        const pokemon = pokemonResults.map((poke) => {
            return poke.pokemon;
        });

        res.json(pokemon);
        
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = {
    app
};