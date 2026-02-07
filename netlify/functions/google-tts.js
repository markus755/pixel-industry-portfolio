const textToSpeech = require('@google-cloud/text-to-speech');

// Netlify holt sich hier deinen JSON-Schlüssel aus dem "Tresor"
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
const client = new textToSpeech.TextToSpeechClient({ credentials });

exports.handler = async (event) => {
  // Wir erlauben nur POST-Anfragen (Sicherheits-Check)
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { text } = JSON.parse(event.body);

    const request = {
      input: { text: text },
      // Wir nutzen eine hochwertige Neural2-Stimme für beste UX
      voice: { 
        languageCode: 'de-DE', 
        name: 'de-DE-Neural2-B' // Professionelle männliche Stimme
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        pitch: 0,
        speakingRate: 1.0 
      },
    };

    // Die Anfrage an die Google Cloud senden
    const [response] = await client.synthesizeSpeech(request);
    
    // Das Audio als Base64-String zurückgeben
    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*" // Erlaubt den Aufruf von deiner URL
      },
      body: response.audioContent.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error("Fehler in der Function:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Google konnte das Audio nicht erstellen." }) 
    };
  }
};