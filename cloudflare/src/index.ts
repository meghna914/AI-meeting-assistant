// index.ts
interface Env {
	// If you have bindings (KV, secrets, etc.), add them here.
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// 1) Handle OPTIONS (CORS preflight)
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		try {
			// 2) Ensure we're dealing with FormData
			const contentType = request.headers.get('Content-Type') || '';
			if (!contentType.includes('multipart/form-data')) {
				return new Response('Expected form-data submission', { status: 400 });
			}

			// 3) Extract "audio" from the incoming FormData
			const formData = await request.formData();
			const audioFile = formData.get('audio');
			if (!audioFile || !(audioFile instanceof File)) {
				return new Response('No audio file provided', { status: 400 });
			}

			console.log('Received chunk:', audioFile.name, 'Size:', audioFile.size);

			// Convert File -> ArrayBuffer -> base64
			const arrayBuffer = await audioFile.arrayBuffer();
			const base64Audio = arrayBufferToBase64(arrayBuffer);

			// 4) Build the payload for Cloudflare’s Whisper
			const payload = {
				audio: base64Audio,
				task: 'transcribe', // or "translate" if you want translation
				language: 'en',
			};

			// 5) Make the request to Cloudflare’s Whisper endpoint
			//    Replace with your account ID/token
			const whisperUrl =
				'https://api.cloudflare.com/client/v4/accounts/df83904bef3ba8d5e545a35b35a9807c/ai/run/@cf/openai/whisper-large-v3-turbo';

			const response = await fetch(whisperUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer 9_eR8WRvm9ZMEgH5MQUVxzm05UBdzcGYfoGADkrr`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorDetails = await response.text();
				throw new Error(`Whisper API error: ${errorDetails}`);
			}

			const result = (await response.json()) as { result?: { text?: string } };
			const partialText = result?.result?.text || '';

			// 6) Return partial transcript
			return new Response(JSON.stringify({ text: partialText }), {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			console.error('Error processing request:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	},
};

// Helper: Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}
