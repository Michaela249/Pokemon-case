const button = document.getElementById("searchButton");
const input = document.getElementById("pokemonInput");

button.addEventListener("click", function () {
    const pokemon = input.value.trim().toLowerCase();

    if (pokemon === "") {
        alert("Please enter a Pokémon name.");
        return;
    }

    alert("You entered: " + pokemon);
});
