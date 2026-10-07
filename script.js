const questions = [
  {
    q: "أي عنصر من هذه العناصر هو فلز قلوي؟",
    options: ["الصوديوم Na", "المغنيسيوم Mg", "الكالسيوم Ca", "الألومنيوم Al"],
    answer: 0,
    explanation: "الصوديوم من عناصر المجموعة 1، لذلك هو من الفلزات القلوية."
  },
  {
    q: "الفلزات القلوية تقع في أي مجموعة من الجدول الدوري؟",
    options: ["المجموعة 1", "المجموعة 2", "المجموعة 17", "المجموعة 18"],
    answer: 0,
    explanation: "الفلزات القلوية توجد في المجموعة 1 من الجدول الدوري."
  },
  {
    q: "كم إلكترون تكافؤ للفلزات القلوية؟",
    options: ["1", "2", "3", "7"],
    answer: 0,
    explanation: "للفلزات القلوية إلكترون تكافؤ واحد."
  },
  {
    q: "كم إلكترون تكافؤ للفلزات الأرضية القلوية؟",
    options: ["1", "2", "6", "8"],
    answer: 1,
    explanation: "عناصر المجموعة 2 لها إلكترونا تكافؤ."
  },
  {
    q: "أي عنصر من هذه العناصر فلز أرضي قلوي؟",
    options: ["البوتاسيوم K", "الكالسيوم Ca", "الليثيوم Li", "السيزيوم Cs"],
    answer: 1,
    explanation: "الكالسيوم من عناصر المجموعة 2."
  },
  {
    q: "لماذا يُحفظ الصوديوم والبوتاسيوم تحت الزيت؟",
    options: [
      "لأنهما يحبان الزيت",
      "لأنهما شديدا النشاط مع الماء والهواء",
      "لكي يصبحا لامعين",
      "لأنهما ثقيلان جداً"
    ],
    answer: 1,
    explanation: "لأنهما شديدا النشاط، فيساعد الزيت على عزلهما عن الماء والهواء."
  },
  {
    q: "ما الغاز الناتج عند تفاعل الصوديوم مع الماء؟",
    options: ["الأكسجين", "ثاني أكسيد الكربون", "الهيدروجين", "النيتروجين"],
    answer: 2,
    explanation: "ينتج غاز الهيدروجين عند تفاعل الصوديوم مع الماء."
  },
  {
    q: "أيهما أكثر نشاطاً: البوتاسيوم K أم الليثيوم Li؟",
    options: ["الليثيوم", "البوتاسيوم", "متساويان", "لا يتفاعل أي منهما"],
    answer: 1,
    explanation: "يزداد نشاط الفلزات القلوية كلما نزلنا إلى أسفل المجموعة."
  },
  {
    q: "أي فلز أرضي قلوي يحترق بلهب أبيض ساطع؟",
    options: ["المغنيسيوم Mg", "الصوديوم Na", "الحديد Fe", "الذهب Au"],
    answer: 0,
    explanation: "المغنيسيوم يحترق بلهب أبيض ساطع."
  },
  {
    q: "أي فلز أرضي قلوي مهم للعظام والأسنان؟",
    options: ["البريليوم", "الكالسيوم", "الراديوم", "الباريوم"],
    answer: 1,
    explanation: "الكالسيوم مهم لبناء العظام والأسنان."
  }
];

const el = id => document.getElementById(id);

let current = 0;
let score = 0;
let streak = 0;
let correctCount = 0;
let answered = false;
let soundOn = true;
let audioContext;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.toggle("active", screen.id === id);
  });
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function beep(frequencies) {
  if (!soundOn) return;

  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    let time = audioContext.currentTime;

    frequencies.forEach(([frequency, duration]) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(time);
      oscillator.stop(time + duration);

      time += duration * 0.9;
    });
  } catch (error) {
    // The game still works if browser audio is unavailable.
  }
}

function startGame() {
  current = 0;
  score = 0;
  streak = 0;
  correctCount = 0;

  el("score").textContent = score;
  el("streak").textContent = "🔥 0";
  showScreen("gameScreen");
  loadQuestion();
}

function loadQuestion() {
  answered = false;

  const question = questions[current];
  el("questionText").textContent = question.q;
  el("questionFace").textContent = "🤔";
  el("feedback").classList.remove("show");
  el("nextBtn").classList.add("hidden");
  el("progressFill").style.width = `${(current / questions.length) * 100}%`;

  const answersBox = el("answers");
  answersBox.innerHTML = "";

  const shuffledOptions = shuffle(
    question.options.map((text, originalIndex) => ({
      text,
      correct: originalIndex === question.answer
    }))
  );

  shuffledOptions.forEach(option => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = option.text;
    button.dataset.correct = option.correct ? "true" : "false";
    button.addEventListener("click", () => chooseAnswer(button));
    answersBox.appendChild(button);
  });
}

function chooseAnswer(selectedButton) {
  if (answered) return;
  answered = true;

  const isCorrect = selectedButton.dataset.correct === "true";
  const allButtons = [...document.querySelectorAll(".answer-btn")];

  allButtons.forEach(button => {
    button.disabled = true;

    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    } else if (button !== selectedButton) {
      button.classList.add("dimmed");
    }
  });

  if (isCorrect) {
    streak += 1;
    correctCount += 1;
    const gained = 10 + Math.min(streak - 1, 3) * 5;
    score += gained;

    el("score").textContent = score;
    el("streak").textContent = `🔥 ${streak}`;
    el("questionFace").textContent = "🥳";
    el("feedbackTitle").textContent = `أحسنت! +${gained} نقطة 🎉`;

    beep([[523, 0.12], [659, 0.12], [784, 0.2]]);
  } else {
    selectedButton.classList.add("wrong");
    streak = 0;

    el("streak").textContent = "🔥 0";
    el("questionFace").textContent = "😅";
    el("feedbackTitle").textContent = "لا بأس، تعلّم من الإجابة الصحيحة 💪";

    beep([[330, 0.18], [247, 0.25]]);
  }

  el("feedbackText").textContent = `💡 ${questions[current].explanation}`;
  el("feedback").classList.add("show");

  el("nextBtn").textContent =
    current === questions.length - 1 ? "شاهد نتيجتك 🏆" : "السؤال التالي ⬅️";

  el("nextBtn").classList.remove("hidden");
}

function nextQuestion() {
  current += 1;

  if (current < questions.length) {
    loadQuestion();
  } else {
    endGame();
  }
}

function endGame() {
  el("progressFill").style.width = "100%";

  const ratio = correctCount / questions.length;
  const starCount = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;

  el("stars").textContent = "⭐".repeat(starCount) + "☆".repeat(3 - starCount);
  el("finalScore").textContent = score;

  if (ratio >= 0.8) {
    el("endTitle").textContent = "أنت خبير الفلزات! 🏆";
    el("endFace").textContent = "🥳";
  } else if (ratio >= 0.5) {
    el("endTitle").textContent = "عمل رائع! 👏";
    el("endFace").textContent = "😄";
  } else {
    el("endTitle").textContent = "بداية جميلة! 🌱";
    el("endFace").textContent = "🤗";
  }

  el("endText").textContent =
    `أجبت إجابة صحيحة عن ${correctCount} من ${questions.length} أسئلة.`;

  showScreen("endScreen");
}

el("startBtn").addEventListener("click", startGame);
el("restartBtn").addEventListener("click", startGame);
el("nextBtn").addEventListener("click", nextQuestion);

el("soundBtn").addEventListener("click", () => {
  soundOn = !soundOn;
  el("soundBtn").textContent = soundOn ? "🔊" : "🔇";
});
