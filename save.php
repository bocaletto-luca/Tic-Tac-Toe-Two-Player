<?php
/**
 * save.php
 * 
 * Questo script gestisce il salvataggio dei record (lo storico delle vittorie)
 * in un file record.json nella root del server.
 * 
 * - Se viene ricevuta una richiesta GET, restituisce il contenuto del file record.json.
 * - Se viene ricevuta una richiesta POST, aggiunge il record ricevuto al file record.json.
 */

// Imposta l'intestazione per il JSON
header("Content-Type: application/json");

// Percorso del file record.json (nella stessa directory)
$filename = "record.json";

// Se il file non esiste, lo crea inizialmente con un array vuoto
if (!file_exists($filename)) {
    file_put_contents($filename, json_encode([]));
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    // Legge il contenuto del file e lo restituisce
    $data = file_get_contents($filename);
    echo $data;
    exit;
} elseif ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Riceve il JSON in input
    $input = file_get_contents("php://input");
    $newRecord = json_decode($input, true);
    if ($newRecord === null) {
        http_response_code(400);
        echo json_encode(["error" => "Input JSON non valido"]);
        exit;
    }
    
    // Legge i record esistenti dal file
    $records = json_decode(file_get_contents($filename), true);
    if (!is_array($records)) {
        $records = [];
    }
    
    // Aggiunge il nuovo record
    $records[] = $newRecord;
    
    // Scrive l'array aggiornato sul file in formato JSON formattato
    if (file_put_contents($filename, json_encode($records, JSON_PRETTY_PRINT)) === false) {
        http_response_code(500);
        echo json_encode(["error" => "Errore durante il salvataggio del file"]);
        exit;
    }
    
    echo json_encode(["success" => true]);
    exit;
} else {
    // Metodo non supportato
    http_response_code(405);
    echo json_encode(["error" => "Metodo non consentito"]);
    exit;
}
?>
