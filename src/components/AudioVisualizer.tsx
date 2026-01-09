import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Square, Loader2, X } from 'lucide-react';

interface AudioVisualizerProps {
  audioLevel: number;
  isRecording: boolean;
  recordingDuration?: number;
  fullWidth?: boolean;
  isTranscribing?: boolean;
  onStop?: () => void;
  onCancel?: () => void;
}

export default function AudioVisualizer({ 
  audioLevel, 
  isRecording, 
  recordingDuration = 0, 
  fullWidth = false,
  isTranscribing = false,
  onStop,
  onCancel
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const barsRef = useRef<number[]>(new Array(20).fill(0));

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      if (!isRecording) {
        barsRef.current = barsRef.current.map(bar => bar * 0.9);
      } else {
        // Update bars with smooth animation
        barsRef.current = barsRef.current.map((bar, i) => {
          const targetHeight = audioLevel * (0.3 + Math.random() * 0.7);
          return bar * 0.7 + targetHeight * 0.3;
        });
      }
      
      // Draw bars
      const barWidth = width / barsRef.current.length;
      const barSpacing = 2;
      
      barsRef.current.forEach((barHeight, i) => {
        const x = i * barWidth + barSpacing;
        const y = height / 2;
        const actualHeight = barHeight * height * 0.8;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, y - actualHeight / 2, 0, y + actualHeight / 2);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 1)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.8)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
          x,
          y - actualHeight / 2,
          barWidth - barSpacing * 2,
          actualHeight
        );
      });
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (fullWidth) {
    if (isTranscribing) {
      return (
        <div className="flex items-center justify-center gap-3 px-4 h-[52px] bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Transcribing audio...</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 px-3 h-[52px] bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={onStop}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center"
            title="Stop and transcribe"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
          <button
            onClick={onCancel}
            className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
            title="Cancel recording"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <canvas
          ref={canvasRef}
          className="flex-1 h-8"
        />
        
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            animate={{ scale: isRecording ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}
          >
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-400'}`}>
              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500"
                  animate={{ scale: [1, 2], opacity: [1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 tabular-nums">
            {formatDuration(recordingDuration)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <motion.div
        className="relative"
        animate={{ scale: isRecording ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}
      >
        <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-400'}`}>
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500"
              animate={{ scale: [1, 1.5], opacity: [1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
      </motion.div>
      
      <canvas
        ref={canvasRef}
        className="flex-1 h-12"
        style={{ maxWidth: '200px' }}
      />
      
      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[80px]">
        {isRecording ? `Recording... ${formatDuration(recordingDuration)}` : 'Ready'}
      </span>
    </div>
  );
}