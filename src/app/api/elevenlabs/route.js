

export async function POST(request) {
  const { message, voice } = await request.json();

  const NEXT_ELEVENLABS_API_URL = process.env.NEXT_ELEVENLABS_API_URL;

  try {
    const response = await fetch(
      `${NEXT_ELEVENLABS_API_URL}/${voice}/stream?optimize_streaming_latency=0&output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: message,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0,
            similarity_boost: 0,
            style: 0,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error("Something went wrong..!");
    };

    const arrayBuffer = await response.arrayBuffer();

    // Set response headers
    const headers = new Headers();
    headers.set("Content-Type", "audio/mpeg");
    headers.set("Cache-Control", "no-cache");
    headers.set("Content-Length", arrayBuffer.byteLength.toString());

    // Create a Response with audio data and headers
    const audioResponse = new Response(arrayBuffer, { headers });

    return audioResponse;

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }));
  }
};