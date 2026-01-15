const infoCard = document.getElementById("infoCard-body");
const searchInput = document.querySelector(".search-header");
const searchIcon = document.querySelector(".search-icon");
const companyCards = document.querySelectorAll(".cardCompany");
const resultsGrid = document.getElementById("resultsGrid");
const menuItems = document.querySelectorAll(".menuItem-SB");
const logoHeader = document.querySelector(".logo-header");
const sidebar = document.querySelector(".sideBar-body");
const overlay = document.getElementById("sidebarOverlay");





const API_BASE = "https://api.tvmaze.com";

const companySearchMap = {
    0: "marvel",
    1: "star wars",
    2: "national geographic",
    3: "disney",
    4: "netflix"
};

//---  sideBar movil ---//

logoHeader.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    }
});

overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
});

menuItems.forEach(item => {
    item.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        }
    });
});


//---   Mostrar información   ---//

function renderShow(show) {
    const imageUrl = show.image?.original || show.image?.medium || "";

    infoCard.style.backgroundImage = `
        linear-gradient(
            rgba(0, 0, 0, 0.65),
            rgba(0, 0, 0, 0.85)
        ),
        url(${imageUrl})
    `;

    infoCard.style.backgroundSize = "cover";
    infoCard.style.backgroundPosition = "50% 25%";
    infoCard.style.backgroundRepeat = "no-repeat";

    infoCard.innerHTML = `
        <h2>${show.name}</h2>
        <p>${show.summary ? show.summary.replace(/<[^>]+>/g, "") : "No description available"}</p>
        <a href="${show.officialSite || "#"}" target="_blank" class="btn-IC-body">
            Watch More
        </a>
    `;
}

function renderResults(shows) {
    resultsGrid.innerHTML = "";

    shows.forEach(item => {
        const show = item.show;

        if (!show.image) return;

        const card = document.createElement("div");
        card.classList.add("result-card");

        card.innerHTML = `
            <img src="${show.image.medium}" alt="${show.name}">
            <h4>${show.name}</h4>
        `;

        card.addEventListener("click", () => {
            renderShow(show);
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        resultsGrid.appendChild(card);
    });
}

/* =========================
   Discovery
========================= */

async function loadDiscovery() {
    loadFeaturedShow();
    try {
        const res = await axios.get(`${API_BASE}/shows`);
        const shows = res.data.slice(0, 12);

        renderShow(shows[0]);
        renderResults(shows.map(show => ({ show })));

    } catch (error) {
        console.error("Discovery error", error);
    }
}


/* =========================
   Top Rated
========================= */

async function loadTopRated() {
    try {
        const res = await axios.get(`${API_BASE}/shows`);

        const topRated = res.data
            .filter(show => show.rating?.average)
            .sort((a, b) => b.rating.average - a.rating.average)
            .slice(0, 12);

        renderShow(topRated[0]);
        renderResults(topRated.map(show => ({ show })));

    } catch (error) {
        console.error("Top Rated error", error);
    }
}


/* =========================
   Coming Soon
========================= */

async function loadComingSoon() {
    try {
        const res = await axios.get(`${API_BASE}/shows`);

        const upcoming = res.data
            .filter(show => show.premiered)
            .sort((a, b) => new Date(b.premiered) - new Date(a.premiered))
            .slice(0, 12);

        renderShow(upcoming[0]);
        renderResults(upcoming.map(show => ({ show })));

    } catch (error) {
        console.error("Coming Soon error", error);
    }
}



/* =========================
   Endpoint 1: Show destacado
========================= */
async function loadFeaturedShow() {
    try {
        const response = await axios.get(`${API_BASE}/shows/73`); // The Walking Dead
        renderShow(response.data);
    } catch (error) {
        console.error("Error loading featured show", error);
    }
}

/* =========================
   Endpoint 2: Buscar series
========================= */
async function searchShow(query) {
    try {
        const response = await axios.get(
            `${API_BASE}/search/shows?q=${query}`
        );

        if (response.data.length > 0) {
            renderShow(response.data[0].show);
            renderResults(response.data.slice(0, 12));
        } else {
            infoCard.innerHTML = `
                <h2>No results</h2>
                <p>Try searching another title</p>
            `;
            resultsGrid.innerHTML = "";
        }

    } catch (error) {
        console.error("Search error", error);
    }
}


/* =========================
   Eventos
========================= */
searchIcon.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
        searchShow(query);
    }
});


searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter" && searchInput.value.trim() !== "") {
        searchShow(searchInput.value);
    }
});

/* =========================
   Init
========================= */
loadFeaturedShow();

companyCards.forEach((card, index) => {
    card.addEventListener("click", () => {
        const query = companySearchMap[index];

        if (query) {
            searchShow(query);
        }
    });
});


menuItems.forEach(item => {
    const section = item.innerText.trim().toLowerCase();

    item.addEventListener("click", () => {
        switch (section) {
            case "discovery":
                loadFeaturedShow();
                break;
            case "top rated":
                loadTopRated();
                break;
            case "coming soon":
                loadComingSoon();
                break;
            case "settings":
                alert("Settings section coming soon 😄");
                break;
        }
    });
});
