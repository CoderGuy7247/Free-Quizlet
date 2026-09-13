// ==========================================
// STUDYFLOW
// ==========================================

let cards = JSON.parse(
  localStorage.getItem("studyflowCards") || "[]"
);

let currentIndex = 0;
let currentMode = "flashcards";
let isFlipped = false;

let score = 0;
let answered = false;


// ==========================================
// ELEMENTS
// ==========================================

const flashcard = document.getElementById("flashcard");
const flashcardQuestion = document.getElementById("flashcardQuestion");
const flashcardAnswer = document.getElementById("flashcardAnswer");

const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const flipButton = document.getElementById("flipButton");

const multipleQuestion = document.getElementById("multipleQuestion");
const choices = document.getElementById("choices");
const multipleFeedback = document.getElementById("multipleFeedback");
const scoreText = document.getElementById("scoreText");

const typingQuestion = document.getElementById("typingQuestion");
const typingInput = document.getElementById("typingInput");
const checkAnswerButton = document.getElementById("checkAnswerButton");
const typingFeedback = document.getElementById("typingFeedback");

const setTitle = document.getElementById("setTitle");

const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

const sortButton = document.getElementById("sortButton");
const shuffleButton = document.getElementById("shuffleButton");
const restartButton = document.getElementById("restartButton");

const autoSortInput = document.getElementById("autoSortInput");
const autoSortButton = document.getElementById("autoSortButton");
const addToExistingButton = document.getElementById("addToExistingButton");
const replaceCardsButton = document.getElementById("replaceCardsButton");
const autoSortStatus = document.getElementById("autoSortStatus");


// ==========================================
// TITLE
// ==========================================

setTitle.value =
  localStorage.getItem("studyflowTitle") || "My Study Set";

setTitle.addEventListener("change", () => {
  localStorage.setItem(
    "studyflowTitle",
    setTitle.value
  );
});


// ==========================================
// SAVE CARDS
// ==========================================

function saveCards() {
  localStorage.setItem(
    "studyflowCards",
    JSON.stringify(cards)
  );
}


// ==========================================
// GET CURRENT CARD
// ==========================================

function getCurrentCard() {
  if (cards.length === 0) {
    return null;
  }

  return cards[currentIndex];
}


// ==========================================
// NORMALIZE ANSWERS
// ==========================================

function normalizeAnswer(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:()[\]{}"'`]/g, "")
    .replace(/\s+/g, " ");
}


// ==========================================
// PROGRESS
// ==========================================

function updateProgress() {

  if (cards.length === 0) {
    progressText.textContent = "0 / 0";
    progressBar.style.width = "0%";
    return;
  }

  progressText.textContent =
    `${currentIndex + 1} / ${cards.length}`;

  const percent =
    ((currentIndex + 1) / cards.length) * 100;

  progressBar.style.width =
    `${percent}%`;
}


// ==========================================
// NEXT CARD
// ==========================================

function moveToNextCard() {

  if (cards.length === 0) {
    return;
  }

  // Move to the next card
  currentIndex++;

  // Go back to the beginning after the last card
  if (currentIndex >= cards.length) {
    currentIndex = 0;
  }

  // Reset card state
  isFlipped = false;
  answered = false;

  // Render the new card
  render();
}


// ==========================================
// PREVIOUS CARD
// ==========================================

function moveToPreviousCard() {

  if (cards.length === 0) {
    return;
  }

  currentIndex--;

  if (currentIndex < 0) {
    currentIndex = cards.length - 1;
  }

  isFlipped = false;
  answered = false;

  render();
}


// ==========================================
// FLASHCARDS
// ==========================================

function renderFlashcard() {

  const card = getCurrentCard();

  if (!card) {

    flashcardQuestion.textContent =
      "No cards yet.";

    flashcardAnswer.textContent =
      "Go to Auto Sorter to create some cards.";

    flashcard.classList.remove("flipped");

    return;
  }

  flashcardQuestion.textContent =
    card.question;

  flashcardAnswer.textContent =
    card.answer;

  flashcard.classList.toggle(
    "flipped",
    isFlipped
  );
}


function flipCard() {

  if (!getCurrentCard()) {
    return;
  }

  isFlipped = !isFlipped;

  flashcard.classList.toggle(
    "flipped",
    isFlipped
  );
}


flashcard.addEventListener(
  "click",
  flipCard
);


flipButton.addEventListener(
  "click",
  flipCard
);


nextButton.addEventListener(
  "click",
  moveToNextCard
);


previousButton.addEventListener(
  "click",
  moveToPreviousCard
);


// ==========================================
// MULTIPLE CHOICE
// ==========================================

function renderMultipleChoice() {

  const card = getCurrentCard();

  choices.innerHTML = "";
  multipleFeedback.textContent = "";

  answered = false;

  if (!card) {

    multipleQuestion.textContent =
      "No cards yet.";

    return;
  }

  multipleQuestion.textContent =
    card.question;


  // Get answers from other cards
  let otherAnswers = cards
    .filter((_, index) => index !== currentIndex)
    .map(card => card.answer);


  // Shuffle other answers
  otherAnswers.sort(
    () => Math.random() - 0.5
  );


  // Maximum of 3 wrong answers
  otherAnswers =
    otherAnswers.slice(0, 3);


  // Put correct answer + wrong answers together
  let options = [
    card.answer,
    ...otherAnswers
  ];


  // Remove duplicates
  options = [
    ...new Set(options)
  ];


  // Shuffle all choices
  options.sort(
    () => Math.random() - 0.5
  );


  options.forEach(answer => {

    const button =
      document.createElement("button");

    button.className = "choice";

    button.textContent =
      answer;

    button.addEventListener(
      "click",
      () => {
        checkMultipleChoice(
          button,
          answer,
          card.answer
        );
      }
    );

    choices.appendChild(button);

  });
}


function checkMultipleChoice(
  button,
  selected,
  correct
) {

  // Don't allow multiple answers
  if (answered) {
    return;
  }

  answered = true;


  const allChoices =
    document.querySelectorAll(".choice");


  // Disable every answer
  allChoices.forEach(choice => {
    choice.disabled = true;
  });


  const isCorrect =
    normalizeAnswer(selected) ===
    normalizeAnswer(correct);


  if (isCorrect) {

    button.classList.add("correct");

    multipleFeedback.textContent =
      "Correct!";

    multipleFeedback.style.color =
      "#20a464";

    score++;

  } else {

    button.classList.add("wrong");

    multipleFeedback.textContent =
      `Incorrect — ${correct}`;

    multipleFeedback.style.color =
      "#dc4545";


    // Highlight the correct answer
    allChoices.forEach(choice => {

      if (
        normalizeAnswer(choice.textContent) ===
        normalizeAnswer(correct)
      ) {
        choice.classList.add("correct");
      }

    });

  }


  scoreText.textContent =
    `Score: ${score}`;


  // Move to the next card after 800ms
  setTimeout(() => {

    if (cards.length === 0) {
      return;
    }

    currentIndex++;

    if (currentIndex >= cards.length) {
      currentIndex = 0;
    }

    isFlipped = false;
    answered = false;

    render();

  }, 800);
}


// ==========================================
// TYPE ANSWER
// ==========================================

function renderTyping() {

  const card = getCurrentCard();

  typingInput.value = "";
  typingFeedback.textContent = "";

  answered = false;

  if (!card) {

    typingQuestion.textContent =
      "No cards yet.";

    return;
  }

  typingQuestion.textContent =
    card.question;
}


function checkTypingAnswer() {

  if (answered) {
    return;
  }

  const card = getCurrentCard();

  if (!card) {
    return;
  }


  const userAnswer =
    normalizeAnswer(
      typingInput.value
    );


  if (!userAnswer) {
    return;
  }


  const correctAnswer =
    normalizeAnswer(
      card.answer
    );


  answered = true;


  if (
    userAnswer === correctAnswer
  ) {

    typingFeedback.textContent =
      "Correct!";

    typingFeedback.style.color =
      "#20a464";

    score++;

  } else {

    typingFeedback.textContent =
      `Incorrect — ${card.answer}`;

    typingFeedback.style.color =
      "#dc4545";

  }


  scoreText.textContent =
    `Score: ${score}`;


  // Move to the next card after 800ms
  setTimeout(() => {

    if (cards.length === 0) {
      return;
    }

    currentIndex++;

    if (currentIndex >= cards.length) {
      currentIndex = 0;
    }

    isFlipped = false;
    answered = false;

    render();

  }, 800);
}


checkAnswerButton.addEventListener(
  "click",
  checkTypingAnswer
);


typingInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      checkTypingAnswer();
    }

  }
);


// ==========================================
// MODE SWITCHING
// ==========================================

const tabs =
  document.querySelectorAll(".tab");


tabs.forEach(tab => {

  tab.addEventListener(
    "click",
    () => {

      currentMode =
        tab.dataset.mode;


      tabs.forEach(t => {
        t.classList.remove("active");
      });

      tab.classList.add("active");


      document
        .querySelectorAll(".mode")
        .forEach(mode => {
          mode.classList.remove("active");
        });


      const selectedMode =
        document.getElementById(
          `${currentMode}Mode`
        );


      if (selectedMode) {
        selectedMode.classList.add("active");
      }


      render();

    }
  );

});


// ==========================================
// SORT
// ==========================================

sortButton.addEventListener(
  "click",
  () => {

    cards.sort(
      (a, b) =>
        a.question.localeCompare(
          b.question
        )
    );

    currentIndex = 0;
    isFlipped = false;
    answered = false;

    saveCards();

    render();

  }
);


// ==========================================
// SHUFFLE
// ==========================================

shuffleButton.addEventListener(
  "click",
  () => {

    for (
      let i = cards.length - 1;
      i > 0;
      i--
    ) {

      const j =
        Math.floor(
          Math.random() * (i + 1)
        );

      [
        cards[i],
        cards[j]
      ] = [
        cards[j],
        cards[i]
      ];

    }

    currentIndex = 0;
    isFlipped = false;
    answered = false;

    saveCards();

    render();

  }
);


// ==========================================
// RESTART
// ==========================================

restartButton.addEventListener(
  "click",
  () => {

    currentIndex = 0;

    score = 0;

    answered = false;

    isFlipped = false;

    scoreText.textContent =
      "Score: 0";

    render();

  }
);


// ==========================================
// AUTO SORTER
// ==========================================

function parseLine(line) {

  const separators = [
    "→",
    "=>",
    "|",
    "=",
    " - ",
    ":"
  ];


  for (const separator of separators) {

    if (line.includes(separator)) {

      const parts =
        line.split(separator);


      if (parts.length >= 2) {

        const question =
          parts[0].trim();

        const answer =
          parts
            .slice(1)
            .join(separator)
            .trim();


        if (
          question.length > 0 &&
          answer.length > 0
        ) {

          return {
            question,
            answer
          };

        }

      }

    }

  }

  return null;
}


function createCardsFromText(text) {

  const lines =
    text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);


  const newCards = [];


  lines.forEach(line => {

    const card =
      parseLine(line);


    if (card) {

      const duplicate =
        newCards.some(existing =>
          normalizeAnswer(
            existing.question
          ) ===
          normalizeAnswer(
            card.question
          )
        );


      if (!duplicate) {
        newCards.push(card);
      }

    }

  });


  return newCards;
}


// ==========================================
// CREATE CARDS
// ==========================================

autoSortButton.addEventListener(
  "click",
  () => {

    const newCards =
      createCardsFromText(
        autoSortInput.value
      );


    if (newCards.length === 0) {

      autoSortStatus.textContent =
        "No cards found.";

      return;
    }


    cards =
      newCards.sort(
        (a, b) =>
          a.question.localeCompare(
            b.question
          )
      );


    currentIndex = 0;

    score = 0;

    answered = false;

    isFlipped = false;

    saveCards();

    render();


    autoSortStatus.textContent =
      `Created ${cards.length} cards!`;

  }
);


// ==========================================
// ADD TO EXISTING
// ==========================================

addToExistingButton.addEventListener(
  "click",
  () => {

    const newCards =
      createCardsFromText(
        autoSortInput.value
      );


    if (newCards.length === 0) {

      autoSortStatus.textContent =
        "No cards found.";

      return;
    }


    cards = [
      ...cards,
      ...newCards
    ];


    saveCards();

    render();


    autoSortStatus.textContent =
      `Added ${newCards.length} cards.`;

  }
);


// ==========================================
// REPLACE CARDS
// ==========================================

replaceCardsButton.addEventListener(
  "click",
  () => {

    const newCards =
      createCardsFromText(
        autoSortInput.value
      );


    if (newCards.length === 0) {

      autoSortStatus.textContent =
        "No cards found.";

      return;
    }


    cards = newCards;

    currentIndex = 0;

    score = 0;

    answered = false;

    isFlipped = false;

    saveCards();

    render();


    autoSortStatus.textContent =
      `Replaced cards. You now have ${cards.length} cards.`;

  }
);


// ==========================================
// KEYBOARD CONTROLS
// ==========================================

document.addEventListener(
  "keydown",
  event => {

    const active =
      document.activeElement;


    // Don't use flashcard keyboard controls
    // while typing in an input
    if (
      active === typingInput ||
      active === autoSortInput ||
      active === setTitle
    ) {
      return;
    }


    if (currentMode === "flashcards") {

      if (event.code === "Space") {

        event.preventDefault();

        flipCard();

      }


      if (event.key === "ArrowRight") {
        moveToNextCard();
      }


      if (event.key === "ArrowLeft") {
        moveToPreviousCard();
      }

    }

  }
);


// ==========================================
// RENDER EVERYTHING
// ==========================================

function render() {

  // Keep currentIndex valid
  if (cards.length === 0) {

    currentIndex = 0;

  } else if (currentIndex >= cards.length) {

    currentIndex = 0;

  }


  updateProgress();

  renderFlashcard();

  renderMultipleChoice();

  renderTyping();

}


// ==========================================
// START APP
// ==========================================

render();