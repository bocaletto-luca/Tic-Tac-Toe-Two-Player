/*
  Tris (Tic Tac Toe) - Gioco 2 Player
  Questo script gestisce la logica del gioco Tris utilizzando un canvas per disegnare la griglia 3x3.
  Alla fine di ogni partita il record (data/ora, nomi, risultato) viene inviato in POST a save.php,
  che aggiorna il file record.json sul server. Lo storico verrà poi visualizzato nella modale "Mostra Storico".
*/

// COSTANTI E VARIABILI DI GIOCO
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 3; // Griglia 3x3
const cellSize = canvas.width / gridSize; // Dimensione di ogni cella

let board = [];         // Matrice 3x3 che rappresenta il tabellone (0 = vuoto, 1 = Giocatore 1, 2 = Giocatore 2)
let currentPlayer = 1;  // 1 = Giocatore 1 (simbolo "X"), 2 = Giocatore 2 (simbolo "O")
let gameOver = false;
let winner = null;
let player1Name = "Giocatore 1";
let player2Name = "Giocatore 2";

// Inizializza la griglia del Tris
function initBoard() {
  player1Name = document.getElementById("inputPlayer1").value.trim() || "Giocatore 1";
  player2Name = document.getElementById("inputPlayer2").value.trim() || "Giocatore 2";
  board = [];
  for (let i = 0; i < gridSize; i++) {
    board[i] = [];
    for (let j = 0; j < gridSize; j++) {
      board[i][j] = 0; // 0 indica cella vuota
    }
  }
  currentPlayer = 1;
  gameOver = false;
  winner = null;
  drawBoard();
}

// Disegna la griglia del Tris e, se presenti, i simboli nelle celle
function drawBoard() {
  // Pulisce il canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Disegna la griglia: linee verticali e orizzontali
  ctx.strokeStyle = "#023e8a";
  ctx.lineWidth = 4;
  
  // Linee verticali
  for (let i = 1; i < gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, canvas.height);
    ctx.stroke();
  }
  // Linee orizzontali
  for (let i = 1; i < gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvas.width, i * cellSize);
    ctx.stroke();
  }
  
  // Disegna i simboli nelle celle: "X" per Giocatore 1, "O" per Giocatore 2
  ctx.font = `${cellSize * 0.8}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let cellValue = board[i][j];
      if (cellValue === 1) {
        ctx.fillStyle = "red";
        ctx.fillText("X", j * cellSize + cellSize / 2, i * cellSize + cellSize / 2);
      } else if (cellValue === 2) {
        ctx.fillStyle = "blue";
        ctx.fillText("O", j * cellSize + cellSize / 2, i * cellSize + cellSize / 2);
      }
    }
  }
}

// Determina la cella cliccata in base alle coordinate del mouse
function getCellFromCoordinates(x, y) {
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  return { row, col };
}

// Gestione del click sul canvas per piazzare il simbolo
canvas.addEventListener("click", function(event) {
  if (gameOver) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const { row, col } = getCellFromCoordinates(x, y);
  
  if (board[row][col] === 0) { // Se la cella è vuota
    board[row][col] = currentPlayer;
    drawBoard();
    
    // Controlla se questa mossa porta alla vittoria
    if (checkWin(currentPlayer)) {
      gameOver = true;
      winner = currentPlayer;
      let winName = (currentPlayer === 1 ? player1Name : player2Name);
      sendRecord(winName);
      setTimeout(() => alert(`Ha vinto ${winName}!`), 100);
    }
    // Se la griglia è piena e non c'è vincitore → pareggio
    else if (isBoardFull()) {
      gameOver = true;
      winner = 0;
      sendRecord("Pareggio");
      setTimeout(() => alert("Partita finita in pareggio!"), 100);
    }
    else {
      // Alterna il turno
      currentPlayer = (currentPlayer === 1) ? 2 : 1;
    }
  }
});

// Controlla se il giocatore (simbolo) ha vinto
function checkWin(player) {
  // Controllo righe, colonne, diagonale principale e secondaria
  for (let i = 0; i < gridSize; i++) {
    // Controlla riga i
    if (board[i][0] === player && board[i][1] === player && board[i][2] === player) {
      return true;
    }
    // Controlla colonna i
    if (board[0][i] === player && board[1][i] === player && board[2][i] === player) {
      return true;
    }
  }
  // Diagonale principale
  if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
    return true;
  }
  // Diagonale secondaria
  if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
    return true;
  }
  return false;
}

// Ritorna true se non ci sono celle vuote (la griglia è piena)
function isBoardFull() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (board[i][j] === 0) return false;
    }
  }
  return true;
}

/* GESTIONE DEI RECORD (COMUNICAZIONE CON PHP) */

// Al termine della partita, crea un record e lo invia via POST a save.php
function sendRecord(result) {
  const date = new Date().toLocaleString("it-IT", { hour12: false });
  const newRecord = {
    date: date,
    player1: player1Name,
    player2: player2Name,
    result: result
  };
  
  fetch("save.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newRecord)
  })
  .then(response => response.json())
  .then(data => console.log("Record salvato:", data))
  .catch(err => console.error("Errore nel salvataggio del record:", err));
}

/* VISUALIZZAZIONE DELLO STORICO */

// Recupera lo storico dal server e lo mostra in una tabella nella modale
function showHistory() {
  fetch("save.php")
  .then(response => response.json())
  .then(records => {
    const historyContent = document.getElementById("historyContent");
    historyContent.innerHTML = "";
    if (records.length === 0) {
      historyContent.innerHTML = "<p>Nessun record salvato.</p>";
      return;
    }
    const table = document.createElement("table");
    table.id = "historyTable";
    
    const header = document.createElement("tr");
    ["Data/Ora", "Giocatore 1", "Giocatore 2", "Risultato"].forEach(text => {
      const th = document.createElement("th");
      th.textContent = text;
      header.appendChild(th);
    });
    table.appendChild(header);
    
    records.forEach(record => {
      const row = document.createElement("tr");
      const tdDate = document.createElement("td");
      tdDate.textContent = record.date;
      const tdPlayer1 = document.createElement("td");
      tdPlayer1.textContent = record.player1;
      const tdPlayer2 = document.createElement("td");
      tdPlayer2.textContent = record.player2;
      const tdResult = document.createElement("td");
      tdResult.textContent = record.result;
      
      row.appendChild(tdDate);
      row.appendChild(tdPlayer1);
      row.appendChild(tdPlayer2);
      row.appendChild(tdResult);
      table.appendChild(row);
    });
    historyContent.appendChild(table);
  })
  .catch(err => console.error("Errore nel recupero dello storico:", err));
}

/* GESTIONE DEI BOTTONI E MODALI */

// Avvia la partita: mostra il canvas, i controlli e inizializza il tabellone
document.getElementById("btnSetNames").addEventListener("click", function() {
  canvas.style.display = "block";
  document.getElementById("controls").style.display = "block";
  initBoard();
});

// Bottone "Nuova Partita": re-inizializza il tabellone
document.getElementById("btnReset").addEventListener("click", function() {
  initBoard();
});

// Bottone "Help": mostra la modale con le istruzioni
document.getElementById("btnHelp").addEventListener("click", function() {
  document.getElementById("helpModal").style.display = "block";
});

// Bottone "Mostra Storico": recupera lo storico e apre la modale
document.getElementById("btnHistory").addEventListener("click", function() {
  showHistory();
  document.getElementById("historyModal").style.display = "block";
});

// Chiusura delle modali al clic sulla "X" o fuori dal contenuto
document.getElementById("closeHelp").addEventListener("click", function() {
  document.getElementById("helpModal").style.display = "none";
});
document.getElementById("closeHistory").addEventListener("click", function() {
  document.getElementById("historyModal").style.display = "none";
});
window.addEventListener("click", function(event) {
  const helpModal = document.getElementById("helpModal");
  const historyModal = document.getElementById("historyModal");
  if (event.target === helpModal) helpModal.style.display = "none";
  if (event.target === historyModal) historyModal.style.display = "none";
});
