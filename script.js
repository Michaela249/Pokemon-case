const pokemonInput = document.getElementById("pokemonInput");
const searchButton = document.getElementById("searchButton");

const result = document.getElementById("result");
const loading = document.getElementById("loading");

const pokemonImage = document.getElementById("pokemonImage");
const pokemonName = document.getElementById("pokemonName");
const pokemonStats = document.getElementById("pokemonStats");

const recommendation = document.getElementById("recommendation");
const evolutionInfo = document.getElementById("evolutionInfo");

const errorMessage = document.getElementById("errorMessage");

searchButton.addEventListener("click", getPokemon);

pokemonInput.addEventListener("keydown", function(event) {
if (event.key === "Enter") {
getPokemon();
}
});

async function getPokemon() {

```
const pokemon = pokemonInput.value
    .trim()
    .toLowerCase();

if (!pokemon) {
    showError("Please enter a Pokémon name.");
    return;
}

clearResult();

result.classList.remove("hidden");
loading.classList.remove("hidden");

try {

    const pokemonResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemon}`
    );

    if (!pokemonResponse.ok) {
        throw new Error("Pokémon not found.");
    }

    const pokemonData = await pokemonResponse.json();


    const speciesResponse = await fetch(
        pokemonData.species.url
    );

    const speciesData = await speciesResponse.json();


    const evolutionResponse = await fetch(
        speciesData.evolution_chain.url
    );

    const evolutionData = await evolutionResponse.json();


    displayPokemon(pokemonData);

    checkEvolution(
        pokemonData.name,
        evolutionData.chain
    );

} catch (error) {

    showError(
        "Pokémon not found. Please try another name."
    );

} finally {

    loading.classList.add("hidden");

}
```

}

function displayPokemon(data) {

```
pokemonName.textContent = data.name;

pokemonImage.src =
    data.sprites.other["official-artwork"].front_default ||
    data.sprites.front_default;

pokemonImage.alt = data.name;


const totalStats = data.stats.reduce(
    (total, stat) => total + stat.base_stat,
    0
);

pokemonStats.textContent =
    `Total base stats: ${totalStats}`;
```

}

function checkEvolution(currentPokemon, chain) {

```
const currentName = currentPokemon.toLowerCase();

let currentNode = findPokemonInChain(
    chain,
    currentName
);

if (!currentNode) {

    recommendation.textContent =
        "No evolution information was found.";

    recommendation.className =
        "recommendation do-not-evolve";

    return;

}


if (
    currentNode.evolves_to &&
    currentNode.evolves_to.length > 0
) {

    const nextEvolution =
        currentNode.evolves_to[0]
            .species
            .name;

    recommendation.textContent =
        "Recommendation: YES, evolve!";

    recommendation.className =
        "recommendation evolve";

    evolutionInfo.innerHTML =
        `<p>
            <strong>${capitalize(currentPokemon)}</strong>
            can evolve into
            <strong>${capitalize(nextEvolution)}</strong>.
        </p>
        <p>
            Evolution usually gives your Pokémon
            stronger base stats.
        </p>`;

} else {

    recommendation.textContent =
        "Recommendation: NO evolution available.";

    recommendation.className =
        "recommendation do-not-evolve";

    evolutionInfo.innerHTML =
        `<p>
            ${capitalize(currentPokemon)}
            is already at the final stage
            of its evolution chain.
        </p>`;

}
```

}

function findPokemonInChain(node, pokemonName) {

```
if (node.species.name === pokemonName) {
    return node;
}

for (const evolution of node.evolves_to) {

    const found = findPokemonInChain(
        evolution,
        pokemonName
    );

    if (found) {
        return found;
    }

}

return null;
```

}

function capitalize(text) {

```
return text.charAt(0).toUpperCase() +
    text.slice(1);
```

}

function showError(message) {

```
errorMessage.textContent = message;
```

}

function clearResult() {

```
errorMessage.textContent = "";

pokemonImage.src = "";

pokemonName.textContent = "";

pokemonStats.textContent = "";

recommendation.textContent = "";

evolutionInfo.innerHTML = "";
```

}
