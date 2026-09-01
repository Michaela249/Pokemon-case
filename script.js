const input = document.getElementById("pokemonInput");
const button = document.getElementById("searchButton");
const result = document.getElementById("result");
const image = document.getElementById("pokemonImage");
const nameElement = document.getElementById("pokemonName");
const stats = document.getElementById("pokemonStats");
const recommendation = document.getElementById("recommendation");
const evolutionInfo = document.getElementById("evolutionInfo");
const error = document.getElementById("errorMessage");

button.addEventListener("click", searchPokemon);

async function searchPokemon() {
    const name = input.value.trim().toLowerCase();

    if (name === "") {
        error.textContent = "Please enter a Pokémon name.";
        return;
    }

    error.textContent = "";
    result.classList.remove("hidden");

    nameElement.textContent = "Loading...";
    recommendation.textContent = "";
    evolutionInfo.textContent = "";

    try {
        const response = await fetch(
            "https://pokeapi.co/api/v2/pokemon/" + name
        );

        if (!response.ok) {
            throw new Error("Pokemon not found");
        }

        const data = await response.json();

        nameElement.textContent = data.name;

        image.src =
            data.sprites.front_default;

        let total = 0;

        for (let i = 0; i < data.stats.length; i++) {
            total += data.stats[i].base_stat;
        }

        stats.textContent =
            "Total base stats: " + total;

        recommendation.textContent =
            "Pokémon found successfully!";

        recommendation.className =
            "recommendation evolve";

        evolutionInfo.textContent =
            "The Pokémon data was loaded from PokéAPI.";

    } catch (err) {
        console.log(err);

        nameElement.textContent = "";

        error.textContent =
            "Pokémon not found. Try Pikachu, Charizard or Bulbasaur.";
    }
}
