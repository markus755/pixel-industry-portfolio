/**
 * Audio Pre-Generation Build Script v2
 * Generiert MP3s und schreibt Dateinamen direkt in HTML
 * Kein Hash-Berechnen im Browser mehr nötig!
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { glob } = require('glob');
const textToSpeech = require('@google-cloud/text-to-speech');
const { JSDOM } = require('jsdom');

// Konfiguration
const PROJECTS_DIR = 'projects';
const AUDIO_DIR = 'audio';
const CREDENTIALS = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Google TTS Client
const client = new textToSpeech.TextToSpeechClient({ credentials: CREDENTIALS });

/**
 * Extrahiert Text aus HTML-Datei
 */
function extractTextFromHTML(filePath) {
    const html = fs.readFileSync(filePath, 'utf-8');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Prüfe ob Seite #project-detail hat
    const projectDetail = document.querySelector('#project-detail');
    if (!projectDetail) return null;
    
    let fullText = '';
    
    // Projekt-Headline
    const headline = document.querySelector('.project-header h1');
    if (headline) fullText += headline.textContent.trim() + '. ';
    
    // Challenge & Solution Spalten
    const columns = document.querySelectorAll('.project-column');
    columns.forEach(column => {
        const heading = column.querySelector('h2');
        if (heading) fullText += heading.textContent.trim() + '. ';
        
        const paragraphs = column.querySelectorAll('p');
        paragraphs.forEach(p => {
            fullText += p.textContent.trim() + ' ';
        });
    });
    
    return fullText.trim();
}

/**
 * Schreibt Audio-Dateinamen als data-Attribut in die HTML
 * <main id="project-detail" data-audio-file="crm_system-3a69b30d.mp3">
 */
function injectAudioReference(filePath, audioFileName) {
    let html = fs.readFileSync(filePath, 'utf-8');
    
    // Ersetze oder füge data-audio-file hinzu
    if (html.includes('data-audio-file=')) {
        // Bereits vorhanden → aktualisieren
        html = html.replace(/data-audio-file="[^"]*"/, `data-audio-file="${audioFileName}"`);
    } else {
        // Neu einfügen in <main id="project-detail">
        html = html.replace(
            /(<main[^>]*id="project-detail"[^>]*)>/,
            `$1 data-audio-file="${audioFileName}">`
        );
    }
    
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`📝 HTML aktualisiert: data-audio-file="${audioFileName}"`);
}

/**
 * Berechnet MD5 Hash
 */
function calculateHash(text) {
    return crypto.createHash('md5').update(text).digest('hex').substring(0, 8);
}

/**
 * Generiert Audio mit Google TTS
 */
async function generateAudio(text, outputPath) {
    console.log(`🎙️  Generiere Audio mit Studio-Q...`);
    
    const request = {
        input: { text: text },
        voice: { 
            languageCode: 'en-US', 
            name: 'en-US-Studio-Q'
        },
        audioConfig: { 
            audioEncoding: 'MP3',
            pitch: 0,
            speakingRate: 0.95
        },
    };
    
    try {
        const [response] = await client.synthesizeSpeech(request);
        fs.writeFileSync(outputPath, response.audioContent, 'binary');
        
        const fileSizeKB = Math.round(fs.statSync(outputPath).size / 1024);
        console.log(`✅ Audio generiert: ${path.basename(outputPath)} (${fileSizeKB} KB)`);
        return true;
    } catch (error) {
        console.error(`❌ Fehler:`, error.message);
        return false;
    }
}

/**
 * Löscht alte Audio-Dateien für eine Seite
 */
function cleanupOldAudio(fileName, currentHash) {
    if (!fs.existsSync(AUDIO_DIR)) return;
    
    const pattern = new RegExp(`^${fileName}-([a-f0-9]{8})\\.mp3$`);
    const files = fs.readdirSync(AUDIO_DIR);
    
    files.forEach(file => {
        const match = file.match(pattern);
        if (match && match[1] !== currentHash) {
            fs.unlinkSync(path.join(AUDIO_DIR, file));
            console.log(`🗑️  Gelöscht: ${file} (veraltet)`);
        }
    });
}

/**
 * Verarbeitet eine einzelne HTML-Datei
 */
async function processHTMLFile(filePath) {
    const fileName = path.basename(filePath, '.html');
    console.log(`\n📄 Verarbeite: ${fileName}.html`);
    
    // Text extrahieren
    const text = extractTextFromHTML(filePath);
    
    if (!text || text.length < 100) {
        console.log(`⏭️  Überspringe (kein Audio-Player oder Text zu kurz)`);
        return { processed: false };
    }
    
    // Hash berechnen
    const hash = calculateHash(text);
    const audioFileName = `${fileName}-${hash}.mp3`;
    const audioPath = path.join(AUDIO_DIR, audioFileName);
    
    // WICHTIG: Immer data-audio-file in HTML schreiben
    // (auch wenn MP3 bereits existiert!)
    injectAudioReference(filePath, audioFileName);
    
    // Prüfe ob Audio bereits existiert
    if (fs.existsSync(audioPath)) {
        console.log(`✅ Audio existiert bereits: ${audioFileName}`);
        return { 
            processed: true, 
            cached: true,
            audioFile: audioFileName,
            hash: hash
        };
    }
    
    // Generiere neues Audio
    console.log(`🔨 Text-Hash: ${hash}`);
    console.log(`📝 Text-Länge: ${text.length} Zeichen`);
    
    const success = await generateAudio(text, audioPath);
    
    if (success) {
        cleanupOldAudio(fileName, hash);
        return { 
            processed: true, 
            cached: false,
            audioFile: audioFileName,
            hash: hash,
            textLength: text.length
        };
    } else {
        return { processed: false, error: true };
    }
}

/**
 * Hauptfunktion
 */
async function main() {
    console.log('🚀 Audio Pre-Generation Build Script v2');
    console.log('========================================\n');
    
    if (!fs.existsSync(AUDIO_DIR)) {
        fs.mkdirSync(AUDIO_DIR, { recursive: true });
        console.log(`📁 Audio-Verzeichnis erstellt: ${AUDIO_DIR}\n`);
    }
    
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.error('❌ FEHLER: GOOGLE_APPLICATION_CREDENTIALS_JSON nicht gesetzt!');
        process.exit(1);
    }
    
    const htmlFiles = glob.sync(`${PROJECTS_DIR}/*.html`);
    
    if (htmlFiles.length === 0) {
        console.log('⚠️  Keine HTML-Dateien in projects/ gefunden');
        return;
    }
    
    console.log(`📋 Gefundene Dateien: ${htmlFiles.length}\n`);
    
    const stats = {
        total: htmlFiles.length,
        processed: 0,
        cached: 0,
        generated: 0,
        skipped: 0,
        errors: 0
    };
    
    for (const filePath of htmlFiles) {
        const result = await processHTMLFile(filePath);
        
        if (result.processed) {
            stats.processed++;
            result.cached ? stats.cached++ : stats.generated++;
        } else if (result.error) {
            stats.errors++;
        } else {
            stats.skipped++;
        }
    }
    
    console.log('\n========================================');
    console.log('📊 Build-Statistik:');
    console.log(`   Gesamt: ${stats.total} Dateien`);
    console.log(`   Verarbeitet: ${stats.processed}`);
    console.log(`   - Aus Cache: ${stats.cached}`);
    console.log(`   - Neu generiert: ${stats.generated}`);
    console.log(`   Übersprungen: ${stats.skipped}`);
    if (stats.errors > 0) console.log(`   ❌ Fehler: ${stats.errors}`);
    console.log('\n✅ Build abgeschlossen!\n');
    
    if (stats.errors > 0) process.exit(1);
}

main().catch(error => {
    console.error('\n❌ KRITISCHER FEHLER:', error);
    process.exit(1);
});