import React, { useState } from 'react';

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle file selection
  const handleFileChange = (event) => {
    setAudioFile(event.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if a file is selected
    if (!audioFile) {
      setError('Please select an audio file.');
      return;
    }

    setError('');
    setTranscription('');
    setLoading(true);

    // Create a FormData object and append the audio file
    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      const response = await fetch('http://127.0.0.1:8787', {
        method: 'POST',
        body: formData,
      });

      // If the response is not OK, extract and display the error
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Parse the JSON response and set the transcription
      const data = await response.json();
      setTranscription(data.text);
    } catch (err) {
      console.error('Error during transcription:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h1>Audio Transcription</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        <button type="submit" disabled={loading} style={{ marginLeft: '1rem' }}>
          {loading ? 'Transcribing...' : 'Upload & Transcribe'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {transcription && (
        <div style={{ marginTop: '1rem' }}>
          <h2>Transcription:</h2>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
}

export default App;
