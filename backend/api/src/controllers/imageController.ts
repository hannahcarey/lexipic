import { Response } from 'express';
import { DatabaseService, supabase } from '../utils/supabase';
import { AuthRequest, ApiResponse, ImageAnalysisResponse, IFlashcard } from '../types';
import { asyncHandler } from '../middleware';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';

// Complete image processing and Q&A generation using Python backend
const processImageWithPython = async (
  base64Image: string, 
  language: string = 'Spanish', 
  level: string = 'A2',
  userId?: string
): Promise<ImageAnalysisResponse> => {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, '../../process_image_qa.py');
    const venvPythonPath = path.join(__dirname, '../../../venv/bin/python3');
    
    const args = [
      pythonScriptPath,
      '--base64', base64Image,
      '--language', language,
      '--level', level
    ];
    
    if (userId) {
      args.push('--user-id', userId);
    }
    
    // Use virtual environment Python
    const pythonProcess = spawn(venvPythonPath, args);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python process stderr:', stderr);
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        
        if (!result.success) {
          reject(new Error(result.error || 'Python processing failed'));
          return;
        }

        // Add timestamp to metadata
        if (result.metadata) {
          result.metadata.processed_at = new Date().toISOString();
        }

        resolve(result as ImageAnalysisResponse);

      } catch (parseError) {
        console.error('Failed to parse Python output:', stdout);
        console.error('Parse error:', parseError);
        reject(new Error('Failed to parse Python process output'));
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      reject(error);
    });
  });
};

export const analyzeImage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user;
  
  // Handle both file upload and base64 image
  let imageBuffer: Buffer;
  let originalFilename = 'photo.jpg';
  let base64ImageData: string;
  
  if (req.file) {
    // File upload case
    imageBuffer = req.file.buffer;
    originalFilename = req.file.originalname;
    // Convert buffer to base64 for Python processing
    base64ImageData = imageBuffer.toString('base64');
  } else if (req.body.base64Image) {
    // Base64 image case
    try {
      const base64String = req.body.base64Image;
      
      // Validate base64 format
      if (!base64String || typeof base64String !== 'string') {
        throw new Error('base64Image must be a non-empty string');
      }
      
      // Extract base64 data (remove data URL prefix if present)
      base64ImageData = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Verify it's valid base64
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64ImageData)) {
        throw new Error('Invalid base64 format');
      }
      
      // Convert to buffer and verify it contains image data
      imageBuffer = Buffer.from(base64ImageData, 'base64');
      
      // Check minimum size (should be at least a few bytes for any real image)
      if (imageBuffer.length < 100) {
        throw new Error('Base64 data too small to be a valid image');
      }
      
      // Verify image format by checking magic bytes
      const isValidImage = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8 && imageBuffer[2] === 0xFF || // JPEG
                          imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50 && imageBuffer[2] === 0x4E || // PNG
                          imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49 && imageBuffer[2] === 0x46;   // GIF
      
      if (!isValidImage) {
        throw new Error('Base64 data does not appear to be a valid image format');
      }
      
      console.log(`✅ Base64 validation successful: ${imageBuffer.length} bytes`);
      
    } catch (error) {
      console.error('❌ Base64 validation failed:', error);
      res.status(400).json({
        success: false,
        error: `Invalid base64 image data: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      return;
    }
  } else {
    res.status(400).json({
      success: false,
      error: 'No image data provided. Please provide either a file or base64Image in request body.'
    });
    return;
  }

  // Get user preferences or use defaults
  const language = req.body.language || user?.preferred_languages?.[0] || 'Spanish';
  const level = req.body.level || 'A2'; // Default to A2 level
  const userId = user?.id;

  try {
    // Process and save image (optional, for record keeping)
    const processedImageBuffer = await sharp(imageBuffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Save processed image
    const filename = `analyzed_${Date.now()}_${originalFilename}`;
    const imagePath = path.join(process.env.UPLOAD_PATH || './uploads', filename);
    await fs.writeFile(imagePath, processedImageBuffer);

    // Process image and generate complete Q&A using Python backend
    const analysisResult = await processImageWithPython(base64ImageData, language, level, userId);
    
    console.log('Python processing completed successfully');
    console.log('Generated questions:', analysisResult.total_questions);
    console.log('Language:', analysisResult.learning_context.language);
    console.log('Level:', analysisResult.learning_context.level);

    // Return the complete Q&A response
    const response: ApiResponse<ImageAnalysisResponse> = {
      success: true,
      message: 'Image analyzed and questions generated successfully',
      data: analysisResult
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Image analysis error:', error);
    
    // Provide more specific error information
    let errorMessage = 'Failed to analyze image';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// New endpoint for evaluating student answers
export const evaluateAnswers = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user;
  const { imageDescription, questions, studentAnswers, language, level } = req.body;

  // Validate required fields
  if (!imageDescription || !questions || !studentAnswers || !language || !level) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: imageDescription, questions, studentAnswers, language, level'
    });
    return;
  }

  if (!Array.isArray(questions) || !Array.isArray(studentAnswers)) {
    res.status(400).json({
      success: false,
      error: 'Questions and studentAnswers must be arrays'
    });
    return;
  }

  if (questions.length !== studentAnswers.length) {
    res.status(400).json({
      success: false,
      error: 'Number of questions must match number of student answers'
    });
    return;
  }

  try {
    // Create Python script for evaluation
    const evaluationScriptPath = path.join(__dirname, '../../evaluate_answers.py');
    const venvPythonPath = path.join(__dirname, '../../../venv/bin/python3');
    
    // Prepare data for Python script
    const evaluationData = {
      image_description: imageDescription,
      questions: questions,
      student_answers: studentAnswers,
      language: language,
      level: level,
      user_id: user?.id
    };

    const pythonProcess = spawn(venvPythonPath, [
      evaluationScriptPath,
      '--data', JSON.stringify(evaluationData)
    ]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python evaluation process stderr:', stderr);
        res.status(500).json({
          success: false,
          error: `Evaluation failed: ${stderr}`
        });
        return;
      }

      try {
        const evaluationResult = JSON.parse(stdout);
        
        if (!evaluationResult.success) {
          res.status(500).json({
            success: false,
            error: evaluationResult.error || 'Evaluation processing failed'
          });
          return;
        }

        // Return evaluation results
        const response: ApiResponse = {
          success: true,
          message: 'Student answers evaluated successfully',
          data: evaluationResult.evaluation_summary
        };

        res.status(200).json(response);

      } catch (parseError) {
        console.error('Failed to parse evaluation output:', stdout);
        res.status(500).json({
          success: false,
          error: 'Failed to parse evaluation results'
        });
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start evaluation process:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start evaluation process'
      });
    });

  } catch (error) {
    console.error('Answer evaluation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to evaluate answers'
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
      'Spanish',
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
