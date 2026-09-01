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

        // Get Pokémon data
        const response = await fetch(
            "https://pokeapi.co/api/v2/pokemon/" + name
        );

        if (!response.ok) {
            throw new Error("Pokemon not found");
        }

        const pokemon = await response.json();


        // Display Pokémon name
        nameElement.textContent =
            capitalize(pokemon.name);


        // Display Pokémon image
        image.src =
            pokemon.sprites.other["official-artwork"].front_default ||
            pokemon.sprites.front_default;


        // Calculate total base stats
        let totalStats = 0;

        for (const stat of pokemon.stats) {
            totalStats += stat.base_stat;
        }

        stats.textContent =
            "Total base stats: " + totalStats;


        // Get species data
        const speciesResponse = await fetch(
            pokemon.species.url
        );

        const species = await speciesResponse.json();


        // Get evolution chain
        const evolutionResponse = await fetch(
            species.evolution_chain.url
        );

        const evolutionData =
            await evolutionResponse.json();


        // Find current Pokémon in evolution chain
        const currentPokemon =
            findPokemonInChain(
                evolutionData.chain,
                pokemon.name
            );


        // Check if another evolution exists
        if (
            currentPokemon &&
            currentPokemon.evolves_to.length > 0
        ) {

            const nextEvolution =
                currentPokemon.evolves_to[0]
                    .species.name;


            recommendation.textContent =
                "Recommendation: YES, evolve!";

            recommendation.className =
                "recommendation evolve";


            evolutionInfo.innerHTML =
                "<p><strong>" +
                capitalize(pokemon.name) +
                "</strong> can evolve into <strong>" +
                capitalize(nextEvolution) +
                "</strong>.</p>";


        } else {

            recommendation.textContent =
                "Recommendation: NO, do not evolve.";

            recommendation.className =
                "recommendation do-not-evolve";


            evolutionInfo.innerHTML =
                "<p><strong>" +
                capitalize(pokemon.name) +
                "</strong> is already at the final stage of its evolution chain.</p>";

        }


    } catch (err) {

        console.error(err);

        nameElement.textContent = "";

        stats.textContent = "";

        recommendation.textContent = "";

        evolutionInfo.textContent = "";

        error.textContent =
            "Pokémon not found. Try Pikachu, Bulbasaur or Charizard.";

    }
}


function findPokemonInChain(node, pokemonName) {

    if (node.species.name === pokemonName) {
        return node;
    }


    for (const evolution of node.evolves_to) {

        const found =
            findPokemonInChain(
                evolution,
                pokemonName
            );

        if (found) {
            return found;
        }
    }


    return null;
}


function capitalize(text) {

    return text.charAt(0).toUpperCase() +
        text.slice(1);
}
