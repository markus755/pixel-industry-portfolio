// Diese Funktion wird aufgerufen, wenn jemand auf "Vorlesen" klickt
async function starteVorlesen(meinText) {
    const button = document.getElementById('vorlesen-btn');
    
    // Kleiner UX-Kniff: Button sperren, damit man nicht 10-mal klickt
    button.disabled = true;
    button.innerText = "Lade Stimme...";

    try {
        // Wir rufen deine Netlify-Brücke auf
        const antwort = await fetch('/.netlify/functions/google-tts', {
            method: 'POST',
            body: JSON.stringify({ text: meinText })
        });

        // Wir machen aus der Antwort eine Audio-Datei
        const audioDaten = await antwort.blob();
        const audioUrl = URL.createObjectURL(audioDaten);
        const meinAudio = new Audio(audioUrl);

        // Wenn die Stimme fertig ist, Button wieder freigeben
        meinAudio.onended = () => {
            button.disabled = false;
            button.innerText = "Text vorlesen";
        };

        meinAudio.play();
    } catch (fehler) {
        console.error("Da hat was nicht geklappt:", fehler);
        button.disabled = false;
        button.innerText = "Fehler - nochmal?";
    }
}