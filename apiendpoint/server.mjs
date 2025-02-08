import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';
import fetch from 'node-fetch';
import { MongoClient, ObjectId } from 'mongodb';




// Recreate __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the ffmpeg and ffprobe binary paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer to store uploaded files on disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        // Prepend a timestamp to avoid collisions
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage });

// --- MongoDB Setup ---
const MONGODB_URI = "mongodb+srv://manusmriti31:ygdpUK8W7SQqXNnO@meetai.31uzo.mongodb.net/?retryWrites=true&w=majority&appName=MeetAI";
const DATABASE_NAME = "MeetAI";
const COLLECTION_NAME = "meetings";

const client = new MongoClient(MONGODB_URI);
await client.connect();
console.log("Connected to MongoDB");
const db = client.db(DATABASE_NAME);
const meetingsCollection = db.collection(COLLECTION_NAME);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Endpoint: POST /transcribe/:meetingId
// Expects a URL parameter for the meeting MongoDB id and an audio file (multipart/form-data).
app.post('/transcribe/:meetingId', upload.single('audio'), async (req, res) => {
    const meetingId = req.params.meetingId;
    if (!meetingId) {
        return res.status(400).json({ error: 'No meeting id provided.' });
    }
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided.' });
    }

    const filePath = req.file.path;
    console.log(`Received file: ${req.file.originalname} for meeting ${meetingId}`);

    try {
        // Get file metadata (e.g. duration) using ffprobe
        const metadata = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });

        const durationSeconds = metadata.format.duration;
        console.log(`File duration: ${durationSeconds} seconds`);

        const chunkDuration = 30; // seconds per chunk
        const numChunks = Math.ceil(durationSeconds / chunkDuration);
        let accumulatedText = '';

        // Process each audio chunk sequentially
        for (let i = 0; i < numChunks; i++) {
            const startTime = i * chunkDuration;
            const segmentPath = path.join(uploadsDir, `chunk-${i}-${req.file.filename}`);

            await new Promise((resolve, reject) => {
                ffmpeg(filePath)
                    .setStartTime(startTime)
                    .setDuration(chunkDuration)
                    .output(segmentPath)
                    .on('end', () => {
                        console.log(`Created chunk ${i} (start: ${startTime}s)`);
                        resolve();
                    })
                    .on('error', (error) => {
                        console.error('Error creating chunk:', error);
                        reject(error);
                    })
                    .run();
            });

            // Read the chunk and encode it in base64
            const chunkData = fs.readFileSync(segmentPath);
            const base64Audio = chunkData.toString('base64');

            // Call the Whisper API for transcription
            const whisperResponse = await fetch(
                'https://api.cloudflare.com/client/v4/accounts/df83904bef3ba8d5e545a35b35a9807c/ai/run/@cf/openai/whisper-large-v3-turbo',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer 9_eR8WRvm9ZMEgH5MQUVxzm05UBdzcGYfoGADkrr`, // Replace with your Whisper API token
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        audio: base64Audio,
                        task: 'transcribe',
                        language: 'en',
                    }),
                }
            );

            if (!whisperResponse.ok) {
                const errorDetails = await whisperResponse.text();
                console.error('Whisper API error:', errorDetails);
                return res.status(500).json({ error: `Whisper API Error: ${errorDetails}` });
            }

            const whisperResult = await whisperResponse.json();
            // Extract transcription text (adjust extraction based on the actual API response)
            const partialText = whisperResult.result?.text || whisperResult.transcription || '';
            console.log(`Chunk ${i} transcription: ${partialText}`);
            accumulatedText += partialText + ' ';

            // Clean up the temporary chunk file
            fs.unlinkSync(segmentPath);
        }

        // Clean up the original uploaded file
        fs.unlinkSync(filePath);

        // Build the prompt so Gemma returns a JSON with the desired keys.
        // Note: We pass along the full transcription as input.
        const detailedPrompt = `You are a professional assistant tasked with organizing and summarizing meeting information. Given the transcription text below, output a JSON object exactly in the following format:

{
  "meeting_audio_text": "<complete transcription text>",
  "meeting_summary": "<a concise summary of the meeting>",
  "meeting_tasks": ["<task 1>", "<task 2>", ...]
}

Please ensure that:
- "meeting_audio_text" is the full transcription text provided below.
- "meeting_summary" is a short summary capturing the key points.
- "meeting_tasks" is an array of strings, where each string is a task assigned to the user.

Transcription Text:
${accumulatedText.trim()}
`;

        // Call the Gemma AI endpoint with the prompt
        const organizationResponse = await fetch(
            'https://api.cloudflare.com/client/v4/accounts/df83904bef3ba8d5e545a35b35a9807c/ai/run/@hf/google/gemma-7b-it',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer 9_eR8WRvm9ZMEgH5MQUVxzm05UBdzcGYfoGADkrr`, // Replace with your Gemma API token
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: detailedPrompt,
                    max_tokens: 2048,
                    temperature: 0.6,
                    top_p: 1.0,
                }),
            }
        );

        if (!organizationResponse.ok) {
            const errorDetails = await organizationResponse.text();
            console.error('Organization API error:', errorDetails);
            return res.status(500).json({ error: `Organization API Error: ${errorDetails}` });
        }

        const organizationResult = await organizationResponse.json();
        console.log('Organization result:', organizationResult);

        // Expect Gemma's response to be a JSON string or object with the keys:
        // meeting_audio_text, meeting_summary, meeting_tasks.
        let gemmaOutput;
        if (typeof organizationResult.result === 'string') {
            try {
                gemmaOutput = JSON.parse(organizationResult.result);
            } catch (err) {
                console.error('Error parsing Gemma output:', err);
                return res.status(500).json({ error: 'Failed to parse Gemma output.' });
            }
        } else {
            gemmaOutput = organizationResult.result;
        }

        // In case Gemma did not echo the full transcription text,
        // ensure meeting_audio_text is set to our accumulated transcription.
        if (!gemmaOutput.meeting_audio_text) {
            gemmaOutput.meeting_audio_text = accumulatedText.trim();
        }

        // Update the MongoDB meeting document with the three fields.
        const updateResult = await meetingsCollection.updateOne(
            { _id: new ObjectId(meetingId) },
            {
                $set: {
                    meeting_audio_text: gemmaOutput.meeting_audio_text,
                    meeting_summary: gemmaOutput.meeting_summary,
                    meeting_tasks: gemmaOutput.meeting_tasks,
                },
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: 'Meeting not found in the database.' });
        }

        // Return a success response.
        res.setHeader('Content-Type', 'application/json');
        res.json({
            message: 'Meeting updated successfully.',
            meeting_id: meetingId,
            meeting_audio_text: gemmaOutput.meeting_audio_text,
            meeting_summary: gemmaOutput.meeting_summary,
            meeting_tasks: gemmaOutput.meeting_tasks,
        });
    } catch (error) {
        console.error('Transcription error:', error);
        // Clean up the file if an error occurs.
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
