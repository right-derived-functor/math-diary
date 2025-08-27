import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

//docs: https://expressjs.com/en/5x/api.html

dotenv.config(); // reads .env file and makes them available in process.env
const app = express(); // server
const PORT = process.env.PORT || 3001;

app.get("api/lastfm/:artist", async (req, res) => {
	const artist = req.params.artist;

	try {
		const response = await fetch(
		`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(
			artist
		)}&api_key=${process.env.LASTFM_API_KEY}&format=json`
		);

		const data = await response.json();
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch from last.fm" });
	}
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
