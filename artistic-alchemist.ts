
// @ts-nocheck
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ImageUploader } from '@/components/image-uploader';
import { styleTransfer } from '@/ai/flows/style-transfer';
import type { StyleTransferInput } from '@/ai/flows/style-transfer';
import { Loader2, Sparkles, Download, AlertTriangle, Paintbrush2, Palette, Image as ImageIconLucide } from 'lucide-react'; // Renamed Image from lucide to avoid conflict
import { useToast } from "@/hooks/use-toast";

export function ArtisticAlchemistForm() {
  const [contentImageDataUrl, setContentImageDataUrl] = useState<string | null>(null);
  const [styleImageDataUrl, setStyleImageDataUrl] = useState<string | null>(null);
  const [stylizedImage, setStylizedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Upload content and style images to begin.");
  const { toast } = useToast();

  const handleContentImageUpload = useCallback((_file: File | null, dataUrl: string | null) => {
    setContentImageDataUrl(dataUrl);
    setStylizedImage(null); 
    setError(null);
    if (dataUrl && styleImageDataUrl) {
      setStatusMessage("Ready to transfer style.");
    } else if (!dataUrl && !styleImageDataUrl) {
        setStatusMessage("Upload content and style images to begin.");
    } else if (!dataUrl) {
        setStatusMessage("Upload a content image.");
    } else {
        setStatusMessage("Upload a style image.");
    }
  }, [styleImageDataUrl]);

  const handleStyleImageUpload = useCallback((_file: File | null, dataUrl: string | null) => {
    setStyleImageDataUrl(dataUrl);
    setStylizedImage(null);
    setError(null);
     if (dataUrl && contentImageDataUrl) {
      setStatusMessage("Ready to transfer style.");
    } else if (!dataUrl && !contentImageDataUrl) {
        setStatusMessage("Upload content and style images to begin.");
    } else if (!dataUrl) {
        setStatusMessage("Upload a style image.");
    } else {
        setStatusMessage("Upload a content image.");
    }
  }, [contentImageDataUrl]);

  const handleStyleTransfer = async () => {
    if (!contentImageDataUrl || !styleImageDataUrl) {
      setError("Please upload both a content image and a style image.");
      setStatusMessage("Missing images. Please upload both.");
      toast({
        title: "Missing Images",
        description: "Please upload both a content image and a style image.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setStylizedImage(null);
    setStatusMessage("Preparing images...");

    try {
      setStatusMessage("Applying artistic style... This may take a moment.");
      const input: StyleTransferInput = {
        contentImage: contentImageDataUrl,
        styleImage: styleImageDataUrl,
      };
      const result = await styleTransfer(input);
      setStylizedImage(result.stylizedImage);
      setStatusMessage("Style transfer complete! Your masterpiece is ready.");
      toast({
        title: "Success!",
        description: "Style transfer complete.",
      });
    } catch (err) {
      console.error("Style transfer error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during style transfer.";
      setError(errorMessage);
      setStatusMessage(`Error: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Style transfer failed: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (stylizedImage) {
      const link = document.createElement('a');
      link.href = stylizedImage;
      link.download = 'artistic_alchemist_stylized_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download Started",
        description: "Your image is being downloaded.",
      });
    }
  };
  
  // Effect to clear status message if it's an error and user changes an image
  useEffect(() => {
    if (error) { // if there was an error message displayed
        if (contentImageDataUrl || styleImageDataUrl) { // and user interacts with inputs
             // Check if both are now available, ready to process
            if (contentImageDataUrl && styleImageDataUrl) {
                 setStatusMessage("Ready to transfer style.");
            } else if (!contentImageDataUrl && !styleImageDataUrl) {
                // Both images removed after an error
                setStatusMessage("Upload content and style images to begin.");
            }
            // else, keep the specific message from uploader callbacks
            // setError(null); // Optionally clear the error state itself
        }
    }
  }, [contentImageDataUrl, styleImageDataUrl, error]);


  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <Card className="shadow-2xl rounded-xl overflow-hidden bg-card/80 backdrop-blur-sm">
        <CardHeader className="bg-primary/10 p-6">
          <CardTitle className="font-headline text-3xl md:text-4xl text-center flex items-center justify-center gap-x-3 text-primary">
            <Paintbrush2 className="h-8 w-8 md:h-10 md:w-10" />
            Artistic Alchemist
            <Palette className="h-8 w-8 md:h-10 md:w-10" />
          </CardTitle>
          <CardDescription className="text-center font-body text-foreground/80 pt-2">
            Transform your photos with the magic of AI. Upload a content image and a style image to create a unique artistic masterpiece.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <ImageUploader
              id="content-image"
              label="Content Image"
              onImageUpload={handleContentImageUpload}
              icon={<ImageIconLucide className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />}
            />
            <ImageUploader
              id="style-image"
              label="Style Image"
              onImageUpload={handleStyleImageUpload}
              icon={<Palette className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />}
            />
          </div>

          <Button 
            onClick={handleStyleTransfer} 
            disabled={isLoading || !contentImageDataUrl || !styleImageDataUrl} 
            className="w-full text-lg py-3 md:py-4 bg-accent hover:bg-accent/90 focus-visible:ring-accent/50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-100 rounded-lg shadow-md hover:shadow-lg"
            aria-live="polite"
            aria-busy={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Sparkles className="mr-2 h-6 w-6" />}
            {isLoading ? "Alchemizing..." : "Transfer Style"}
          </Button>

          {(statusMessage && !isLoading && statusMessage !== "Style transfer complete! Your masterpiece is ready.") && (
            <Alert variant={error ? "destructive" : "default"} className="transition-all duration-300 ease-in-out font-body rounded-lg shadow">
              {error && <AlertTriangle className="h-5 w-5" />}
              <AlertTitle className="font-headline text-lg">{error ? "An Error Occurred" : "Status"}</AlertTitle>
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          )}

          {stylizedImage && !isLoading && (
            <Card className="mt-6 shadow-xl rounded-lg overflow-hidden border-primary/20 bg-background/50 animate-in fade-in-50 duration-500">
              <CardHeader className="pb-2">
                <CardTitle className="font-headline text-2xl md:text-3xl text-center text-primary">Your Masterpiece</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4 p-4">
                <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden border-2 border-primary/30 shadow-inner bg-muted/20">
                  <Image src={stylizedImage} alt="Stylized image" layout="fill" objectFit="contain" data-ai-hint="artistic generated" className="p-1"/>
                </div>
                <Button onClick={handleDownload} variant="outline" className="text-md py-3 border-primary text-primary hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-100 rounded-lg shadow-sm hover:shadow-md">
                  <Download className="mr-2 h-5 w-5" />
                  Download Image
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
