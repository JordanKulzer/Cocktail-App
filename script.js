const drinksEl = document.getElementById("drinks");
const favoriteContainer = document.getElementById("fav-drinks");
const drinkPopup = document.getElementById("drink-popup");
const drinkInfoEl = document.getElementById("drink-info");
const popupCloseBtn = document.getElementById("close-popup");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

getRandomDrink();
fetchFavDrinks();

async function getRandomDrink() {
    const resp = await fetch(
        "https://www.thecocktaildb.com/api/json/v1/1/random.php"
    );
    const respData = await resp.json();
    const randomDrink = respData.drinks[0];

    addDrink(randomDrink, true);
}

async function getDrinkById(id) {
    const resp = await fetch(
        "https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=" + id
    );

    const respData = await resp.json();
    const drink = respData.drinks[0];

    return drink;
}

async function getDrinksBySearch(term) {
    const resp = await fetch(
        "https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=" + term
    );

    const respData = await resp.json();
    const drinks = respData.drinks;

    return drinks;
}

function addDrink(drinkData, random = false) {
    console.log(drinkData);

    const drink = document.createElement("div");
    drink.classList.add("drink");

    drink.innerHTML = `
        <div class="drink-header">
            ${
                random
                    ? `
            <span class="random"> Random Cocktail </span>`
                    : ""
            }
            <img
                src="${drinkData.strDrinkThumb}"
                alt="${drinkData.strDrink}"
            />
        </div>
        <div class="drink-body">
            <h4>${drinkData.strDrink}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    const btn = drink.querySelector(".drink-body .fav-btn");

    btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) {
            removeDrinkLS(drinkData.idDrink);
            btn.classList.remove("active");
        } else {
            addDrinkLS(drinkData.idDrink);
            btn.classList.add("active");
        }

        fetchFavDrinks();
    });

    drink.addEventListener("click", () => {
        showDrinkInfo(drinkData);
    });

    drinksEl.appendChild(drink);
}

function addDrinkLS(drinkId) {
    const drinkIds = getDrinksLS();

    localStorage.setItem("drinkIds", JSON.stringify([...drinkIds, drinkId]));
}

function removeDrinkLS(drinkId) {
    const drinkIds = getDrinksLS();

    localStorage.setItem(
        "drinkIds",
        JSON.stringify(drinkIds.filter((id) => id !== drinkId))
    );
}

function getDrinksLS() {
    const drinkIds = JSON.parse(localStorage.getItem("drinkIds"));

    return drinkIds === null ? [] : drinkIds;
}

async function fetchFavDrinks() {
    favoriteContainer.innerHTML = "";

    const drinkIds = getDrinksLS();

    for (let i = 0; i < drinkIds.length; i++) {
        const drinkId = drinkIds[i];
        drink = await getDrinkById(drinkId);

        addDrinkFav(drink);
    }
}

function addDrinkFav(drinkData) {
    const favDrink = document.createElement("li");

    favDrink.innerHTML = `
        <img
            src="${drinkData.strDrinkThumb}"
            alt="${drinkData.strDrink}"
        /><span>${drinkData.strDrink}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

    const btn = favDrink.querySelector(".clear");

    btn.addEventListener("click", () => {
        removeDrinkLS(drinkData.idDrink);

        fetchFavDrinks();
    });

    favDrink.addEventListener("click", () => {
        showDrinkInfo(drinkData);
    });

    favoriteContainer.appendChild(favDrink);
}

function showDrinkInfo(drinkData) {
    drinkInfoEl.innerHTML = "";

    const drinkEl = document.createElement("div");

    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        if (drinkData["strIngredient" + i]) {
            ingredients.push(
                `${drinkData["strIngredient" + i]} - ${
                    drinkData["strMeasure" + i]
                }`
            );
        } else {
            break;
        }
    }

    drinkEl.innerHTML = `
        <h1>${drinkData.strDrink}</h1>
        <img
            src="${drinkData.strDrinkThumb}"
            alt="${drinkData.strDrink}"
        />
        <p>
        ${drinkData.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `
                )
                .join("")}
        </ul>
    `;

    drinkInfoEl.appendChild(drinkEl);

    drinkPopup.classList.remove("hidden");
}

searchBtn.addEventListener("click", async () => {
    drinksEl.innerHTML = "";

    const search = searchTerm.value;
    const drinks = await getDrinksBySearch(search);

    if (drinks) {
        drinks.forEach((drink) => {
            addDrink(drink);
        });
    }
});


popupCloseBtn.addEventListener("click", () => {
    drinkPopup.classList.add("hidden");
});