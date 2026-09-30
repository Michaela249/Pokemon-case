let allPokemon = [];
const imageBaseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

document.addEventListener("DOMContentLoaded", () => {
  loadPokemonData();

  document.getElementById("searchBtn").addEventListener("click", handleSearch);
  document.getElementById("pokemonInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });
});

async function loadPokemonData() {
  try {
    const response = await fetch("./pokemon.csv");
    const csvText = await response.text();

    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        allPokemon = results.data;
        populateDatalist();
      }
    });
  } catch (err) {
    console.error("Error loading CSV file:", err);
  }
}

function populateDatalist() {
  const datalist = document.getElementById("pokemonDatalist");
  datalist.innerHTML = "";
  allPokemon.forEach(p => {
    if (p.pokemon) {
      const option = document.createElement("option");
      option.value = capitalize(p.pokemon);
      datalist.appendChild(option);
    }
  });
}

function handleSearch() {
  const inputVal = document.getElementById("pokemonInput").value.trim().toLowerCase();
  if (!inputVal) return;

  const currentPokemon = allPokemon.find(p => p.pokemon && p.pokemon.toLowerCase() === inputVal);

  if (!currentPokemon) {
    alert("Pokémon not found. Please check the spelling.");
    return;
  }

  displayResult(currentPokemon);
}

function displayResult(current) {
  const resultCard = document.getElementById("resultCard");
  const pokeName = document.getElementById("pokeName");
  const pokeImages = document.getElementById("pokeImages");
  const recommendationBadge = document.getElementById("recommendationBadge");
  const evolutionInfo = document.getElementById("evolutionInfo");
  const statsComparison = document.getElementById("statsComparison");

  resultCard.style.display = "block";
  pokeName.textContent = capitalize(current.pokemon);

  const nextEvolutions = allPokemon.filter(p => p.evolves_from_species_id === current.species_id);

  pokeImages.innerHTML = "";
  const currentImg = getImageUrl(current);
  if (currentImg) {
    pokeImages.appendChild(createImageElement(currentImg, current.pokemon));
  }

  if (nextEvolutions.length > 0) {
    const targetEvo = nextEvolutions[0];

    const nextImg = getImageUrl(targetEvo);
    if (nextImg) {
      const arrow = document.createElement("span");
      arrow.className = "evo-arrow";
      arrow.textContent = "➔";
      pokeImages.appendChild(arrow);
      pokeImages.appendChild(createImageElement(nextImg, targetEvo.pokemon));
    }

    recommendationBadge.textContent = "YES, EVOLVE IT!";
    recommendationBadge.className = "recommendation yes";

    evolutionInfo.innerHTML = `<p><strong>${capitalize(current.pokemon)}</strong> evolves into <strong>${capitalize(targetEvo.pokemon)}</strong>.</p>`;

    renderStatsTable(current, targetEvo, statsComparison);
  } else {
    recommendationBadge.textContent = "NO, CANNOT EVOLVE";
    recommendationBadge.className = "recommendation no";

    evolutionInfo.innerHTML = `<p><strong>${capitalize(current.pokemon)}</strong> is already at its final stage and has no further evolutions.</p>`;
    statsComparison.innerHTML = renderSingleStatsTable(current);
  }
}

function getImageUrl(pokemonObj) {
  if (pokemonObj.url_image) {
    return imageBaseUrl + pokemonObj.url_image;
  }
  if (pokemonObj.id) {
    return `${imageBaseUrl}${pokemonObj.id}.png`;
  }
  return null;
}

function createImageElement(src, altText) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = altText;
  img.className = "pokemon-img";
  return img;
}

function renderStatsTable(current, next, container) {
  const statsKeys = [
    { name: "HP", key: "hp" },
    { name: "Attack", key: "attack" },
    { name: "Defense", key: "defense" },
    { name: "Special Attack", key: "special_attack" },
    { name: "Special Defense", key: "special_defense" },
    { name: "Speed", key: "speed" }
  ];

  let currentTotal = 0;
  let nextTotal = 0;

  let rowsHtml = statsKeys.map(s => {
    const val1 = current[s.key] || 0;
    const val2 = next[s.key] || 0;
    const diff = val2 - val1;
    currentTotal += val1;
    nextTotal += val2;

    const diffText = diff > 0 ? `+${diff}` : diff;
    const diffClass = diff > 0 ? "positive" : diff < 0 ? "negative" : "";

    return `
      <tr>
        <td>${s.name}</td>
        <td>${val1}</td>
        <td>${val2}</td>
        <td class="${diffClass}">${diffText}</td>
      </tr>
    `;
  }).join("");

  const totalDiff = nextTotal - currentTotal;
  const totalDiffText = totalDiff > 0 ? `+${totalDiff}` : totalDiff;

  container.innerHTML = `
    <h3>Stats Comparison</h3>
    <table class="stats-table">
      <thead>
        <tr>
          <th>Stat</th>
          <th>${capitalize(current.pokemon)}</th>
          <th>${capitalize(next.pokemon)}</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr class="total-row">
          <td><strong>Total Stats</strong></td>
          <td><strong>${currentTotal}</strong></td>
          <td><strong>${nextTotal}</strong></td>
          <td class="positive"><strong>${totalDiffText}</strong></td>
        </tr>
      </tbody>
    </table>
  `;
}

function renderSingleStatsTable(current) {
  const statsKeys = [
    { name: "HP", key: "hp" },
    { name: "Attack", key: "attack" },
    { name: "Defense", key: "defense" },
    { name: "Special Attack", key: "special_attack" },
    { name: "Special Defense", key: "special_defense" },
    { name: "Speed", key: "speed" }
  ];

  let total = 0;
  let rowsHtml = statsKeys.map(s => {
    const val = current[s.key] || 0;
    total += val;
    return `
      <tr>
        <td>${s.name}</td>
        <td>${val}</td>
      </tr>
    `;
  }).join("");

  return `
    <h3>Current Stats</h3>
    <table class="stats-table">
      <thead>
        <tr>
          <th>Stat</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr class="total-row">
          <td><strong>Total Stats</strong></td>
          <td><strong>${total}</strong></td>
        </tr>
      </tbody>
    </table>
  `;
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
