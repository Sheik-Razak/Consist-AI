// src/components/chat/chat-input-area.tsx
'use client';

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Mic, Loader2, Languages, Check, ImagePlus, XCircle } from 'lucide-react';
import { transcribeAudioAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatInputAreaProps {
  onSendMessage: (payload: { text: string; imageFile?: File }, language: string) => void;
  isLoading: boolean;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'te-IN', name: 'Telugu (India)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'ur-IN', name: 'Urdu (India)' },
  { code: 'ta-IN', name: 'Tamil (India)' },
];

export function ChatInputArea({ onSendMessage, isLoading }: ChatInputAreaProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedInputLanguage, setSelectedInputLanguage] = useState<string>(SUPPORTED_LANGUAGES[0].code);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const handleMicClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); 
      return true;
    } catch (error) {
      console.error("Error requesting microphone permission:", error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access in your browser settings to use this feature.",
        variant: "destructive",
      });
      return false;
    }
  };

  const startRecording = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64AudioData = reader.result as string;
          setIsTranscribing(true);
          try {
            const transcribedText = await transcribeAudioAction(base64AudioData);
            if (transcribedText) {
              setInputValue(prev => prev ? `${prev} ${transcribedText}` : transcribedText);
            } else {
               toast({
                title: "Transcription Failed",
                description: "Could not transcribe audio. Please try again.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Error transcribing audio:", error);
            toast({
              title: "Transcription Error",
              description: error instanceof Error ? error.message : "An unknown error occurred during transcription.",
              variant: "destructive",
            });
          } finally {
            setIsTranscribing(false);
            stream.getTracks().forEach(track => track.stop()); 
          }
        };
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
       toast({
        title: "Recording Error",
        description: "Could not start audio recording. Please check microphone permissions and try again.",
        variant: "destructive",
      });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = ""; 
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((inputValue.trim() || selectedImageFile) && !isLoading && !isRecording && !isTranscribing) {
      onSendMessage({ text: inputValue.trim(), imageFile: selectedImageFile || undefined }, selectedInputLanguage);
      setInputValue('');
      handleRemoveImage();
    }
  };

  const disableActions = isLoading || isRecording || isTranscribing;

  return (
    <div className="bg-background p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2"> {/* Removed max-w-4xl mx-auto */}
        {selectedImagePreview && (
          <div className="relative group w-32 h-32 mx-auto mb-2 rounded-md overflow-hidden border">
            <Image src={selectedImagePreview} alt="Selected preview" layout="fill" objectFit="cover" data-ai-hint="image preview"/>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-70 group-hover:opacity-100"
              onClick={handleRemoveImage}
            >
              <XCircle className="h-4 w-4" />
              <span className="sr-only">Remove image</span>
            </Button>
          </div>
        )}
        <div className="flex items-center gap-3 bg-card rounded-lg p-2 shadow-sm">
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={disableActions}
          />
          <Button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={disableActions}
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-accent rounded-md w-10 h-10"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="sr-only">Add image</span>
          </Button>
          
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isRecording ? "Recording..." : (isTranscribing ? "Transcribing..." : `Write your message...`)}
            className="flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            disabled={disableActions}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !disableActions && !selectedImageFile) {
                 if (inputValue.trim()) handleSubmit(e);
              }
            }}
          />
          <Button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading || isTranscribing}
            size="icon"
            variant="ghost"
            className={`rounded-md w-10 h-10 ${isRecording ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-accent'}`}
          >
            {isTranscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
            <span className="sr-only">{isRecording ? "Stop recording" : (isTranscribing ? "Transcribing..." : "Start recording")}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-accent rounded-md w-10 h-10" 
                aria-label="Select input language"
                disabled={disableActions}
              >
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SUPPORTED_LANGUAGES.map(lang => (
                <DropdownMenuItem key={lang.code} onSelect={() => setSelectedInputLanguage(lang.code)}>
                  {lang.name}
                  {selectedInputLanguage === lang.code && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            type="submit" 
            disabled={disableActions || (!inputValue.trim() && !selectedImageFile)} 
            size="icon" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-md w-10 h-10"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizontal className="h-5 w-5" />}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
