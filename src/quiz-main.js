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
    this.maxQuestions = 10; // Limit to 10 questions per quiz session
    this.soundEnabled = true;
    this.streak = 0;
    this.bestStreak = 0;
    this.timer = null;
    this.timePerQuestion = 30; // 30 seconds per question
    this.timeLeft = this.timePerQuestion;
    this.randomizedQuizData = null; // Will store randomized questions
    
    this.initializeElements();
    this.attachEventListeners();
    this.randomizeQuizData(); // Randomize data on initialization
    this.showWelcomeScreen();
    this.setupKeyboardNavigation();
  }

  // Fisher-Yates shuffle algorithm for randomizing arrays
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Randomize options within a question while maintaining correct answer mapping
  randomizeQuestionOptions(question) {
    const originalOptions = [...question.options];
    const correctAnswer = originalOptions[question.correct];
    
    // Shuffle the options
    const shuffledOptions = this.shuffleArray(originalOptions);
    
    // Find the new position of the correct answer
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
    
    return {
      ...question,
      options: shuffledOptions,
      correct: newCorrectIndex
    };
  }

  // Randomize all quiz data on initialization
  randomizeQuizData() {
    this.randomizedQuizData = {
      antonyms: [],
      synonyms: []
    };
    
    // Randomize antonyms
    const shuffledAntonyms = this.shuffleArray(quizData.antonyms);
    this.randomizedQuizData.antonyms = shuffledAntonyms.map(question => 
      this.randomizeQuestionOptions(question)
    );
    
    // Randomize synonyms
    const shuffledSynonyms = this.shuffleArray(quizData.synonyms);
    this.randomizedQuizData.synonyms = shuffledSynonyms.map(question => 
      this.randomizeQuestionOptions(question)
    );
    
    console.log('Quiz data randomized! Questions and options shuffled.');
    this.showRandomizationNotification();
  }

  // Show notification that questions have been randomized
  showRandomizationNotification() {
    // Delay notification to avoid showing immediately on page load
    setTimeout(() => {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = 'randomization-notification';
      notification.innerHTML = `
        <span class="notification-icon">🎲</span>
        <span class="notification-text">Questions randomized for a fresh challenge!</span>
      `;
      
      // Add to document
      document.body.appendChild(notification);
      
      // Show notification
      setTimeout(() => {
        notification.classList.add('show');
      }, 100);
      
      // Hide and remove notification
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }, 1000);
  }

  // Manual reshuffle function for the button
  reshuffleQuestions() {
    this.randomizeQuizData();
    
    // Visual feedback
    const randomizeBtn = document.getElementById('randomize-btn');
    const originalText = randomizeBtn.innerHTML;
    
    randomizeBtn.innerHTML = '<span class="icon">✓</span><span>Questions Shuffled!</span>';
    randomizeBtn.style.background = 'var(--success)';
    randomizeBtn.style.color = 'white';
    randomizeBtn.style.border = 'none';
    
    setTimeout(() => {
      randomizeBtn.innerHTML = originalText;
      randomizeBtn.style.background = '';
      randomizeBtn.style.color = '';
      randomizeBtn.style.border = '';
    }, 2000);
  }

  // Get appropriate explanation for antonyms vs synonyms
  getAnswerExplanation(question, correctAnswer) {
    if (this.currentQuizType === 'antonyms') {
      // Create a mapping of common antonym explanations
      const antonymExplanations = {
        'intensify': 'to increase in strength or degree',
        'normality': 'the condition of being normal or usual',
        'admire': 'to regard with respect and approval',
        'indulge': 'to allow oneself to enjoy something',
        'oppose': 'to disagree with or resist',
        'flexible': 'able to bend or adapt easily',
        'selfish': 'lacking consideration for others',
        'clear': 'easy to understand or see',
        'worsen': 'to become or make worse',
        'enthusiastic': 'showing great excitement and interest',
        'humble': 'showing modest view of one\'s importance',
        'timid': 'showing lack of courage or confidence',
        'luxurious': 'extremely comfortable and expensive',
        'malevolent': 'having evil intentions',
        'lengthiness': 'the quality of being long or extended',
        'harmony': 'a pleasing combination of elements',
        'consistent': 'acting in the same way over time',
        'reckless': 'without thinking of consequences',
        'persuade': 'to convince someone through reasoning',
        'wordy': 'using too many words',
        'disagree': 'to have a different opinion',
        'hidden': 'kept out of sight',
        'unrepentant': 'showing no regret for wrongdoing',
        'scarce': 'insufficient for demand',
        'obvious': 'easily seen or understood',
        'thorough': 'complete with attention to detail',
        'cowardly': 'lacking courage',
        'calm': 'not showing excitement or worry',
        'generous': 'freely giving or sharing',
        'modern': 'relating to present times',
        'peaceful': 'free from disturbance',
        'thoughtful': 'showing consideration for others',
        'ordinary': 'with no special features',
        'beneficial': 'favorable or advantageous',
        'cheerful': 'noticeably happy and optimistic',
        'polite': 'showing good manners',
        'truthful': 'telling or expressing the truth',
        'moral': 'concerned with principles of right conduct',
        'serious': 'demanding careful thought',
        'energetic': 'showing great activity',
        'wise': 'having experience and good judgment'
      };
      
      const antonymMeaning = antonymExplanations[correctAnswer] || 'the opposite concept';
      return `"${question.word}" means ${question.meaning}, while its antonym "${correctAnswer}" means ${antonymMeaning}.`;
    } else {
      // For synonyms
      return `Both "${question.word}" and "${correctAnswer}" share similar meanings: ${question.meaning}`;
    }
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
    document.getElementById('randomize-btn').addEventListener('click', () => this.reshuffleQuestions());
    
    this.continueButton.addEventListener('click', () => this.nextQuestion());
    this.finishButton.addEventListener('click', () => this.showResults());
    
    document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
    document.getElementById('home-btn').addEventListener('click', () => this.showWelcomeScreen());
    document.getElementById('review-btn').addEventListener('click', () => this.showReview());
    document.getElementById('back-from-review').addEventListener('click', () => this.backToResults());
  }

  showWelcomeScreen() {
    this.welcomeScreen.style.display = 'block';
    this.quizScreen.style.display = 'none';
    this.resultsScreen.style.display = 'none';
    this.reviewScreen.style.display = 'none';
    
    // Ensure welcome screen is visible
    this.welcomeScreen.classList.add('show');
    this.quizScreen.classList.remove('show');
    this.resultsScreen.classList.remove('show');
    this.reviewScreen.classList.remove('show');
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
    
    // Ensure quiz screen is visible
    this.welcomeScreen.classList.remove('show');
    this.quizScreen.classList.add('show');
    this.resultsScreen.classList.remove('show');
    this.reviewScreen.classList.remove('show');
    
    this.loadQuestion();
  }

  getRandomQuestion() {
    const availableQuestions = this.randomizedQuizData[this.currentQuizType].filter(
      (_, index) => !this.answeredQuestions.includes(index)
    );
    
    if (availableQuestions.length === 0) {
      // All questions answered, reset the pool
      this.answeredQuestions = [];
      return this.randomizedQuizData[this.currentQuizType][Math.floor(Math.random() * this.randomizedQuizData[this.currentQuizType].length)];
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    // Mark this question as answered
    const originalIndex = this.randomizedQuizData[this.currentQuizType].indexOf(selectedQuestion);
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
    
    // Use the improved explanation function
    answerMeaning.textContent = this.getAnswerExplanation(question, correctAnswer);
    
    if (this.currentQuizType === 'antonyms') {
      this.meaningElement.textContent = `"${question.word}" means: ${question.meaning}`;
    } else {
      this.meaningElement.textContent = `Word meaning: ${question.meaning}`;
    }
    
    this.answerExplanation.classList.add('show');
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
    
    // Check if we've reached the maximum questions limit
    if (this.currentQuestionIndex >= this.maxQuestions) {
      this.showResults();
      return;
    }
    
    this.loadQuestion();
  }

  updateProgress() {
    const questionsAnswered = this.currentQuestionIndex + 1;
    this.progressElement.textContent = `Question ${questionsAnswered}/${this.maxQuestions}`;
  }

  updateProgressBar() {
    // Update progress bar based on questions answered vs maximum
    const questionsAnswered = this.currentQuestionIndex + 1;
    const progressPercentage = (questionsAnswered / this.maxQuestions) * 100;
    
    if (this.progressBar) {
      this.progressBar.style.width = `${progressPercentage}%`;
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
    
    // Clear timer
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    this.quizScreen.style.display = 'none';
    this.resultsScreen.style.display = 'block';
    
    // Ensure responsive layout is applied
    this.resultsScreen.classList.add('show');
    
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
    if (scoreDisplay) {
      scoreDisplay.style.transform = 'scale(0.8)';
      scoreDisplay.style.opacity = '0';
      setTimeout(() => {
        scoreDisplay.style.transform = 'scale(1)';
        scoreDisplay.style.opacity = '1';
      }, 100);
    }
    
    const reviewBtn = document.getElementById('review-btn');
    reviewBtn.style.display = this.mistakes.length > 0 ? 'inline-block' : 'none';
  }

  showReview() {
    this.resultsScreen.style.display = 'none';
    this.reviewScreen.style.display = 'block';
    
    // Ensure responsive layout is applied
    this.reviewScreen.classList.add('show');
    
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

  backToResults() {
    this.reviewScreen.style.display = 'none';
    this.resultsScreen.style.display = 'block';
    
    // Ensure responsive layout is applied
    this.resultsScreen.classList.add('show');
    this.reviewScreen.classList.remove('show');
  }

  restartQuiz() {
    this.startQuiz(this.currentQuizType);
  }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new QuizApp();
});
