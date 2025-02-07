import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import fetch from 'node-fetch';
// Recreate __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure that ffmpegStatic and ffprobeStatic are not null.
if (!ffmpegStatic) {
    throw new Error("FFmpeg binary not found");
}
if (!ffprobeStatic.path) {
    throw new Error("ffprobe binary not found");
}
// Set the ffmpeg and ffprobe binary paths
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);
// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
// Configure multer to store uploaded files on disk
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        // Prepend a timestamp to avoid collisions
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });
// Create Express app
const app = express();
const PORT = Number(process.env.PORT) || 3000;
// Unified transcription and organization endpoint
app.post('/transcribe', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No audio file provided.' });
        return;
    }
    // Use a local constant to narrow the type.
    const file = req.file;
    const filePath = file.path;
    console.log(`Received file: ${file.originalname}`);
    try {
        ffmpeg.ffprobe(filePath, async (err, metadata) => {
            if (err) {
                console.error('Error reading file metadata:', err.message);
                res.status(500).json({ error: `Error reading file metadata: ${err.message}` });
                return;
            }
            const durationSeconds = metadata.format.duration;
            console.log(`File duration: ${durationSeconds} seconds`);
            const chunkDuration = 30; // seconds per chunk
            const numChunks = Math.ceil(durationSeconds / chunkDuration);
            let accumulatedText = '';
            // Process each chunk sequentially
            for (let i = 0; i < numChunks; i++) {
                const startTime = i * chunkDuration;
                // Construct a temporary output file name for the chunk
                const segmentPath = path.join(uploadsDir, `chunk-${i}-${file.filename}`);
                // Create the chunk using fluent-ffmpeg
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
                // Read the chunk file and convert to base64
                const chunkData = fs.readFileSync(segmentPath);
                const base64Audio = chunkData.toString('base64');
                // Call the Whisper API for transcription
                const whisperResponse = await fetch('https://api.cloudflare.com/client/v4/accounts/df83904bef3ba8d5e545a35b35a9807c/ai/run/@cf/openai/whisper-large-v3-turbo', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer YOUR_WHISPER_API_TOKEN_HERE`, // Replace with your Whisper API token
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        audio: base64Audio,
                        task: 'transcribe',
                        language: 'en',
                    }),
                });
                if (!whisperResponse.ok) {
                    const errorDetails = await whisperResponse.text();
                    console.error('Whisper API error:', errorDetails);
                    res.status(500).json({ error: `Whisper API Error: ${errorDetails}` });
                    return;
                }
                const whisperResult = (await whisperResponse.json());
                // Extract transcription text (adjust based on actual response structure)
                const partialText = whisperResult.result?.text || whisperResult.transcription || '';
                console.log(`Chunk ${i} transcription: ${partialText}`);
                accumulatedText += partialText + ' ';
                // Clean up the temporary chunk file
                fs.unlinkSync(segmentPath);
            }
            // Clean up the original uploaded file
            fs.unlinkSync(filePath);
            // Build the detailed prompt
            const detailedPrompt = `Act as a professional assistant tasked with organizing and summarizing information for a user. Based on the provided input, generate the following:

- **Summary**: Provide a concise summary of the key points discussed or tasks completed.
- **Tasks Allocated to the User**: List all tasks assigned to the user, including deadlines (if any) and priority levels (high, medium, low).
- **Important Meeting Agendas**: Highlight upcoming meetings and their agendas. Include the date, time, participants (if known), and key discussion points.
- **Other Important Things**: Note any additional critical information, such as deadlines, reminders, or follow-ups.

Ensure the output is clear, organized, and easy to understand. Use bullet points or numbered lists where appropriate for better readability.

Input:
${accumulatedText.trim()}

Output:`;
            // Send the detailed prompt to Cloudflare's Gemma endpoint
            try {
                const organizationResponse = await fetch('https://api.cloudflare.com/client/v4/accounts/df83904bef3ba8d5e545a35b35a9807c/ai/run/@hf/google/gemma-7b-it', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer YOUR_GEMMA_TOKEN_HERE`, // Replace with your Gemma API token
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prompt: detailedPrompt,
                        max_tokens: 2048,
                        temperature: 0.6,
                        top_p: 1.0,
                    }),
                });
                if (!organizationResponse.ok) {
                    const errorDetails = await organizationResponse.text();
                    console.error('Organization API error:', errorDetails);
                    res.status(500).json({ error: `Organization API Error: ${errorDetails}` });
                    return;
                }
                const organizationResult = (await organizationResponse.json());
                console.log('Organization result:', organizationResult);
                // Look for the organized output in organizationResult.result.response or organizationResult.result.summary
                const organizedOutput = organizationResult.result?.response ||
                    organizationResult.result?.summary ||
                    "No detailed output returned.";
                // Send back the final JSON response with explicit header
                res.setHeader('Content-Type', 'application/json');
                res.json({
                    transcription: accumulatedText.trim(),
                    organized_output: organizedOutput,
                });
            }
            catch (organizationError) {
                console.error('Organization error:', organizationError);
                res.status(500).json({ error: organizationError.message });
            }
        });
    }
    catch (error) {
        console.error('Transcription error:', error);
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
