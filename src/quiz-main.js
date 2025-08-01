import { quizData } from './data.js';
import './quiz-style.css';

class QuizApp {
  constructor() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.isAnswered = false;
    this.currentQuizType = 'antonyms';
    this.mistakes = [];
    this.answeredQuestions = [];
    this.maxQuestions = null; // No limit on questions
    this.soundEnabled = true;
    this.streak = 0;
    this.bestStreak = 0;
    this.timer = null;
    this.timePerQuestion = 30; // 30 seconds per question
    this.timeLeft = this.timePerQuestion;
    
    this.initializeElements();
    this.attachEventListeners();
    this.showWelcomeScreen();
    this.setupKeyboardNavigation();
  }

  initializeElements() {
    this.welcomeScreen = document.getElementById('welcome-screen');
    this.quizScreen = document.getElementById('quiz-screen');
    this.resultsScreen = document.getElementById('results-screen');
    this.reviewScreen = document.getElementById('review-screen');
    
    this.questionElement = document.getElementById('question');
    this.meaningElement = document.getElementById('word-meaning');
    this.optionsContainer = document.getElementById('options');
    this.progressElement = document.getElementById('progress');
    this.scoreElement = document.getElementById('score');
    this.continueButton = document.getElementById('continue-btn');
    this.finishButton = document.getElementById('finish-btn');
    
    // Create answer explanation element
    this.answerExplanation = document.createElement('div');
    this.answerExplanation.className = 'answer-explanation';
    this.answerExplanation.innerHTML = `
      <h4>Correct Answer</h4>
      <p id="answer-meaning"></p>
    `;
    this.optionsContainer.parentNode.insertBefore(this.answerExplanation, this.optionsContainer.nextSibling);
    
    // Create progress bar
    this.progressBar = document.getElementById('progress-bar');
    
    // Create streak counter
    this.streakCounter = document.createElement('div');
    this.streakCounter.className = 'streak-counter';
    this.streakCounter.innerHTML = `
      <span class="streak-icon">🔥</span>
      <span class="streak-text">Streak: <span id="streak-number">0</span></span>
    `;
    this.progressInfo = document.querySelector('.progress-info');
    this.progressInfo.appendChild(this.streakCounter);
    
    // Create timer
    this.timerElement = document.createElement('div');
    this.timerElement.className = 'timer';
    this.timerElement.innerHTML = `
      <span class="timer-icon">⏰</span>
      <span class="timer-text">Time: <span id="timer-number">30</span>s</span>
    `;
    this.progressInfo.appendChild(this.timerElement);
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (this.quizScreen.style.display === 'block' && !this.isAnswered) {
        const options = this.optionsContainer.querySelectorAll('.option');
        if (e.key >= '1' && e.key <= '4') {
          const index = parseInt(e.key) - 1;
          if (options[index]) {
            options[index].click();
          }
        }
      }
      
      if (e.key === 'Enter' && this.isAnswered) {
        if (this.continueButton.style.display !== 'none') {
          this.continueButton.click();
        }
      }
      
      if (e.key === 'Escape' && this.isAnswered) {
        if (this.finishButton.style.display !== 'none') {
          this.finishButton.click();
        }
      }
    });
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'correct') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    } else if (type === 'incorrect') {
      oscillator.frequency.setValueAtTime(311.13, audioContext.currentTime); // D#4
      oscillator.frequency.setValueAtTime(261.63, audioContext.currentTime + 0.1); // C4
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }

  attachEventListeners() {
    document.getElementById('start-antonyms').addEventListener('click', () => this.startQuiz('antonyms'));
    document.getElementById('start-synonyms').addEventListener('click', () => this.startQuiz('synonyms'));
    
    this.continueButton.addEventListener('click', () => this.nextQuestion());
    this.finishButton.addEventListener('click', () => this.showResults());
    
    document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
    document.getElementById('home-btn').addEventListener('click', () => this.showWelcomeScreen());
    document.getElementById('review-btn').addEventListener('click', () => this.showReview());
    document.getElementById('back-from-review').addEventListener('click', () => this.showResults());
  }

  showWelcomeScreen() {
    this.welcomeScreen.style.display = 'block';
    this.quizScreen.style.display = 'none';
    this.resultsScreen.style.display = 'none';
    this.reviewScreen.style.display = 'none';
  }

  startQuiz(type) {
    this.currentQuizType = type;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.mistakes = [];
    this.answeredQuestions = [];
    this.streak = 0;
    
    // Get selected difficulty
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
    switch (selectedDifficulty) {
      case 'easy':
        this.timePerQuestion = 45;
        break;
      case 'medium':
        this.timePerQuestion = 30;
        break;
      case 'hard':
        this.timePerQuestion = 15;
        break;
      default:
        this.timePerQuestion = 30;
    }
    
    this.welcomeScreen.style.display = 'none';
    this.quizScreen.style.display = 'block';
    this.resultsScreen.style.display = 'none';
    this.reviewScreen.style.display = 'none';
    
    this.loadQuestion();
  }

  getRandomQuestion() {
    const availableQuestions = quizData[this.currentQuizType].filter(
      (_, index) => !this.answeredQuestions.includes(index)
    );
    
    if (availableQuestions.length === 0) {
      // All questions answered, reset the pool
      this.answeredQuestions = [];
      return quizData[this.currentQuizType][Math.floor(Math.random() * quizData[this.currentQuizType].length)];
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    // Mark this question as answered
    const originalIndex = quizData[this.currentQuizType].indexOf(selectedQuestion);
    this.answeredQuestions.push(originalIndex);
    
    return selectedQuestion;
  }

  loadQuestion() {
    const currentQuestion = this.getRandomQuestion();
    this.selectedAnswer = null;
    this.isAnswered = false;
    
    this.questionElement.textContent = `What is the ${this.currentQuizType.slice(0, -1)} of "${currentQuestion.word}"?`;
    
    // Hide word meaning initially - will show after answer
    this.meaningElement.style.display = 'none';
    
    // Hide answer explanation
    this.answerExplanation.classList.remove('show');
    
    this.optionsContainer.innerHTML = '';
    
    currentQuestion.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 'option';
      button.textContent = option;
      button.addEventListener('click', () => this.selectAnswer(index, currentQuestion));
      this.optionsContainer.appendChild(button);
    });
    
    this.updateProgress();
    this.hideActionButtons();
    this.startTimer();
  }

  startTimer() {
    this.timeLeft = this.timePerQuestion;
    this.updateTimerDisplay();
    
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();
      
      if (this.timeLeft <= 0) {
        this.handleTimeUp();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const timerNumber = document.getElementById('timer-number');
    if (timerNumber) {
      timerNumber.textContent = this.timeLeft;
      
      // Change color based on time left
      if (this.timeLeft <= 5) {
        this.timerElement.style.color = '#ef4444';
        this.timerElement.style.animation = 'pulse 0.5s infinite';
      } else if (this.timeLeft <= 10) {
        this.timerElement.style.color = '#f59e0b';
      } else {
        this.timerElement.style.color = '#10b981';
        this.timerElement.style.animation = 'none';
      }
    }
  }

  handleTimeUp() {
    if (this.isAnswered) return;
    
    clearInterval(this.timer);
    this.isAnswered = true;
    this.streak = 0; // Reset streak on timeout
    
    // Mark the correct answer and disable all options
    const buttons = this.optionsContainer.querySelectorAll('.option');
    const currentQuestion = this.getRandomQuestion();
    
    buttons[currentQuestion.correct].classList.add('correct');
    buttons.forEach(btn => btn.classList.add('disabled'));
    
    // Show timeout message
    const timeoutMessage = document.createElement('div');
    timeoutMessage.className = 'timeout-message';
    timeoutMessage.textContent = '⏰ Time\'s up!';
    document.body.appendChild(timeoutMessage);
    
    setTimeout(() => {
      timeoutMessage.remove();
    }, 2000);
    
    this.updateStreakCounter();
    this.showActionButtons();
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  selectAnswer(selectedIndex, question) {
    if (this.isAnswered) return;
    
    this.selectedAnswer = selectedIndex;
    this.isAnswered = true;
    
    const buttons = this.optionsContainer.querySelectorAll('.option');
    const isCorrect = selectedIndex === question.correct;
    
    // Mark selected answer
    buttons[selectedIndex].classList.add('selected');
    
    if (isCorrect) {
      this.score++;
      this.streak++;
      if (this.streak > this.bestStreak) {
        this.bestStreak = this.streak;
      }
      buttons[selectedIndex].classList.add('correct');
      this.playSound('correct');
      this.createConfetti();
      this.updateStreakCounter();
    } else {
      this.streak = 0; // Reset streak on incorrect answer
      buttons[selectedIndex].classList.add('incorrect');
      buttons[question.correct].classList.add('correct');
      this.playSound('incorrect');
      this.updateStreakCounter();
      
      this.mistakes.push({
        question: question.word,
        meaning: question.meaning,
        yourAnswer: question.options[selectedIndex],
        correctAnswer: question.options[question.correct],
        type: this.currentQuizType
      });
    }
    
    // Show correct answer explanation and word meaning
    const correctAnswer = question.options[question.correct];
    const answerMeaning = document.getElementById('answer-meaning');
    answerMeaning.textContent = `The correct answer is "${correctAnswer}". ${question.meaning}`;
    this.answerExplanation.classList.add('show');
    
    // Also show the word meaning in the question section
    this.meaningElement.textContent = `Word Meaning: ${question.meaning}`;
    this.meaningElement.style.display = 'block';
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    this.stopTimer(); // Stop the timer when answer is selected
    this.showActionButtons();
    this.updateScore();
    this.updateProgressBar();
  }

  showActionButtons() {
    this.continueButton.style.display = 'inline-block';
    this.finishButton.style.display = 'inline-block';
  }

  hideActionButtons() {
    this.continueButton.style.display = 'none';
    this.finishButton.style.display = 'none';
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    this.loadQuestion();
  }

  updateProgress() {
    const questionsAnswered = this.currentQuestionIndex + 1;
    this.progressElement.textContent = `Question ${questionsAnswered}`;
  }

  updateProgressBar() {
    // Update progress bar based on questions answered (simulate progress)
    const questionsAnswered = this.currentQuestionIndex + 1;
    const targetQuestions = Math.max(10, questionsAnswered + 2); // Show progress relative to estimated remaining
    const progressPercentage = (questionsAnswered / targetQuestions) * 100;
    
    if (this.progressBar) {
      this.progressBar.style.width = `${Math.min(progressPercentage, 95)}%`;
    }
  }

  updateScore() {
    const questionsAnswered = this.currentQuestionIndex + 1;
    this.scoreElement.textContent = `Score: ${this.score}/${questionsAnswered}`;
    
    // Add score animation
    this.scoreElement.style.transform = 'scale(1.1)';
    this.scoreElement.style.color = this.score === questionsAnswered ? '#10b981' : '#8b5cf6';
    setTimeout(() => {
      this.scoreElement.style.transform = 'scale(1)';
    }, 200);
  }

  updateStreakCounter() {
    const streakNumber = document.getElementById('streak-number');
    if (streakNumber) {
      streakNumber.textContent = this.streak;
      
      // Add streak animation
      if (this.streak > 0) {
        this.streakCounter.style.transform = 'scale(1.2)';
        this.streakCounter.style.color = '#f59e0b';
        setTimeout(() => {
          this.streakCounter.style.transform = 'scale(1)';
        }, 300);
      }
      
      // Special animation for streak milestones
      if (this.streak === 3 || this.streak === 5 || this.streak === 10) {
        this.createStreakCelebration();
      }
    }
  }

  createStreakCelebration() {
    const celebration = document.createElement('div');
    celebration.className = 'streak-celebration';
    celebration.textContent = `🔥 ${this.streak} Streak! 🔥`;
    document.body.appendChild(celebration);
    
    setTimeout(() => {
      celebration.remove();
    }, 2000);
  }

  createConfetti() {
    const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];
    
    for (let i = 0; i < 15; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 1000);
    }
  }

  showResults() {
    const questionsAnswered = this.currentQuestionIndex + 1;
    const percentage = Math.round((this.score / questionsAnswered) * 100);
    
    this.quizScreen.style.display = 'none';
    this.resultsScreen.style.display = 'block';
    
    document.getElementById('final-score').textContent = `${this.score}/${questionsAnswered}`;
    document.getElementById('percentage').textContent = `${percentage}%`;
    
    // Dynamic result message based on performance
    const resultMessage = document.getElementById('result-message');
    let message = '';
    
    if (percentage >= 90) {
      message = '🎉 Outstanding! You\'re a vocabulary master!';
    } else if (percentage >= 70) {
      message = '🎯 Great job! Keep up the excellent work!';
    } else if (percentage >= 50) {
      message = '👍 Good effort! Practice makes perfect!';
    } else {
      message = '💪 Keep practicing! You\'ll improve with time!';
    }
    
    resultMessage.textContent = message;
    
    // Animate score display
    const scoreDisplay = document.querySelector('.score-display');
    scoreDisplay.style.transform = 'scale(0.8)';
    scoreDisplay.style.opacity = '0';
    setTimeout(() => {
      scoreDisplay.style.transform = 'scale(1)';
      scoreDisplay.style.opacity = '1';
    }, 100);
    
    const reviewBtn = document.getElementById('review-btn');
    reviewBtn.style.display = this.mistakes.length > 0 ? 'inline-block' : 'none';
  }

  showReview() {
    this.resultsScreen.style.display = 'none';
    this.reviewScreen.style.display = 'block';
    
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = '';
    
    this.mistakes.forEach((mistake, index) => {
      const item = document.createElement('div');
      item.className = 'review-item';
      item.innerHTML = `
        <div class="review-question">
          <strong>Question ${index + 1}:</strong> ${mistake.type.slice(0, -1)} of "${mistake.question}"
        </div>
        <div class="review-meaning">
          <em>Meaning: ${mistake.meaning}</em>
        </div>
        <div class="review-answers">
          <span class="your-answer">Your answer: ${mistake.yourAnswer}</span>
          <span class="correct-answer">Correct answer: ${mistake.correctAnswer}</span>
        </div>
      `;
      reviewList.appendChild(item);
    });
  }

  restartQuiz() {
    this.startQuiz(this.currentQuizType);
  }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new QuizApp();
});
