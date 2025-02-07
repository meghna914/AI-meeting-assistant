import React, { useState, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

/**
 * Minimal fetchFile implementation.
 * Accepts either a URL (string) or a File/Blob, returns a Uint8Array.
 */
async function fetchFile(input) {
  if (typeof input === 'string') {
    const resp = await fetch(input);
    if (!resp.ok) throw new Error(`Failed to fetch file from URL: ${input}`);
    return new Uint8Array(await resp.arrayBuffer());
  } else {
    return new Uint8Array(await input.arrayBuffer());
  }
}

export default function App() {
  const [ffmpeg, setFfmpeg] = useState(null);
  const [loadingFfmpeg, setLoadingFfmpeg] = useState(true);
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const defaultLogListenerRef = useRef(null);
  let localLogBuffer = '';
  useEffect(() => {
    (async () => {
      try {
        const ff = new FFmpeg();
        defaultLogListenerRef.current = ({ message }) => {
          console.log('[FFmpeg log]', message);
        };
        ff.on('log', defaultLogListenerRef.current);

        await ff.load();
        setFfmpeg(ff);
        setLoadingFfmpeg(false);
      } catch (err) {
        console.error('FFmpeg load error:', err);
        setError(`FFmpeg load error: ${err.message}`);
      }
    })();
  }, []);

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };
  function parseDurationFromLogs(allLogs) {
    const regex = /^\s*Duration:\s+(\d+):(\d+):(\d+\.\d+)/m;
    const match = allLogs.match(regex);
    if (!match) return 0;
    const [, hh, mm, ss] = match;
    return +hh * 3600 + +mm * 60 + +ss;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      setError('Please select an audio file.');
      return;
    }
    if (!ffmpeg) {
      setError('FFmpeg is still loading.');
      return;
    }

    setError('');
    setTranscription('');
    setProgress(0);
    setLoading(true);
    localLogBuffer = '';
    ffmpeg.off('log');
    const tempLogListener = ({ message }) => {
      console.log('[FFmpeg log]', message);
      localLogBuffer += message + '\n';
    };
    ffmpeg.on('log', tempLogListener);

    try {
      const fileData = await fetchFile(audioFile);
      await ffmpeg.writeFile('inputFile', fileData);
      await ffmpeg.exec(['-v', 'info', '-i', 'inputFile', '-f', 'null', '-']);
      console.log('Full logs:\n', localLogBuffer);
      const durationSeconds = parseDurationFromLogs(localLogBuffer);
      console.log('Parsed duration (s):', durationSeconds);
      if (durationSeconds === 0) {
        throw new Error('Could not parse duration from logs.');
      }
      let startTimes = [];
      for (let t = 0; t < durationSeconds; t += 30) {
        startTimes.push(t);
      }

      let accumulatedText = '';
      for (let i = 0; i < startTimes.length; i++) {
        const start = startTimes[i];
        const remaining = durationSeconds - start;
        const chunkLen = remaining > 30 ? 30 : remaining;
        const outName = `chunk-${i}.wav`;
        localLogBuffer = '';
        try {
          await ffmpeg.deleteFile(outName);
        } catch { }

        console.log(`Extracting chunk #${i}: start=${start}s, len=${chunkLen}s`);
        await ffmpeg.exec([
          '-ss', String(start),
          '-t', String(chunkLen),
          '-i', 'inputFile',
          '-acodec', 'pcm_s16le',
          '-ar', '44100',
          '-ac', '2',
          outName,
        ]);

        const chunkData = await ffmpeg.readFile(outName);
        const chunkBlob = new Blob([chunkData], { type: 'audio/wav' });
        const fd = new FormData();
        fd.append('audio', chunkBlob, outName);

        const resp = await fetch('http://127.0.0.1:8787', {
          method: 'POST',
          body: fd,
        });

        if (!resp.ok) {
          throw new Error(`Worker error: ${await resp.text()}`);
        }

        const partial = await resp.json();
        accumulatedText += partial.text + ' ';
        setTranscription(accumulatedText.trim());

        setProgress(Math.round(((i + 1) / startTimes.length) * 100));
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      try {
        await ffmpeg.deleteFile('inputFile');
      } catch { }
      ffmpeg.off('log');
      if (defaultLogListenerRef.current) {
        ffmpeg.on('log', defaultLogListenerRef.current);
      }
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Audio Transcription (30s chunks) - Local Log Buffer</h1>

      {loadingFfmpeg ? (
        <p>Loading FFmpeg WASM...</p>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <input type="file" accept="audio/*" onChange={handleFileChange} />
            <button type="submit" disabled={loading}>
              {loading ? 'Transcribing...' : 'Upload & Transcribe'}
            </button>
          </form>
        </>
      )}

      {progress > 0 && <p>Progress: {progress}%</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {transcription && (
        <div style={{ marginTop: 16 }}>
          <h2>Transcript</h2>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
}
