export interface Env {
	AI: any; // The AI binding provided by Cloudflare Workers AI
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		try {
			// Parse the incoming form data
			const formData = await request.formData();
			const audioFile = formData.get('audio');
			if (!audioFile) {
				return new Response('No audio file provided', { status: 400 });
			}
			if (!(audioFile instanceof File)) {
				return new Response('Invalid audio file provided', { status: 400 });
			}

			console.log('Received audio file:', audioFile.name);

			// Convert the audio file to base64
			const arrayBuffer = await audioFile.arrayBuffer();
			const base64Audio = btoa(
				new Uint8Array(arrayBuffer).reduce(
					(data, byte) => data + String.fromCharCode(byte),
					''
				)
			);

			console.log('Base64 audio length:', base64Audio.length);

			// Run speech-to-text model (example with Whisper)
			const whisperResponse = await fetch(
				'https://api.cloudflare.com/client/v4/accounts/df83904bef3ba8d5e545a35b35a9807c/ai/run/@cf/openai/whisper-large-v3-turbo',
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer 9_eR8WRvm9ZMEgH5MQUVxzm05UBdzcGYfoGADkrr`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						audio: base64Audio,
						task: 'transcribe',
						language: 'en',
					}),
				}
			);

			console.log('Whisper API response status:', whisperResponse.status);

			if (!whisperResponse.ok) {
				const errorDetails = await whisperResponse.text();
				console.error('Whisper API error:', errorDetails);
				return new Response(`Whisper API Error: ${errorDetails}`, { status: 500 });
			}

			// Log the full response for debugging
			const whisperResult = (await whisperResponse.json()) as any;
			console.log('Full Whisper API response:', JSON.stringify(whisperResult, null, 2));

			// Check for errors in the response
			if (whisperResult.errors && whisperResult.errors.length > 0) {
				console.error('Whisper result errors:', whisperResult.errors);
				return new Response(`Whisper Error: ${JSON.stringify(whisperResult.errors)}`, { status: 500 });
			}

			// Extract the transcribed text (adjust based on the actual response structure)
			const transcription = whisperResult.result?.text || whisperResult.transcription || 'No transcription available';
			console.log('Transcription:', transcription);

			// Return the transcription result as JSON with CORS headers
			return new Response(JSON.stringify({ text: transcription }), {
				headers: {
					'Access-Control-Allow-Origin': '*', // Allow all origins
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			console.error('Error processing request:', error);
			return new Response(`Internal Server Error: `, { status: 500 });
		}
	},
};