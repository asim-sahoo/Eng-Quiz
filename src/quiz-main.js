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
    this.maxQuestions = null; // No limit - allow all questions
    this.soundEnabled = true;
    this.streak = 0;
    this.bestStreak = 0;
    this.timer = null;
    this.timePerQuestion = 30; // 30 seconds per question
    this.timeLeft = this.timePerQuestion;
    this.randomizedQuizData = null; // Will store randomized questions
    this.currentQuestion = null; // Store current question being displayed
    this.skippedCount = 0; // Track skipped questions
    this.revisionList = []; // Store words marked for revision
    
    this.initializeElements();
    this.attachEventListeners();
    this.randomizeQuizData(); // Randomize data on initialization
    this.loadRevisionList(); // Load revision list from localStorage
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
      // Comprehensive antonym meanings database
      const antonymMeanings = {
        'abundance': 'a very large quantity of something',
        'active': 'engaging in physical or mental activity',
        'admire': 'to regard with respect and approval',
        'aggravate': 'to make a problem or situation worse',
        'agitation': 'a state of anxiety or nervous excitement',
        'alleviate': 'to make suffering or difficulty less severe',
        'apathetic': 'showing no interest or enthusiasm',
        'beneficial': 'favorable or advantageous; resulting in good',
        'benevolent': 'well-meaning and kindly',
        'calm': 'not showing excitement, nervousness, or anger',
        'careless': 'not giving sufficient attention or thought',
        'cautious': 'careful to avoid potential problems or dangers',
        'changeable': 'liable to change; unpredictable',
        'cheerful': 'noticeably happy and optimistic',
        'clear': 'easy to perceive, understand, or interpret',
        'common': 'occurring frequently; ordinary',
        'competent': 'having the necessary ability or knowledge',
        'confusing': 'difficult to understand; unclear',
        'consistent': 'acting in the same way over time',
        'convict': 'to declare guilty of a criminal offense',
        'cowardly': 'lacking courage; showing fear',
        'definite': 'clearly stated or decided; not vague',
        'depressed': 'feeling very unhappy and hopeless',
        'disagree': 'to have a different opinion',
        'dislike': 'to feel distaste for something',
        'disrespect': 'lack of respect or courtesy',
        'easy': 'requiring little effort; simple',
        'enduring': 'lasting; continuing for a long time',
        'energetic': 'showing great activity or vitality',
        'energize': 'to give vitality and enthusiasm to',
        'enthusiastic': 'showing intense excitement and interest',
        'excellent': 'extremely good; outstanding',
        'exciting': 'causing great enthusiasm and eagerness',
        'extraordinary': 'very unusual or remarkable',
        'fallible': 'capable of making mistakes',
        'famous': 'known about by many people',
        'fearful': 'feeling afraid; showing fear',
        'flexible': 'able to bend easily; adaptable',
        'generosity': 'the quality of being kind and generous',
        'harmful': 'causing or likely to cause harm',
        'harmless': 'not able or likely to cause harm',
        'harmony': 'agreement; peaceful coexistence',
        'hidden': 'kept out of sight; concealed',
        'hinder': 'to obstruct or delay the progress of',
        'honesty': 'the quality of being honest and truthful',
        'humble': 'having a modest opinion of one\'s importance',
        'inarticulate': 'unable to speak distinctly or express oneself clearly',
        'indulge': 'to allow oneself to enjoy the pleasure of something',
        'industrious': 'diligent and hardworking',
        'intensify': 'to become or make more intense',
        'intentional': 'done on purpose; deliberate',
        'introverted': 'shy and reticent; focused inward',
        'lazy': 'unwilling to work or use energy',
        'lengthiness': 'the quality of being long in time or extent',
        'luxurious': 'extremely comfortable, elegant, or enjoyable',
        'malevolent': 'having or showing a wish to do evil to others',
        'miserable': 'very unhappy or uncomfortable',
        'modern': 'relating to the present or recent times',
        'modest': 'unassuming in estimation of one\'s abilities',
        'moral': 'concerned with principles of right and wrong behavior',
        'narrow': 'having a small width in relation to length',
        'neglect': 'to fail to care for properly',
        'neutral': 'not supporting either side in a conflict',
        'normality': 'the condition of being normal',
        'obvious': 'easily perceived or understood; clear',
        'open': 'not closed or blocked; accessible',
        'oppose': 'to disagree with or resist',
        'original': 'present or existing from the beginning',
        'originality': 'the ability to think independently and creatively',
        'overlook': 'to fail to notice or consider',
        'permanent': 'lasting or intended to last indefinitely',
        'persuade': 'to cause someone to believe something through reasoning',
        'petty': 'of little importance; trivial',
        'praise': 'to express warm approval or admiration',
        'preserve': 'to maintain something in its original state',
        'provoke': 'to stimulate or give rise to a reaction',
        'reckless': 'without thinking or caring about consequences',
        'respect': 'a feeling of deep admiration',
        'respectful': 'showing deference and respect',
        'scarce': 'existing in small numbers; insufficient',
        'secure': 'fixed or fastened so as not to give way',
        'selfish': 'lacking consideration for others',
        'serious': 'demanding careful consideration or application',
        'seriousness': 'the quality of being serious or grave',
        'sloppy': 'careless and unsystematic; slovenly',
        'stubborn': 'having a determined refusal to change attitude',
        'subtle': 'so delicate as to be difficult to perceive',
        'success': 'the accomplishment of an aim or purpose',
        'taciturn': 'reserved or uncommunicative in speech',
        'thorough': 'complete with regard to every detail',
        'timid': 'showing a lack of courage or confidence',
        'truthful': 'telling or expressing the truth; honest',
        'unlikely': 'not likely to happen or be the case',
        'unproductive': 'not producing desired results',
        'unrepentant': 'showing no regret for one\'s wrongdoings',
        'vague': 'of uncertain, indefinite, or unclear character',
        'verbose': 'using more words than necessary',
        'virtuous': 'having high moral standards',
        'wordy': 'using or expressed in too many words',
        'worsen': 'to become or make worse',
        'yielding': 'giving way under pressure; flexible'
      };
      
      const antonymMeaning = antonymMeanings[correctAnswer] || 'the opposite concept';
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
    this.studyScreen = document.getElementById('study-screen');
    this.revisionScreen = document.getElementById('revision-screen');
    
    this.questionElement = document.getElementById('question');
    this.meaningElement = document.getElementById('word-meaning');
    this.optionsContainer = document.getElementById('options');
    this.progressElement = document.getElementById('progress');
    this.scoreElement = document.getElementById('score');
    this.continueButton = document.getElementById('continue-btn');
    this.finishButton = document.getElementById('finish-btn');
    this.skipButton = document.getElementById('skip-btn');
    this.reviseButton = document.getElementById('revise-btn');
    
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
        
        // Add skip functionality with 'S' key
        if (e.key === 's' || e.key === 'S') {
          if (this.skipButton && this.skipButton.style.display !== 'none') {
            this.skipButton.click();
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

  // LocalStorage methods for revision list persistence
  loadRevisionList() {
    try {
      const saved = localStorage.getItem('quiz-revision-list');
      if (saved) {
        this.revisionList = JSON.parse(saved);
        if (this.revisionList.length > 0) {
          console.log(`Loaded ${this.revisionList.length} words from revision list`);
          // Show notification after a short delay to avoid showing on initial load
          setTimeout(() => {
            this.showNotification(`📝 Loaded ${this.revisionList.length} saved words for revision`, 'success');
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error loading revision list:', error);
      this.revisionList = [];
    }
  }

  saveRevisionList() {
    try {
      localStorage.setItem('quiz-revision-list', JSON.stringify(this.revisionList));
    } catch (error) {
      console.error('Error saving revision list:', error);
    }
  }

  // Optional: Export revision list as JSON file
  exportRevisionList() {
    if (this.revisionList.length === 0) {
      this.showNotification('📝 No words to export', 'warning');
      return;
    }

    const dataStr = JSON.stringify(this.revisionList, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-revision-list-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.showNotification('📝 Revision list exported successfully!', 'success');
  }

  // Optional: Import revision list from JSON file
  importRevisionList(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          // Merge with existing list, avoiding duplicates
          imported.forEach(item => {
            const exists = this.revisionList.find(existing => 
              existing.word === item.word && existing.type === item.type
            );
            if (!exists) {
              this.revisionList.push(item);
            }
          });
          this.saveRevisionList();
          this.showNotification(`📝 Imported ${imported.length} words to revision list!`, 'success');
        }
      } catch (error) {
        this.showNotification('❌ Invalid file format', 'warning');
      }
    };
    reader.readAsText(file);
  }

  attachEventListeners() {
    document.getElementById('start-antonyms').addEventListener('click', () => this.startQuiz('antonyms'));
    document.getElementById('start-synonyms').addEventListener('click', () => this.startQuiz('synonyms'));
    document.getElementById('study-mode').addEventListener('click', () => this.showStudyMode());
    document.getElementById('revision-mode').addEventListener('click', () => this.showRevisionMode());
    document.getElementById('randomize-btn').addEventListener('click', () => this.reshuffleQuestions());
    
    this.continueButton.addEventListener('click', () => this.nextQuestion());
    this.finishButton.addEventListener('click', () => this.showResults());
    this.skipButton.addEventListener('click', () => this.skipQuestion());
    this.reviseButton.addEventListener('click', () => this.addToRevision());
    
    document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
    document.getElementById('quiz-home-btn').addEventListener('click', () => this.showWelcomeScreen());
    document.getElementById('results-home-btn').addEventListener('click', () => this.showWelcomeScreen());
    document.getElementById('review-btn').addEventListener('click', () => this.showReview());
    document.getElementById('back-from-review').addEventListener('click', () => this.backToResults());
    
    // Study mode event listeners
    document.getElementById('back-from-study').addEventListener('click', () => this.showWelcomeScreen());
    document.getElementById('back-from-revision').addEventListener('click', () => this.showWelcomeScreen());
    document.getElementById('clear-revision').addEventListener('click', () => this.clearRevisionList());
    document.getElementById('show-antonyms').addEventListener('click', () => this.showStudyType('antonyms'));
    document.getElementById('show-synonyms').addEventListener('click', () => this.showStudyType('synonyms'));
    document.getElementById('toggle-alphabetical').addEventListener('click', () => this.toggleAlphabeticalSort());
    document.getElementById('word-search').addEventListener('input', (e) => this.filterStudyWords(e.target.value));
  }

  showWelcomeScreen() {
    this.welcomeScreen.style.display = 'block';
    this.quizScreen.style.display = 'none';
    this.resultsScreen.style.display = 'none';
    this.reviewScreen.style.display = 'none';
    this.studyScreen.style.display = 'none';
    this.revisionScreen.style.display = 'none';
    
    // Ensure welcome screen is visible
    this.welcomeScreen.classList.add('show');
    this.quizScreen.classList.remove('show');
    this.resultsScreen.classList.remove('show');
    this.reviewScreen.classList.remove('show');
    this.studyScreen.classList.remove('show');
    this.revisionScreen.classList.remove('show');
    
    // Update revision count on welcome screen
    this.updateRevisionCount();
  }

  startQuiz(type) {
    this.currentQuizType = type;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.skippedCount = 0; // Reset skipped count
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
    this.studyScreen.style.display = 'none';
    
    // Ensure quiz screen is visible
    this.welcomeScreen.classList.remove('show');
    this.quizScreen.classList.add('show');
    this.resultsScreen.classList.remove('show');
    this.reviewScreen.classList.remove('show');
    this.studyScreen.classList.remove('show');
    
    this.loadQuestion();
  }

  getRandomQuestion() {
    const availableQuestions = this.randomizedQuizData[this.currentQuizType].filter(
      (_, index) => !this.answeredQuestions.includes(index)
    );
    
    if (availableQuestions.length === 0) {
      // All questions answered - this shouldn't happen due to nextQuestion() check
      // But just in case, return null to indicate completion
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    // Mark this question as answered
    const originalIndex = this.randomizedQuizData[this.currentQuizType].indexOf(selectedQuestion);
    this.answeredQuestions.push(originalIndex);
    
    return selectedQuestion;
  }

  loadQuestion() {
    this.currentQuestion = this.getRandomQuestion();
    
    // Check if all questions are completed
    if (!this.currentQuestion) {
      this.showResults();
      return;
    }
    
    this.selectedAnswer = null;
    this.isAnswered = false;
    
    this.questionElement.textContent = `What is the ${this.currentQuizType.slice(0, -1)} of "${this.currentQuestion.word}"?`;
    
    // Hide word meaning initially - will show after answer
    this.meaningElement.style.display = 'none';
    
    // Hide answer explanation
    this.answerExplanation.classList.remove('show');
    
    this.optionsContainer.innerHTML = '';
    
    this.currentQuestion.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 'option';
      button.textContent = option;
      button.addEventListener('click', () => this.selectAnswer(index, this.currentQuestion));
      this.optionsContainer.appendChild(button);
    });
    
    this.updateProgress();
    this.hideActionButtons();
    this.hideSkipButton();
    this.showSkipButton();
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
    this.hideSkipButton();
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
    this.showRevisionButton();
    this.updateScore();
    this.updateProgressBar();
  }

  showActionButtons() {
    this.continueButton.style.display = 'inline-block';
    this.finishButton.style.display = 'inline-block';
    this.hideSkipButton();
  }

  hideActionButtons() {
    this.continueButton.style.display = 'none';
    this.finishButton.style.display = 'none';
    this.hideRevisionButton();
  }

  skipQuestion() {
    if (this.isAnswered || !this.currentQuestion) return; // Can't skip if already answered or no question loaded
    
    // Mark as answered and increment skip count
    this.isAnswered = true;
    this.skippedCount++;
    this.streak = 0; // Reset streak on skip
    this.updateStreakCounter();
    
    // Show the correct answer when skipping
    const buttons = this.optionsContainer.querySelectorAll('.option');
    buttons[this.currentQuestion.correct].classList.add('correct');
    
    // Show explanation for skipped question
    const correctAnswer = this.currentQuestion.options[this.currentQuestion.correct];
    const answerMeaning = document.getElementById('answer-meaning');
    answerMeaning.textContent = this.getAnswerExplanation(this.currentQuestion, correctAnswer);
    
    if (this.currentQuizType === 'antonyms') {
      this.meaningElement.textContent = `"${this.currentQuestion.word}" means: ${this.currentQuestion.meaning}`;
    } else {
      this.meaningElement.textContent = `Word meaning: ${this.currentQuestion.meaning}`;
    }
    
    this.answerExplanation.classList.add('show');
    this.meaningElement.style.display = 'block';
    
    // Record as a mistake for review (since it was skipped)
    this.mistakes.push({
      question: this.currentQuestion.word,
      meaning: this.currentQuestion.meaning,
      yourAnswer: "Skipped",
      correctAnswer: this.currentQuestion.options[this.currentQuestion.correct],
      type: this.currentQuizType,
      skipped: true
    });
    
    buttons.forEach(btn => btn.classList.add('disabled'));
    this.stopTimer();
    this.showActionButtons();
    this.showRevisionButton();
    this.hideSkipButton();
    this.updateProgressBar();
  }

  getCurrentQuestion() {
    // Find the current question that hasn't been answered yet
    const availableQuestions = this.randomizedQuizData[this.currentQuizType].filter(
      (_, index) => !this.answeredQuestions.includes(index)
    );
    
    if (availableQuestions.length === 0) return null;
    
    // Return the first available question (the one currently being displayed)
    return availableQuestions[0];
  }

  showRevisionButton() {
    if (this.reviseButton) {
      this.reviseButton.style.display = 'inline-block';
    }
  }

  hideRevisionButton() {
    if (this.reviseButton) {
      this.reviseButton.style.display = 'none';
    }
  }

  addToRevision() {
    if (!this.currentQuestion) return;
    
    // Check if word is already in revision list
    const exists = this.revisionList.find(item => 
      item.word === this.currentQuestion.word && item.type === this.currentQuizType
    );
    
    if (!exists) {
      this.revisionList.push({
        word: this.currentQuestion.word,
        meaning: this.currentQuestion.meaning,
        correctAnswer: this.currentQuestion.options[this.currentQuestion.correct],
        type: this.currentQuizType,
        addedAt: new Date().toLocaleString()
      });
      
      // Save to localStorage
      this.saveRevisionList();
      
      // Show notification
      this.showNotification('📝 Added to revision list!', 'success');
      
      // Update button text temporarily
      this.reviseButton.innerHTML = '<span class="icon">✅</span><span>Added!</span>';
      setTimeout(() => {
        this.reviseButton.innerHTML = '<span class="icon">📝</span><span>Add to Revise</span>';
      }, 2000);
    } else {
      this.showNotification('📝 Already in revision list', 'warning');
    }
  }

  showSkipButton() {
    if (this.skipButton) {
      this.skipButton.style.display = 'inline-block';
    }
  }

  hideSkipButton() {
    if (this.skipButton) {
      this.skipButton.style.display = 'none';
    }
  }

  showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.quiz-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `quiz-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide and remove notification
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showRevisionMode() {
    this.welcomeScreen.style.display = 'none';
    this.quizScreen.style.display = 'none';
    this.resultsScreen.style.display = 'none';
    this.reviewScreen.style.display = 'none';
    this.studyScreen.style.display = 'none';
    this.revisionScreen.style.display = 'block';
    
    this.revisionScreen.classList.add('show');
    this.welcomeScreen.classList.remove('show');
    
    this.displayRevisionList();
  }

  displayRevisionList() {
    const revisionWords = document.getElementById('revision-words');
    const revisionListCount = document.getElementById('revision-list-count');
    const clearButton = document.getElementById('clear-revision');
    
    if (this.revisionList.length === 0) {
      revisionWords.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>No words in revision list</h3>
          <p>When taking quizzes, use the "Add to Revise" button to save words for later review.</p>
        </div>
      `;
      revisionListCount.textContent = 'No words added yet';
      clearButton.style.display = 'none';
    } else {
      revisionWords.innerHTML = '';
      this.revisionList.forEach((item, index) => {
        const revisionItem = document.createElement('div');
        revisionItem.className = 'study-item revision-item';
        revisionItem.innerHTML = `
          <div class="study-type-badge ${item.type.slice(0, -1)}">${item.type.slice(0, -1)}</div>
          <div class="study-word">${item.word}</div>
          <div class="study-meaning">${item.meaning}</div>
          <div class="study-answer">Correct Answer: ${item.correctAnswer}</div>
          <div class="study-answer-meaning">Added: ${item.addedAt}</div>
          <button class="btn btn-outline btn-small remove-revision" data-index="${index}">
            <span class="icon">🗑️</span>
            <span>Remove</span>
          </button>
        `;
        revisionWords.appendChild(revisionItem);
      });
      
      // Add event listeners for remove buttons
      document.querySelectorAll('.remove-revision').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.currentTarget.dataset.index);
          this.removeFromRevision(index);
        });
      });
      
      revisionListCount.textContent = `${this.revisionList.length} word${this.revisionList.length !== 1 ? 's' : ''}`;
      clearButton.style.display = 'inline-block';
    }
  }

  removeFromRevision(index) {
    this.revisionList.splice(index, 1);
    this.saveRevisionList(); // Save to localStorage
    this.displayRevisionList();
    this.showNotification('📝 Word removed from revision list', 'success');
  }

  clearRevisionList() {
    if (this.revisionList.length === 0) return;
    
    if (confirm('Are you sure you want to clear all words from the revision list?')) {
      this.revisionList = [];
      this.saveRevisionList(); // Save to localStorage
      this.displayRevisionList();
      this.showNotification('📝 Revision list cleared', 'success');
    }
  }

  updateRevisionCount() {
    const revisionCountElement = document.getElementById('revision-count');
    if (revisionCountElement) {
      const count = this.revisionList.length;
      revisionCountElement.textContent = `${count} word${count !== 1 ? 's' : ''}`;
    }
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    
    // Check if we've gone through all questions
    if (this.answeredQuestions.length >= this.randomizedQuizData[this.currentQuizType].length) {
      // All questions have been answered, show results
      this.showResults();
      return;
    }
    
    this.loadQuestion();
  }

  updateProgress() {
    const questionsAnswered = this.currentQuestionIndex + 1;
    const totalQuestions = this.randomizedQuizData[this.currentQuizType].length;
    this.progressElement.textContent = `Question ${questionsAnswered} of ${totalQuestions}`;
  }

  updateProgressBar() {
    // Update progress bar based on questions answered vs total questions
    const questionsAnswered = this.currentQuestionIndex + 1;
    const totalQuestions = this.randomizedQuizData[this.currentQuizType].length;
    const progressPercentage = (questionsAnswered / totalQuestions) * 100;
    
    if (this.progressBar) {
      this.progressBar.style.width = `${progressPercentage}%`;
    }
  }

  updateScore() {
    const questionsAnswered = this.currentQuestionIndex + 1;
    const skippedInfo = this.skippedCount > 0 ? ` (${this.skippedCount} skipped)` : '';
    this.scoreElement.textContent = `Score: ${this.score}/${questionsAnswered}${skippedInfo}`;
    
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
    const totalQuestions = this.randomizedQuizData[this.currentQuizType].length;
    const percentage = Math.round((this.score / questionsAnswered) * 100);
    const completedAll = questionsAnswered >= totalQuestions;
    
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
    
    // Add skip information if any questions were skipped
    const skipInfo = document.getElementById('skip-info');
    if (skipInfo) {
      if (this.skippedCount > 0) {
        skipInfo.textContent = `(${this.skippedCount} skipped)`;
        skipInfo.style.display = 'inline';
      } else {
        skipInfo.style.display = 'none';
      }
    }
    
    // Dynamic result message based on performance and completion
    const resultMessage = document.getElementById('result-message');
    let message = '';
    
    if (completedAll) {
      message = `🎉 Quiz Complete! You answered all ${totalQuestions} questions!`;
    } else if (percentage >= 90) {
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

  // Study Mode Functionality
  showStudyMode() {
    this.welcomeScreen.style.display = 'none';
    this.quizScreen.style.display = 'none';
    this.resultsScreen.style.display = 'none';
    this.reviewScreen.style.display = 'none';
    this.studyScreen.style.display = 'block';
    
    this.studyScreen.classList.add('show');
    this.welcomeScreen.classList.remove('show');
    
    // Initialize study mode with antonyms
    this.currentStudyType = 'antonyms';
    this.isAlphabetical = false;
    this.currentFilter = '';
    
    this.showStudyType('antonyms');
  }

  showStudyType(type) {
    this.currentStudyType = type;
    
    // Update button states
    const antonymBtn = document.getElementById('show-antonyms');
    const synonymBtn = document.getElementById('show-synonyms');
    
    if (type === 'antonyms') {
      antonymBtn.classList.add('active');
      antonymBtn.classList.remove('btn-secondary');
      antonymBtn.classList.add('btn-primary');
      synonymBtn.classList.remove('active');
      synonymBtn.classList.remove('btn-primary');
      synonymBtn.classList.add('btn-secondary');
    } else {
      synonymBtn.classList.add('active');
      synonymBtn.classList.remove('btn-secondary');
      synonymBtn.classList.add('btn-primary');
      antonymBtn.classList.remove('active');
      antonymBtn.classList.remove('btn-primary');
      antonymBtn.classList.add('btn-secondary');
    }
    
    this.renderStudyList();
  }

  renderStudyList() {
    const studyList = document.getElementById('study-list');
    const studyCount = document.getElementById('study-count');
    let words = [...this.randomizedQuizData[this.currentStudyType]];
    
    // Apply search filter
    if (this.currentFilter) {
      words = words.filter(item => 
        item.word.toLowerCase().includes(this.currentFilter.toLowerCase()) ||
        item.options[item.correct].toLowerCase().includes(this.currentFilter.toLowerCase())
      );
    }
    
    // Apply sorting
    if (this.isAlphabetical) {
      words.sort((a, b) => a.word.localeCompare(b.word));
    }
    
    // Update count
    const totalWords = this.randomizedQuizData[this.currentStudyType].length;
    studyCount.textContent = this.currentFilter 
      ? `Showing ${words.length} of ${totalWords} words`
      : `Showing ${totalWords} words`;
    
    // Render items
    studyList.innerHTML = '';
    words.forEach(item => {
      const studyItem = document.createElement('div');
      studyItem.className = 'study-item';
      
      const correctAnswer = item.options[item.correct];
      const answerMeaning = this.getAntonymMeaning(correctAnswer);
      
      studyItem.innerHTML = `
        <div class="study-type-badge ${this.currentStudyType === 'antonyms' ? 'antonym' : 'synonym'}">
          ${this.currentStudyType === 'antonyms' ? 'Antonym' : 'Synonym'}
        </div>
        <div class="study-word">${item.word}</div>
        <div class="study-meaning">"${item.meaning}"</div>
        <div class="study-answer">
          ${this.currentStudyType === 'antonyms' ? '↔️' : '↗️'} ${correctAnswer}
        </div>
        <div class="study-answer-meaning">
          ${this.currentStudyType === 'antonyms' ? answerMeaning : `Similar meaning: ${item.meaning}`}
        </div>
      `;
      
      studyList.appendChild(studyItem);
    });
  }

  getAntonymMeaning(word) {
    // Use the same antonym meanings database from getAnswerExplanation
    const antonymMeanings = {
      'abundance': 'a very large quantity of something',
      'active': 'engaging in physical or mental activity',
      'admire': 'to regard with respect and approval',
      'aggravate': 'to make a problem or situation worse',
      'agitation': 'a state of anxiety or nervous excitement',
      'alleviate': 'to make suffering or difficulty less severe',
      'apathetic': 'showing no interest or enthusiasm',
      'beneficial': 'favorable or advantageous; resulting in good',
      'benevolent': 'well-meaning and kindly',
      'calm': 'not showing excitement, nervousness, or anger',
      'careless': 'not giving sufficient attention or thought',
      'cautious': 'careful to avoid potential problems or dangers',
      'changeable': 'liable to change; unpredictable',
      'cheerful': 'noticeably happy and optimistic',
      'clear': 'easy to perceive, understand, or interpret',
      'common': 'occurring frequently; ordinary',
      'competent': 'having the necessary ability or knowledge',
      'confusing': 'difficult to understand; unclear',
      'consistent': 'acting in the same way over time',
      'convict': 'to declare guilty of a criminal offense',
      'cowardly': 'lacking courage; showing fear',
      'definite': 'clearly stated or decided; not vague',
      'depressed': 'feeling very unhappy and hopeless',
      'disagree': 'to have a different opinion',
      'dislike': 'to feel distaste for something',
      'disrespect': 'lack of respect or courtesy',
      'easy': 'requiring little effort; simple',
      'enduring': 'lasting; continuing for a long time',
      'energetic': 'showing great activity or vitality',
      'energize': 'to give vitality and enthusiasm to',
      'enthusiastic': 'showing intense excitement and interest',
      'excellent': 'extremely good; outstanding',
      'exciting': 'causing great enthusiasm and eagerness',
      'extraordinary': 'very unusual or remarkable',
      'fallible': 'capable of making mistakes',
      'famous': 'known about by many people',
      'fearful': 'feeling afraid; showing fear',
      'flexible': 'able to bend easily; adaptable',
      'generosity': 'the quality of being kind and generous',
      'harmful': 'causing or likely to cause harm',
      'harmless': 'not able or likely to cause harm',
      'harmony': 'agreement; peaceful coexistence',
      'hidden': 'kept out of sight; concealed',
      'hinder': 'to obstruct or delay the progress of',
      'honesty': 'the quality of being honest and truthful',
      'humble': 'having a modest opinion of one\'s importance',
      'inarticulate': 'unable to speak distinctly or express oneself clearly',
      'indulge': 'to allow oneself to enjoy the pleasure of something',
      'industrious': 'diligent and hardworking',
      'intensify': 'to become or make more intense',
      'intentional': 'done on purpose; deliberate',
      'introverted': 'shy and reticent; focused inward',
      'lazy': 'unwilling to work or use energy',
      'lengthiness': 'the quality of being long in time or extent',
      'luxurious': 'extremely comfortable, elegant, or enjoyable',
      'malevolent': 'having or showing a wish to do evil to others',
      'miserable': 'very unhappy or uncomfortable',
      'modern': 'relating to the present or recent times',
      'modest': 'unassuming in estimation of one\'s abilities',
      'moral': 'concerned with principles of right and wrong behavior',
      'narrow': 'having a small width in relation to length',
      'neglect': 'to fail to care for properly',
      'neutral': 'not supporting either side in a conflict',
      'normality': 'the condition of being normal',
      'obvious': 'easily perceived or understood; clear',
      'open': 'not closed or blocked; accessible',
      'oppose': 'to disagree with or resist',
      'original': 'present or existing from the beginning',
      'originality': 'the ability to think independently and creatively',
      'overlook': 'to fail to notice or consider',
      'permanent': 'lasting or intended to last indefinitely',
      'persuade': 'to cause someone to believe something through reasoning',
      'petty': 'of little importance; trivial',
      'praise': 'to express warm approval or admiration',
      'preserve': 'to maintain something in its original state',
      'provoke': 'to stimulate or give rise to a reaction',
      'reckless': 'without thinking or caring about consequences',
      'respect': 'a feeling of deep admiration',
      'respectful': 'showing deference and respect',
      'scarce': 'existing in small numbers; insufficient',
      'secure': 'fixed or fastened so as not to give way',
      'selfish': 'lacking consideration for others',
      'serious': 'demanding careful consideration or application',
      'seriousness': 'the quality of being serious or grave',
      'sloppy': 'careless and unsystematic; slovenly',
      'stubborn': 'having a determined refusal to change attitude',
      'subtle': 'so delicate as to be difficult to perceive',
      'success': 'the accomplishment of an aim or purpose',
      'taciturn': 'reserved or uncommunicative in speech',
      'thorough': 'complete with regard to every detail',
      'timid': 'showing a lack of courage or confidence',
      'truthful': 'telling or expressing the truth; honest',
      'unlikely': 'not likely to happen or be the case',
      'unproductive': 'not producing desired results',
      'unrepentant': 'showing no regret for one\'s wrongdoings',
      'vague': 'of uncertain, indefinite, or unclear character',
      'verbose': 'using more words than necessary',
      'virtuous': 'having high moral standards',
      'wordy': 'using or expressed in too many words',
      'worsen': 'to become or make worse',
      'yielding': 'giving way under pressure; flexible'
    };
    
    return antonymMeanings[word] || 'opposite meaning';
  }

  toggleAlphabeticalSort() {
    this.isAlphabetical = !this.isAlphabetical;
    const sortBtn = document.getElementById('toggle-alphabetical');
    sortBtn.textContent = this.isAlphabetical ? 'Sort Random' : 'Sort A-Z';
    this.renderStudyList();
  }

  filterStudyWords(query) {
    this.currentFilter = query.trim();
    this.renderStudyList();
  }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new QuizApp();
});
