const button = document.getElementById("searchButton");
const input = document.getElementById("pokemonInput");

const result = document.getElementById("result");
const image = document.getElementById("pokemonImage");
const nameElement = document.getElementById("pokemonName");
const stats = document.getElementById("pokemonStats");
const recommendation = document.getElementById("recommendation");
const evolutionInfo = document.getElementById("evolutionInfo");
const error = document.getElementById("errorMessage");

button.addEventListener("click", searchPokemon);

input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchPokemon();
    }
});

async function searchPokemon() {

    const name = input.value.trim().toLowerCase();

    if (name === "") {
        error.textContent = "Please enter a Pokémon name.";
        return;
    }

    error.textContent = "";
    result.classList.remove("hidden");

    nameElement.textContent = "Loading...";
    stats.textContent = "";
    recommendation.textContent = "";
    evolutionInfo.textContent = "";

    try {

        const response = await fetch(
            "https://pokeapi.co/api/v2/pokemon/" + name
        );

        if (!response.ok) {
            throw new Error("Pokemon not found");
        }

        const pokemon = await response.json();

        nameElement.textContent =
            pokemon.name.charAt(0).toUpperCase() +
            pokemon.name.slice(1);

        image.src =
            pokemon.sprites.other["official-artwork"].front_default ||
            pokemon.sprites.front_default;

        let totalStats = 0;

        for (const stat of pokemon.stats) {
            totalStats += stat.base_stat;
        }

        stats.textContent =
            "Total base stats: " + totalStats;

        recommendation.textContent =
            "Recommendation: YES, consider evolving!";

        recommendation.className =
            "recommendation evolve";

        evolutionInfo.innerHTML =
            "<p>Pokémon data loaded successfully.</p>";

    } catch (err) {

        console.error(err);

        nameElement.textContent = "";

        error.textContent =
            "Pokémon not found. Try Pikachu, Bulbasaur or Charizard.";

    }
}
