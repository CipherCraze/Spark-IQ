import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

export async function gradeSubmission(req, res) {
  try {
    const { submissionId, assignmentId, fileUrl, rubric } = req.body;

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Read the submission file content
    const response = await fetch(fileUrl);
    const fileContent = await response.text();

    // Create the prompt for grading
    const prompt = `
      You are an expert teacher grading a student's assignment. Please evaluate the following submission based on the provided rubric.
      
      Rubric:
      ${rubric}
      
      Student's Submission:
      ${fileContent}
      
      Please provide:
      1. A numerical grade out of the maximum points
      2. Detailed feedback explaining the grade
      3. Suggestions for improvement
      
      Format your response as JSON with the following structure:
      {
        "grade": number,
        "feedback": string,
        "suggestions": string[]
      }
    `;

    // Generate the grading
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const gradingResult = JSON.parse(response.text());

    // Return the grading results
    return res.status(200).json({
      submissionId,
      assignmentId,
      grade: gradingResult.grade,
      feedback: gradingResult.feedback,
      suggestions: gradingResult.suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    return res.status(500).json({
      error: 'Failed to grade submission',
      details: error.message
    });
  }
} 