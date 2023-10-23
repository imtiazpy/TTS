"use client"

import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';


export default function Home() {

  const voiceRef = useRef();
  const textRef = useRef();

  const [audio, setAudio] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [voices, setVoices] = useState([])

  const handleGenerateTTS = async () => {
    const selectedVoice = voiceRef.current.value;
    const text = textRef.current.value;

    setIsLoading(true);

    try {
      if (!text || text.trim() == "") {
        toast("Enter some text!");
        return;
      }

      const response = await fetch('api/elevenlabs', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          voice: selectedVoice
        })
      });

      if (!response.ok) {
        throw new Error("Something went wrong!");
      };

      const audioData = await response.blob();

      // create blob url for the audio data
      const blobURL = URL.createObjectURL(audioData);

      setAudio(blobURL);

    } catch (err) {
      toast(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function getVoices() {
      try {
        const response = await fetch("https://api.elevenlabs.io/v1/voices");

        if (!response.ok) {
          throw new Error("Something went wrong");
        }

        const data = await response.json();

        setVoices(data.voices);
      } catch (error) {
        toast(error.message);
      }
    }

    getVoices();
  }, [])

  return (
    <main className='h-[100vh] flex flex-col gap-4 items-center justify-center p-8 w-auto'>
      <h3 className="text-2xl font-bold text-gray-300 uppercase mb-6">
        Convert your text into speech.
      </h3>
      <div className="flex flex-col gap-4 rounded-md border border-amber-600 p-8 w-full">
        <div className="flex gap-4 items-center">
          <label className='text-gray-300'>Select a Voice:</label>
          <select ref={voiceRef} className="bg-blue-100 py-2 px-4 rounded-lg">
            {voices.map((voice) => (
              <option key={voice.voice_id} value={voice.voice_id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>

        <textarea
          className="p-4 border border-blue-100 rounded-lg outline-none placeholder-gray-400 focus-within:drop-shadow-md"
          placeholder="Write something to convert to speech..."
          cols={50}
          rows={6}
          ref={textRef}
        />

        <button
          disabled={isLoading}
          onClick={handleGenerateTTS}
          className="py-2 px-4 bg-amber-800 text-white rounded-lg hover:opacity-80"
        >
          {isLoading ? "Generating, please wait" : "Generate Speech"}
        </button>
      </div>
      {audio && (
        <div className='border border-amber-600 rounded-md p-8 w-full'>
          <audio className='w-full' autoPlay controls src={audio} />
        </div>
      )}
    </main>
  )
}
