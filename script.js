// script.js

// variables para el estado del juego
let playerName = '';            // almacena el nombre del jugador
let cardCount = 8;              // define el número de cartas en el juego
let cardIcons = [];             // guarda los iconos de las cartas para la partida actual
let firstCard = null;           // almacena la primera carta seleccionada
let secondCard = null;          // almacena la segunda carta seleccionada
let attempts = 0;               // cuenta los intentos realizados por el jugador
let pairsFound = 0;             // cuenta los pares encontrados por el jugador
let isFlipping = false;         // indica si las cartas están siendo volteadas para evitar clics adicionales
let timerInterval = null;       // referencia al temporizador del juego
let startTime = null;           // guarda el tiempo de inicio del juego

// lista de iconos para las cartas
const icons = ['🍎', '🍌', '🍓', '🍇', '🍒', '🍉', '🍍', '🥝', '🥥', '🍋', '🍑', '🍊', '🥭', '🍈', '🍆', '🍄', '🌽', '🥕', '🍪', '🥨', '🍿', '🍫', '🍩', '🥐', '🧁'];

// selecciona elementos del DOM para actualizar la interfaz del usuario
const gameTitle = document.getElementById('game-title');          // título del juego
const gameBoard = document.getElementById('game-board');          // contenedor del tablero de juego
const attemptsCounter = document.getElementById('attempts-counter'); // contador de intentos
const pairsCounter = document.getElementById('pairs-counter');    // contador de pares encontrados
const timerDisplay = document.getElementById('timer');            // muestra del temporizador
const resetButton = document.getElementById('reset-button');      // botón de reinicio del juego

// función para iniciar el juego
function startGame()
{
    // establece el nombre del jugador y la cantidad de cartas de entrada
    playerName = document.getElementById('player-name').value || 'Jugador';
    cardCount = parseInt(document.getElementById('card-count').value);

    // cambia el título del juego para incluir el nombre del jugador
    gameTitle.textContent = `Nueva partida de ${playerName}`;
    
    // selecciona y mezcla los iconos de las cartas, duplicando el conjunto para formar pares
    cardIcons = shuffle([...icons.slice(0, cardCount / 2), ...icons.slice(0, cardCount / 2)]);
    
    // llama a initializeBoard para configurar el tablero de juego
    initializeBoard();
    
    // reinicia los contadores y actualiza la interfaz
    attempts = 0;
    pairsFound = 0;
    attemptsCounter.textContent = attempts;
    pairsCounter.textContent = pairsFound;

    // inicia el temporizador de juego
    startTimer();

    // oculta la pantalla de inicio y muestra el tablero de juego
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
}

// función para inicializar el tablero
function initializeBoard()
{
    // limpia el contenido del tablero
    gameBoard.innerHTML = '';

    // define las columnas y filas según el número de cartas
    let columns, rows;
    if (cardCount === 8) 
    {
        columns = 4;
        rows = 2;
    } 
    else if (cardCount === 16) 
    {
        columns = 4;
        rows = 4;
    } 
    else if (cardCount === 24) 
    {
        columns = 6;
        rows = 4;
    } 
    else if (cardCount === 36) 
    {
        columns = 6;
        rows = 6;
    } 
    else if (cardCount === 48) 
    {
        columns = 8;
        rows = 6;
    } 
    else 
    {
        // ajusta columnas y filas si no se corresponde con una configuración predefinida
        columns = Math.ceil(Math.sqrt(cardCount));
        rows = Math.floor(cardCount / columns);
        if (columns * rows < cardCount) 
        {
            rows += 1;
        }
    }

    // define la cuadrícula en CSS para el tablero de juego
    gameBoard.style.gridTemplateColumns = `repeat(${columns}, 100px)`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 100px)`;

    // crea cada carta y la añade al tablero
    cardIcons.forEach((icon, index) =>
    {
        const card = document.createElement('div');
        card.classList.add('card');   // añade la clase "card"
        card.dataset.icon = icon;     // almacena el icono en un dataset
        card.dataset.index = index;   // almacena el índice en un dataset

        // añade evento para voltear la carta al hacer clic
        card.addEventListener('click', flipCard);
        
        // añade la carta al tablero
        gameBoard.appendChild(card);
    });
}

// función para mezclar las cartas usando el algoritmo Fisher-Yates
function shuffle(array)
{
    for (let i = array.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));  // elige un índice aleatorio
        [array[i], array[j]] = [array[j], array[i]];    // intercambia los elementos
    }
    return array;  // devuelve el array mezclado
}

// función para voltear las cartas
function flipCard(event)
{
    const clickedCard = event.target;

    // verifica si la carta ya está volteada o si hay un volteo en proceso
    if (clickedCard.classList.contains('flipped') || isFlipping) return;

    // voltea la carta y muestra su icono
    clickedCard.classList.add('flipped');
    clickedCard.textContent = clickedCard.dataset.icon;

    if (!firstCard)
    {
        // guarda la primera carta seleccionada
        firstCard = clickedCard;
    } 
    else
    {
        // guarda la segunda carta y verifica coincidencia
        secondCard = clickedCard;
        isFlipping = true;  // indica que hay un proceso de volteo activo
        attempts++;         // incrementa el número de intentos
        attemptsCounter.textContent = attempts;  // actualiza la interfaz

        // llama a checkForMatch para verificar si coinciden las cartas seleccionadas
        checkForMatch();
    }
}

// función para verificar si coinciden las cartas seleccionadas
function checkForMatch()
{
    if (firstCard.dataset.icon === secondCard.dataset.icon)
    {
        // si coinciden, oculta las cartas y actualiza el contador de pares
        firstCard.classList.add('hidden');
        secondCard.classList.add('hidden');
        pairsFound++;
        pairsCounter.textContent = pairsFound;  // actualiza la interfaz

        // oculta visualmente las cartas después de 1 segundo
        setTimeout(() =>
        {
            firstCard.style.visibility = 'hidden';
            secondCard.style.visibility = 'hidden';
            resetCards();  // llama a resetCards para preparar la siguiente ronda
        }, 1000);

        // verifica si se han encontrado todos los pares
        if (pairsFound === cardCount / 2)
        {
            endGame();  // finaliza el juego si todos los pares han sido encontrados
        }
    } 
    else 
    {
        // si no coinciden, voltea las cartas nuevamente después de 1 segundo
        setTimeout(() =>
        {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            firstCard.textContent = '';
            secondCard.textContent = '';
            resetCards();  // llama a resetCards para preparar la siguiente ronda
        }, 1000);
    }
}

// función para reiniciar las variables de las cartas seleccionadas
function resetCards()
{
    firstCard = null;
    secondCard = null;
    isFlipping = false;  // indica que el proceso de volteo ha terminado
}

// función para iniciar el temporizador
function startTimer()
{
    startTime = Date.now();  // almacena el tiempo de inicio
    timerInterval = setInterval(() =>
    {
        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / 60000).toString().padStart(2, '0');
        const seconds = ((elapsedTime % 60000) / 1000).toFixed(0).toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;  // actualiza el temporizador en pantalla
    }, 1000);
}

// función para finalizar el juego
function endGame()
{
    clearInterval(timerInterval);  // detiene el temporizador
    setTimeout(() =>
    {
        alert(`¡Ganaste, ${playerName}! Intentos: ${attempts}. Pares encontrados: ${pairsFound}. Tiempo: ${timerDisplay.textContent}`);
    }, 500);  // muestra un mensaje con los resultados de la partida
}

// función para reiniciar el juego y volver a la pantalla de inicio
function resetGame()
{
    clearInterval(timerInterval);    // detiene el temporizador
    attempts = 0;
    pairsFound = 0;
    attemptsCounter.textContent = attempts;
    pairsCounter.textContent = pairsFound;

    timerDisplay.textContent = '00:00';  // reinicia el temporizador en pantalla
    startTimer();                       // reinicia el temporizador
    initializeBoard();                  // vuelve a generar el tablero
}

// conecta el botón de reinicio para reiniciar el juego
resetButton.addEventListener('click', resetGame);

// selecciona el botón de nueva partida
const newGameButton = document.getElementById('new-game-button');

// función para regresar a la pantalla de inicio
function goToStartScreen()
{
    clearInterval(timerInterval);   // detiene el temporizador
    attempts = 0;
    pairsFound = 0;
    attemptsCounter.textContent = attempts;
    pairsCounter.textContent = pairsFound;
    timerDisplay.textContent = '00:00';

    document.getElementById('game-screen').style.display = 'none';  // oculta la pantalla de juego
    document.getElementById('start-screen').style.display = 'flex'; // muestra la pantalla de inicio
    gameBoard.innerHTML = '';  // limpia el tablero
}

// conecta el evento de clic en "Nueva partida" para ir a la pantalla de inicio
newGameButton.addEventListener('click', goToStartScreen);

// conecta el botón de inicio para comenzar el juego
document.getElementById('start-button').addEventListener('click', startGame);
