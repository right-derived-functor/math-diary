import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

import cors from "cors";

// for my reference: docs at https://expressjs.com/en/5x/api.html

dotenv.config(); // reads .env file and makes them available in process.env
const app = express(); // server
const PORT = process.env.PORT || 3002;


app.use(cors({
	origin: "https://right-derived-functor.github.io/math-diary/"
}));

//parameters that are fixed across api calls (for now)
const fixedParams = {
	user: "l-e-f",
	format: "json",
	limit: 5,
	api_key: process.env.LASTFM_API_KEY,
}

app.get('/api/lastfm/topdata', async(req, res) => {
	try {
		const params = {...fixedParams,};
	

		params.method = req.query.method;

		if (req.query.period) params.period = req.query.period;

		const url = "https://ws.audioscrobbler.com/2.0/?" + new URLSearchParams(params);

		const response = await fetch(url);
		const data = await response.json();

		res.json(data);
	} catch (err){
		console.error(err);
		res.status(500).json({ error: "Failed to fetch lastfm data" }); //make more specific later
	}
});

app.get('/api/lastfm/recenttracks', async (req, res) => {
	try{
		const params = { ...fixedParams,
			method: "user.getRecentTracks",
		}

		const url = "https://ws.audioscrobbler.com/2.0/?" + new URLSearchParams(params);

		const response = await fetch(url);
		const data = await response.json();

		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch recent tracks" });
	}
});

//start the server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
