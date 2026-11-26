// ===== 1. Словарь =====
const WORDS = [
    { en: "apple",  ru: "яблоко" },
    { en: "cat",    ru: "кошка" },
    { en: "dog",    ru: "собака" },
    { en: "house",  ru: "дом" },
    { en: "sun",    ru: "солнце" },
    { en: "moon",   ru: "луна" },
    { en: "star",   ru: "звезда" },
    { en: "water",  ru: "вода" },
    { en: "book",   ru: "книга" },
    { en: "tree",   ru: "дерево" },
    { en: "friend", ru: "друг" },
    { en: "city",   ru: "город" },
    { en: "road",   ru: "дорога" },
    { en: "snow",   ru: "снег" },
    { en: "bread",  ru: "хлеб" },
    { en: "window", ru: "окно" }
];

// ===== 1а. Свои слова из localStorage =====
const CUSTOM_KEY = "englishCardsCustomWords";

let customWords = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
WORDS.push(...customWords);

function saveCustomWords() {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(customWords));
}

// ===== 2. Прогресс из localStorage =====
const STORAGE_KEY = "englishCardsProgress";

let learned = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));

function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...learned]));
    updateStats();
}

// ===== 3. Колода =====
let deck = [];

function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function buildDeck() {
    deck = shuffle(WORDS.filter(w => !learned.has(w.en)));
}

// ===== 4. Отрисовка =====
const cardArea   = document.getElementById("card-area");
const controls   = document.getElementById("controls");

function renderCard() {
    cardArea.innerHTML = "";
    controls.classList.add("hidden");

    if (deck.length === 0) {
        // Все слова выучены
        cardArea.innerHTML = `
            <div class="finish">
                <p class="finish-title">Все слова выучены! 🎉</p>
                <button id="btn-restart" class="btn btn-know">Начать заново</button>
            </div>`;
        document.getElementById("btn-restart").addEventListener("click", resetProgress);
        return;
    }

    const word = deck[0];
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <div class="card-inner">
            <div class="card-front">${word.en}
            <button class="speak-btn">🔊</button>
            </div>
            <div class="card-back">${word.ru}</div>
        </div>`;

    card.addEventListener("click", () => {
    card.classList.toggle("flipped");
    controls.classList.toggle("hidden", !card.classList.contains("flipped"));
});

card.querySelector(".speak-btn").addEventListener("click", (e) => {
    e.stopPropagation();          // чтобы не переворачивалась карточка
    const utterance = new SpeechSynthesisUtterance(word.en);
    utterance.lang = "en-US";
    utterance.rate = 0.9;         // чуть медленнее, чтобы разобрать
    speechSynthesis.speak(utterance);
});


    cardArea.appendChild(card);
    updateStats();
}

// ===== 5. Кнопки «Знаю» / «Ещё учить» =====
function mark(know) {
    const word = deck[0];
    if (know) {
        learned.add(word.en);
        saveProgress();
        deck.shift();               // убираем слово из колоды
    } else {
        deck.push(deck.shift());    // отправляем слово в конец колоды
    }
    renderCard();
}

function resetProgress() {
    learned.clear();
    saveProgress();
    buildDeck();
    renderCard();
}

// ===== 6. Статистика =====
function updateStats() {
    document.getElementById("learned-count").textContent = learned.size;
    document.getElementById("total-count").textContent = WORDS.length;
    const percent = (learned.size / WORDS.length) * 100;
    document.getElementById("progress-fill").style.width = percent + "%";
}

// ===== 7. Добавление своих слов =====
const inputEn = document.getElementById("new-en");
const inputRu = document.getElementById("new-ru");
const btnAdd  = document.getElementById("btn-add");

function addWord() {
    const en = inputEn.value.trim().toLowerCase();
    const ru = inputRu.value.trim();

    if (!en || !ru) {
        alert("Заполните оба поля: английское слово и перевод.");
        return;
    }

    if (WORDS.some(w => w.en === en)) {
        alert("Такое английское слово уже есть в словаре.");
        return;
    }

    const word = { en: en, ru: ru };
    WORDS.push(word);
    customWords.push(word);
    saveCustomWords();

    inputEn.value = "";
    inputRu.value = "";
    inputEn.focus();

    deck.push(word);   // новое слово сразу попадает в текущую колоду
    updateStats();
}

btnAdd.addEventListener("click", function (e) {
    e.preventDefault();   // на случай, если поля внутри <form>
    addWord();
});

// Добавление по клавише Enter
inputEn.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        addWord();
    }
});
inputRu.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        addWord();
    }
});

// ===== 8. Запуск =====
document.getElementById("btn-know").addEventListener("click", () => mark(true));
document.getElementById("btn-again").addEventListener("click", () => mark(false));
document.getElementById("btn-shuffle").addEventListener("click", () => {
    buildDeck();
    renderCard();
});
document.getElementById("btn-reset").addEventListener("click", resetProgress);

buildDeck();
renderCard();
