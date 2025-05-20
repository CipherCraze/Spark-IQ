import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

const systemPrompt = `You are an expert educator evaluating student assignments. Follow these guidelines:

1. Evaluate the assignment based on:
   - Content accuracy and depth
   - Structure and organization
   - Critical thinking and analysis
   - Writing quality and clarity
   - Use of references and citations

2. Provide feedback in the following structured format:

OVERALL GRADE: [0-100]

STRENGTHS:
- [List 2-3 main strengths]
- [Be specific and provide examples]

AREAS FOR IMPROVEMENT:
- [List 2-3 areas that need work]
- [Provide specific suggestions]

DETAILED FEEDBACK:
[Break down your feedback into clear sections with specific examples]

RECOMMENDATIONS:
- [List actionable steps for improvement]
- [Include specific resources or examples]

3. Keep each point concise and clear
4. Use bullet points for better readability
5. Include specific examples from the assignment
6. End with encouraging words and next steps`;

export const evaluateAssignment = async (assignmentContent, assignmentType) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    const contents = [{
      parts: [{
        text: `${systemPrompt}\n\nAssignment Type: ${assignmentType}\n\nEvaluate this assignment:\n\n${assignmentContent}\n\nProvide detailed feedback and a grade.`
      }]
    }];

    console.log('Making API request to:', GEMINI_API_URL); // Debug log
    console.log('Request payload:', JSON.stringify(contents, null, 2)); // Debug log

    const response = await axios.post(
      GEMINI_API_URL,
      { contents },
      {
        params: { key: GEMINI_API_KEY },
        headers: { 
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('API Response:', response.data); // Debug log

    const feedback = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!feedback) {
      throw new Error('No feedback generated');
    }

    // Parse the feedback to extract grade and structured feedback
    const gradeMatch = feedback.match(/Grade:\s*(\d+)/i);
    const grade = gradeMatch ? parseInt(gradeMatch[1]) : null;

    return {
      grade,
      feedback,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error evaluating assignment:', error);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      }
    });
    
    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 404:
          throw new Error(`API endpoint not found (${error.config?.url}). Please check the API configuration.`);
        case 429:
          throw new Error('Rate limit exceeded. Please try again in a few minutes.');
        case 400:
          throw new Error(`Invalid request: ${error.response.data?.error?.message || 'Please check your input.'}`);
        case 401:
          throw new Error('Invalid API key. Please check your configuration.');
        case 403:
          throw new Error('Access denied. Please check your API key permissions.');
        default:
          throw new Error(`API error: ${error.response.status} - ${error.response.statusText}`);
      }
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
}; 