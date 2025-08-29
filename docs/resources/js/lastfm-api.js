//note: async functions always return a promise

// fetch top tracks
const cache = {
	tracks: {},
	albums: {},
	artists: {}
};

const categoryToMethod = {
	tracks: "user.getTopTracks",
	albums: "user.getTopAlbums",
	artists: "user.getTopArtists",
};

let currentCategory = "tracks";
let currentPeriod = "7day";

lastfmListEl = document.getElementById("lastfm-list");

async function fetchTopData(category, period) {
	if (cache[category][period]) {
		return cache[category][period];
	}
	const method = categoryToMethod[category];

	const response = await fetch(`https://via-math-diary.onrender.com/api/lastfm/topdata?method=${method}&?period=${period}`);
	const data = await response.json();
	cache[category][period] = data;

	return data;
}

async function renderList(category = currentCategory, period = currentPeriod) {
	lastfmListEl.innerHTML = "";
	highlightSelection();

	const data = await fetchTopData(category, period);

	if (currentCategory === "tracks") {
		data.toptracks.track.forEach((track, rank) => {
			const li = document.createElement("li");

			if (rank === 0) {
				li.innerHTML = `<${track.name} by <a href="${track.artist?.url || "#"}">${track.artist?.name || "Unknown Artist"}</a>`;
				li.classList.add("ranked-first"); //possibly will do something with these ranked-firsts, idk yet.
			}
			li.innerHTML = `<a href="${track.url}">${track.name}</a> by <a href="${track.artist?.url || "#"}">${track.artist?.name || "Unknown Artist"}</a>`;
			lastfmListEl.appendChild(li);
		});	

	} else if (currentCategory === "albums") {
		data.topalbums.album.forEach((album, rank) => {
			const li = document.createElement("li");

			if (rank === 0) {
				li.innerHTML = `$<a href="${album.url}">${album.name}</a> by <a href="${album.artist?.url || "#"}">${album.artist?.name || "Unknown Artist"}</a>`;
				li.classList.add("ranked-first");
			}
			li.innerHTML = `<a href="${album.url}">${album.name}</a> by <a href="${album.artist?.url || "#"}">${album.artist?.name || "Unknown Artist"}</a>`;
				li.classList.add("ranked-first");
			lastfmListEl.appendChild(li);
		});	
	} else if (category === "artists") {
		data.topartists.artist.forEach((artist, index) => {
		const li = document.createElement("li");

		if (index === 0) {
			li.innerHTML = `<a href="${artist?.url || "#"}">${artist?.name || "Unknown Artist"}</a>`;
			li.classList.add("ranked-first");
		}
		li.innerHTML = `<a href="${artist?.url || "#"}">${artist?.name || "Unknown Artist"}</a>`;
		lastfmListEl.appendChild(li);
	});	
	}
}

function highlightSelection() {
	document.querySelectorAll(".lastfm-type .scale-wrapper, .lastfm-time .scale-wrapper").forEach(el => el.classList.remove("selected"));
	document.querySelector(`[data-category="${currentCategory}"] .scale-wrapper`)?.classList.add("selected");
	document.querySelector(`[data-category="${currentPeriod}"] .scale-wrapper`)?.classList.add("selected");
}

document.querySelectorAll(".lastfm-type").forEach(el => {
	el.addEventListener("click", () => {
		currentCategory = el.dataset.category;
		renderList();
	})
})

document.querySelectorAll(".lastfm-time").forEach(el => {
	el.addEventListener("click", () => {
		currentPeriod = el.dataset.category;
		renderList();
	})
})


document.addEventListener("DOMContentLoaded", async () => {
	renderList();
});

