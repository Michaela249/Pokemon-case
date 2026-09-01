:::writing{variant="document" id="52741"}
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
    const pokemon = pokemonInput.value.trim().toLowerCase();

    if (pokemon === "") {
        errorMessage.textContent = "Please enter a Pokémon name.";
        return;
    }

    errorMessage.textContent = "";

    result.classList.remove("hidden");
    loading.classList.remove("hidden");

    pokemonImage.src = "";
    pokemonName.textContent = "";
    pokemonStats.textContent = "";
    recommendation.textContent = "";
    evolutionInfo.innerHTML = "";

    try {
        const pokemonResponse = await fetch(
            "https://pokeapi.co/api/v2/pokemon/" + pokemon
        );

        if (!pokemonResponse.ok) {
            throw new Error("Pokemon not found");
        }

        const pokemonData = await pokemonResponse.json();

        pokemonName.textContent = capitalize(pokemonData.name);

        pokemonImage.src =
            pokemonData.sprites.other["official-artwork"].front_default ||
            pokemonData.sprites.front_default;

        const totalStats = pokemonData.stats.reduce(
            function(total, stat) {
                return total + stat.base_stat;
            },
            0
        );

        pokemonStats.textContent =
            "Total base stats: " + totalStats;

        const speciesResponse = await fetch(
            pokemonData.species.url
        );

        const speciesData = await speciesResponse.json();

        const evolutionResponse = await fetch(
            speciesData.evolution_chain.url
        );

        const evolutionData = await evolutionResponse.json();

        const currentNode = findPokemonInChain(
            evolutionData.chain,
            pokemonData.name
        );

        if (
            currentNode &&
            currentNode.evolves_to.length > 0
        ) {
            const nextPokemon =
                currentNode.evolves_to[0].species.name;

            recommendation.textContent =
                "Recommendation: YES, evolve!";

            recommendation.className =
                "recommendation evolve";

            evolutionInfo.innerHTML =
                "<p><strong>" +
                capitalize(pokemonData.name) +
                "</strong> can evolve into <strong>" +
                capitalize(nextPokemon) +
                "</strong>.</p>" +
                "<p>Evolution usually gives your Pokémon stronger base stats.</p>";

        } else {
            recommendation.textContent =
                "Recommendation: NO evolution available.";

            recommendation.className =
                "recommendation do-not-evolve";

            evolutionInfo.innerHTML =
                "<p>" +
                capitalize(pokemonData.name) +
                " is already at the final stage of its evolution chain.</p>";
        }

    } catch (error) {
        console.error(error);

        errorMessage.textContent =
            "Something went wrong. Please try another Pokémon.";

    } finally {
        loading.classList.add("hidden");
    }
}

function findPokemonInChain(node, pokemonName) {

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
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
:::

### 4. Commit

Dole klikni:

**Commit changes**

---

## 5. Počkaj približne 1–2 minúty

Potom otvor:

:contentReference[oaicite:0]{index=0}

A urob **hard refresh**:

**Windows:** `Ctrl + Shift + R`  
**Mac:** `Cmd + Shift + R`

Potom napíš:

```text
pikachu
