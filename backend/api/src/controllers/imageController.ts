import { Response } from 'express';
import { DatabaseService, supabase } from '../utils/supabase';
import { AuthRequest, ApiResponse, ImageAnalysisResponse, IFlashcard } from '../types';
import { asyncHandler } from '../middleware';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// Mock object detection service - replace with actual AI service
const mockObjectDetection = async (imageBuffer: Buffer): Promise<{ objects: string[]; confidence: number }> => {
  // In a real implementation, you would use:
  // - Google Vision API
  // - AWS Rekognition
  // - Azure Computer Vision
  // - OpenAI Vision API
  // - Custom ML model

  // For now, return mock data based on common objects
  const commonObjects = [
    'table', 'chair', 'cup', 'book', 'phone', 'computer', 'car', 'tree', 
    'flower', 'person', 'dog', 'cat', 'bottle', 'bag', 'shoe', 'watch',
    'door', 'window', 'lamp', 'pen', 'glasses', 'key', 'clock'
  ];

  const detectedObjects = commonObjects
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 3) + 1);

  return {
    objects: detectedObjects,
    confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
  };
};

export const analyzeImage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user;
  
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: 'No image file provided'
    });
    return;
  }

  try {
    // Process image
    const imageBuffer = await sharp(req.file.buffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Save processed image
    const filename = `analyzed_${Date.now()}_${req.file.originalname}`;
    const imagePath = path.join(process.env.UPLOAD_PATH || './uploads', filename);
    await fs.writeFile(imagePath, imageBuffer);

    // Detect objects in image
    const detectionResult = await mockObjectDetection(imageBuffer);
    
    // Find flashcards related to detected objects
    const primaryObject = detectionResult.objects[0];
    
    // Try to find a flashcard that matches detected objects
    const { data: flashcards, error: flashcardError } = await supabase
      .from('flashcards')
      .select('*')
      .ilike('object_name', `%${primaryObject}%`)
      .limit(5);

    let selectedFlashcard: IFlashcard | null = null;

    if (!flashcardError && flashcards && flashcards.length > 0) {
      // Pick a random matching flashcard
      const randomIndex = Math.floor(Math.random() * flashcards.length);
      selectedFlashcard = flashcards[randomIndex];
    } else {
      // If no specific match, get a random flashcard
      selectedFlashcard = await DatabaseService.getRandomFlashcard();
    }

    if (!selectedFlashcard) {
      res.status(404).json({
        success: false,
        error: 'No flashcards available in database'
      });
      return;
    }

    const analysisResponse: ImageAnalysisResponse = {
      flashcard: selectedFlashcard,
      detectedObjects: detectionResult.objects,
      confidence: detectionResult.confidence
    };

    const response: ApiResponse<ImageAnalysisResponse> = {
      success: true,
      message: 'Image analyzed successfully',
      data: analysisResponse
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze image'
    });
  }
});

export const uploadImage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: 'No image file provided'
    });
    return;
  }

  try {
    // Process and optimize image
    const imageBuffer = await sharp(req.file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Save image
    const filename = `upload_${Date.now()}_${req.file.originalname}`;
    const imagePath = path.join(process.env.UPLOAD_PATH || './uploads', filename);
    await fs.writeFile(imagePath, imageBuffer);

    // Return image URL
    const imageUrl = `/uploads/${filename}`;

    const response: ApiResponse = {
      success: true,
      message: 'Image uploaded successfully',
      data: { url: imageUrl, filename }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

export const generateFlashcardFromImage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  // This would integrate with AI services to generate flashcards from images
  // For now, return a mock response
  
  const { imageUrl, objectName, translation } = req.body;
  
  if (!imageUrl) {
    res.status(400).json({
      success: false,
      error: 'Image URL is required'
    });
    return;
  }

  // If object name and translation are provided, create a flashcard
  if (objectName && translation) {
    const user = req.user;
    const flashcard = await DatabaseService.createFlashcard(
      objectName,
      translation,
      imageUrl,
      user?.id
    );

    const response: ApiResponse = {
      success: true,
      message: 'Flashcard created from image',
      data: flashcard
    };

    res.status(201).json(response);
    return;
  }

  // Otherwise, return a random existing flashcard
  const randomFlashcard = await DatabaseService.getRandomFlashcard();

  const response: ApiResponse = {
    success: true,
    message: 'Random flashcard for image',
    data: randomFlashcard
  };

  res.status(200).json(response);
});
