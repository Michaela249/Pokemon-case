const input = document.getElementById("pokemonInput");
const button = document.getElementById("searchButton");
const suggestions = document.getElementById("suggestions");

const result = document.getElementById("result");
const nameElement = document.getElementById("pokemonName");
const stats = document.getElementById("pokemonStats");
const recommendation = document.getElementById("recommendation");
const evolutionInfo = document.getElementById("evolutionInfo");
const evolutionDisplay = document.getElementById("evolutionDisplay");
const error = document.getElementById("errorMessage");

let allPokemon = [];

// Load all Pokémon names when the page starts
async function loadPokemonList() {

try {

    const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=1025"
    );

    const data = await response.json();

    allPokemon = data.results.map(
        pokemon => pokemon.name
    );

} catch (err) {

    console.error("Could not load Pokémon list.", err);

}

}

// Show suggestions while typing
input.addEventListener("input", function() {

const search = input.value
    .trim()
    .toLowerCase();

suggestions.innerHTML = "";

if (search === "") {
    return;
}

const matches = allPokemon
    .filter(name => name.startsWith(search))
    .slice(0, 8);


matches.forEach(function(name) {

    const item = document.createElement("div");

    item.className = "suggestion";

    item.textContent = name;

    item.addEventListener("click", function() {

        input.value = name;

        suggestions.innerHTML = "";

        searchPokemon();

    });

    suggestions.appendChild(item);

});

});

// Search button
button.addEventListener("click", searchPokemon);

// Press Enter
input.addEventListener("keydown", function(event) {

if (event.key === "Enter") {

    searchPokemon();

}

});

// Main Pokémon search
async function searchPokemon() {

const name = input.value
    .trim()
    .toLowerCase();


if (name === "") {

    error.textContent =
        "Please enter a Pokémon name.";

    return;

}


suggestions.innerHTML = "";

error.textContent = "";

result.classList.remove("hidden");

nameElement.textContent = "Loading...";

stats.textContent = "";

recommendation.textContent = "";

evolutionInfo.textContent = "";

evolutionDisplay.innerHTML = "";


try {

    // Get Pokémon data
    const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon/" + name
    );


    if (!response.ok) {

        throw new Error("Pokémon not found.");

    }


    const pokemon = await response.json();


    nameElement.textContent =
        capitalize(pokemon.name);


    // Show stats
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

    const species =
        await speciesResponse.json();


    // Get evolution chain
    const evolutionResponse = await fetch(
        species.evolution_chain.url
    );

    const evolutionData =
        await evolutionResponse.json();


    // Find current Pokémon
    const current =
        findPokemonInChain(
            evolutionData.chain,
            pokemon.name
        );


    if (
        current &&
        current.evolves_to.length > 0
    ) {

        const nextName =
            current.evolves_to[0]
                .species.name;


        // Get next evolution data
        const nextResponse = await fetch(
            "https://pokeapi.co/api/v2/pokemon/" +
            nextName
        );

        const nextPokemon =
            await nextResponse.json();


        // Show evolution
        evolutionDisplay.innerHTML = `

            <div class="pokemon-card">

                <img
                    src="${getImage(pokemon)}"
                    alt="${pokemon.name}"
                >

                <h3>
                    ${capitalize(pokemon.name)}
                </h3>

                <p>
                    Current
                </p>

            </div>


            <div class="arrow">
                →
            </div>


            <div class="pokemon-card">

                <img
                    src="${getImage(nextPokemon)}"
                    alt="${nextPokemon.name}"
                >

                <h3>
                    ${capitalize(nextPokemon.name)}
                </h3>

                <p>
                    Evolution
                </p>

            </div>

        `;


        recommendation.textContent =
            "YES — Evolve!";


        recommendation.className =
            "recommendation evolve";


        evolutionInfo.innerHTML =

            "<p>" +

            "<strong>" +
            capitalize(pokemon.name) +
            "</strong>" +

            " can evolve into " +

            "<strong>" +
            capitalize(nextPokemon.name) +
            "</strong>." +

            "</p>";


    } else {


        // Final evolution
        evolutionDisplay.innerHTML = `

            <div class="pokemon-card">

                <img
                    src="${getImage(pokemon)}"
                    alt="${pokemon.name}"
                >

                <h3>
                    ${capitalize(pokemon.name)}
                </h3>

                <p>
                    Final evolution
                </p>

            </div>

        `;


        recommendation.textContent =
            "NO — Do not evolve.";


        recommendation.className =
            "recommendation do-not-evolve";


        evolutionInfo.innerHTML =

            "<p>" +

            "<strong>" +
            capitalize(pokemon.name) +
            "</strong>" +

            " is already at the final stage " +
            "of its evolution chain." +

            "</p>";

    }


} catch (err) {

    console.error(err);

    nameElement.textContent = "";

    stats.textContent = "";

    evolutionDisplay.innerHTML = "";

    recommendation.textContent = "";

    evolutionInfo.textContent = "";

    error.textContent =
        "Pokémon not found. Please choose a Pokémon from the suggestions.";

}

}

// Find Pokémon inside evolution chain
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

// Get Pokémon image
function getImage(pokemon) {

return (
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default
);

}

// Capitalize Pokémon name
function capitalize(text) {

return text.charAt(0).toUpperCase() +
    text.slice(1);

}

// Start loading Pokémon names
loadPokemonList();
