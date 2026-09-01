const input = document.getElementById("pokemonInput");
const button = document.getElementById("searchButton");
const suggestions = document.getElementById("suggestions");

const result = document.getElementById("result");
const nameElement = document.getElementById("pokemonName");
const recommendation = document.getElementById("recommendation");
const evolutionInfo = document.getElementById("evolutionInfo");
const evolutionDisplay = document.getElementById("evolutionDisplay");
const statsComparison = document.getElementById("statsComparison");
const error = document.getElementById("errorMessage");

let allPokemon = [];

// Load Pokémon names
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

    console.error(err);

}

}

// Autocomplete
input.addEventListener("input", function() {

const search =
    input.value.trim().toLowerCase();

suggestions.innerHTML = "";

if (search === "") {
    return;
}

const matches = allPokemon
    .filter(name => name.startsWith(search))
    .slice(0, 8);


matches.forEach(function(name) {

    const item =
        document.createElement("div");

    item.className = "suggestion";

    item.textContent = name;

    item.addEventListener(
        "click",
        function() {

            input.value = name;

            suggestions.innerHTML = "";

            searchPokemon();

        }
    );

    suggestions.appendChild(item);

});

});

// Search button
button.addEventListener(
"click",
searchPokemon
);

// Enter key
input.addEventListener(
"keydown",
function(event) {

    if (event.key === "Enter") {

        searchPokemon();

    }

}

);

// Main search
async function searchPokemon() {

const name =
    input.value.trim().toLowerCase();


if (name === "") {

    error.textContent =
        "Please enter a Pokémon name.";

    return;

}


suggestions.innerHTML = "";

error.textContent = "";

result.classList.remove("hidden");

nameElement.textContent =
    "Loading...";

recommendation.textContent = "";

evolutionInfo.textContent = "";

evolutionDisplay.innerHTML = "";

statsComparison.innerHTML = "";


try {

    // Current Pokémon
    const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon/" + name
    );


    if (!response.ok) {

        throw new Error(
            "Pokémon not found"
        );

    }


    const pokemon =
        await response.json();


    nameElement.textContent =
        capitalize(pokemon.name);


    // Species
    const speciesResponse =
        await fetch(pokemon.species.url);

    const species =
        await speciesResponse.json();


    // Evolution chain
    const evolutionResponse =
        await fetch(
            species.evolution_chain.url
        );

    const evolutionData =
        await evolutionResponse.json();


    const current =
        findPokemonInChain(
            evolutionData.chain,
            pokemon.name
        );


    // Has evolution
    if (
        current &&
        current.evolves_to.length > 0
    ) {

        const nextName =
            current.evolves_to[0]
                .species.name;


        // Next Pokémon
        const nextResponse =
            await fetch(
                "https://pokeapi.co/api/v2/pokemon/" +
                nextName
            );

        const nextPokemon =
            await nextResponse.json();


        // Show Pokémon side by side
        evolutionDisplay.innerHTML = `

            <div class="evolution-display">

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

            </div>

        `;


        // Show stats comparison
        showStatsComparison(
            pokemon,
            nextPokemon
        );


        // Recommendation
        const currentTotal =
            getTotalStats(pokemon);

        const nextTotal =
            getTotalStats(nextPokemon);


        if (nextTotal > currentTotal) {

            recommendation.textContent =
                "YES — Evolve!";

            recommendation.className =
                "recommendation evolve";


            evolutionInfo.innerHTML =
                "<p>" +
                "<strong>" +
                capitalize(pokemon.name) +
                "</strong> evolves into " +
                "<strong>" +
                capitalize(nextPokemon.name) +
                "</strong> and has higher total base stats." +
                "</p>";

        } else {

            recommendation.textContent =
                "NO — Do not evolve yet.";

            recommendation.className =
                "recommendation do-not-evolve";


            evolutionInfo.innerHTML =
                "<p>" +
                "The evolution does not have higher total base stats." +
                "</p>";

        }


    } else {


        // Final evolution
        evolutionDisplay.innerHTML = `

            <div class="evolution-display">

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

            </div>

        `;


        statsComparison.innerHTML = "";


        recommendation.textContent =
            "NO — Do not evolve.";

        recommendation.className =
            "recommendation do-not-evolve";


        evolutionInfo.innerHTML =
            "<p>" +
            "<strong>" +
            capitalize(pokemon.name) +
            "</strong> is already at the final stage of its evolution chain." +
            "</p>";

    }


} catch (err) {

    console.error(err);

    nameElement.textContent = "";

    evolutionDisplay.innerHTML = "";

    statsComparison.innerHTML = "";

    recommendation.textContent = "";

    evolutionInfo.textContent = "";

    error.textContent =
        "Pokémon not found. Please choose a Pokémon from the suggestions.";

}

}

// Stats comparison
function showStatsComparison(
current,
evolution
) {

const statNames = [
    "HP",
    "Attack",
    "Defense",
    "Sp. Attack",
    "Sp. Defense",
    "Speed"
];


let currentTotal = 0;
let evolutionTotal = 0;


let rows = "";


for (let i = 0; i < 6; i++) {

    const currentValue =
        current.stats[i].base_stat;

    const evolutionValue =
        evolution.stats[i].base_stat;


    currentTotal += currentValue;

    evolutionTotal += evolutionValue;


    const currentClass =
        currentValue >= evolutionValue
            ? "stat-better"
            : "";


    const evolutionClass =
        evolutionValue >= currentValue
            ? "stat-better"
            : "";


    rows += `

        <tr>

            <td>
                ${statNames[i]}
            </td>

            <td class="${currentClass}">
                ${currentValue}
            </td>

            <td class="${evolutionClass}">
                ${evolutionValue}
            </td>

        </tr>

    `;

}


rows += `

    <tr class="total-row">

        <td>
            Total
        </td>

        <td>
            ${currentTotal}
        </td>

        <td>
            ${evolutionTotal}
        </td>

    </tr>

`;


statsComparison.innerHTML = `

    <div class="stats-comparison">

        <h3>
            Base Stats Comparison
        </h3>

        <table class="stats-table">

            <thead>

                <tr>

                    <th>
                        Stat
                    </th>

                    <th>
                        ${capitalize(current.name)}
                    </th>

                    <th>
                        ${capitalize(evolution.name)}
                    </th>

                </tr>

            </thead>

            <tbody>

                ${rows}

            </tbody>

        </table>

    </div>

`;

}

// Find Pokémon in evolution chain
function findPokemonInChain(
node,
pokemonName
) {

if (
    node.species.name === pokemonName
) {

    return node;

}


for (
    const evolution of node.evolves_to
) {

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

// Get image
function getImage(pokemon) {

return (
    pokemon.sprites.other[
        "official-artwork"
    ].front_default ||
    pokemon.sprites.front_default
);

}

// Get total base stats
function getTotalStats(pokemon) {

let total = 0;

for (const stat of pokemon.stats) {

    total += stat.base_stat;

}

return total;

}

// Capitalize
function capitalize(text) {

return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
);

}

// Start
loadPokemonList();
