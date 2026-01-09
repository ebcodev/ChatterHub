import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechRecordingProps {
  onTranscription: (text: string) => void;
  openAIKey: string | null;
  model?: 'whisper-1' | 'gpt-4o-transcribe' | 'gpt-4o-mini-transcribe';
  systemPrompt?: string;
}

export function useSpeechRecording({
  onTranscription,
  openAIKey,
  model = 'whisper-1',
  systemPrompt = ''
}: UseSpeechRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    setAudioLevel(average / 255); // Normalize to 0-1

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  // Update recording duration
  useEffect(() => {
    if (isRecording) {
      recordingStartTimeRef.current = Date.now();
      setRecordingDuration(0);

      durationIntervalRef.current = setInterval(() => {
        if (recordingStartTimeRef.current) {
          setRecordingDuration(Math.floor((Date.now() - recordingStartTimeRef.current) / 1000));
        }
      }, 100);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    if (!openAIKey) {
      setError('OpenAI API key is required for speech-to-text');
      return;
    }

    try {
      setError(null);
      audioChunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio context for visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Start visualization
      updateAudioLevel();

      // Set up media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        // Stop visualization
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        setAudioLevel(0);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        // Transcribe audio
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [openAIKey, updateAudioLevel]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (!isRecording) return;

    // Stop media recorder without triggering onstop handler
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Stop visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear audio chunks
    audioChunksRef.current = [];

    // Reset state
    setIsRecording(false);
    setError(null);
  }, [isRecording]);

  const transcribeAudio = async (audioBlob: Blob) => {
    if (!openAIKey) {
      setError('OpenAI API key is required');
      return;
    }

    setIsTranscribing(true);
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', model);

      // Add prompt if provided
      if (systemPrompt) {
        // For whisper-1, prompt is limited to 224 tokens (roughly 900 characters)
        const prompt = model === 'whisper-1' ? systemPrompt.slice(0, 900) : systemPrompt;
        formData.append('prompt', prompt);
      }

      // Send to OpenAI Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `Transcription failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.text) {
        onTranscription(data.text);
      } else {
        throw new Error('No transcription text received');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isTranscribing,
    error,
    audioLevel,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    toggleRecording,
  };
}