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
    const respose = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${WEATHER_KEY}`);

    const weather = respose.data;

    return {
        weather: weather.weather.description,
        time: weather.ts,
        sunrise: weather.sunrise_ts,
        sunet: weather.sunset_ts
    };
}

async function getHikes(lat, lon) {
    const response = await request.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${HIKING_KEY}`);

    const hikes = response.map((hike) => {
        return {
            name: hike.trails.name,
            location: hike.trails.location,
            length: hike.trails.length,
            summary: hike.trails.summary
        };
    });

    return hikes;
}

app.get('/', (req, res) => {
    res.send('Hello World!')
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
        const userInput = req.query.search;

        const mungedData = await getLatLong(userInput);

        const userLat = mungedData.latitude;
        const userLon = mungedData.longitude;
    
        const mungedWeather = await getWeather(userLat, userLon);
        res.json(mungedWeather);
    } catch (e) {
        res.status(420).json({ error: e.message });
    }
});

app.get('/trails', async (req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLon = req.query.longitude;
    
        const mungedData = await getHikes(userLat, userLon);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message});
    }
});

app.get('/pokemon', async (req, res) => {
    try {
        const response = await request.get('https://alchemy-pokedex.herokuapp.com/api/pokedex?pokemon=mew');
        const pokemon = response.body.results;

        const mews = pokemon.map((poke) => {
            return poke.pokemon;
        });

        res.json(mews);
        
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = {
    app
};