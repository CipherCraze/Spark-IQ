import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Using v1beta as it's commonly used for more direct control and sometimes has newer features available.
// If gemini-1.5-flash is available on v1, that's fine too.
// The key is that the model supports the kind of structured output we're asking for.
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
// Note: If you specifically need to use the v1 endpoint, it would be:
// const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;


const systemPrompt = `You are an expert educational evaluator specializing in comprehensive assignment assessment. Your role is to provide detailed, constructive feedback that helps students understand their strengths and areas for improvement.

EVALUATION GUIDELINES:

For TEXT-BASED ASSIGNMENTS:
- Analyze content quality, clarity, and depth of understanding
- Evaluate writing structure, grammar, and coherence
- Assess adherence to assignment requirements and instructions
- Consider creativity, originality, and critical thinking

For IMAGE-BASED ASSIGNMENTS (artwork, diagrams, charts, etc.):
- Analyze visual composition, design principles, and artistic elements
- Evaluate technical execution, attention to detail, and craftsmanship
- Assess creativity, originality, and visual communication effectiveness
- Consider adherence to assignment requirements and visual problem-solving
- Evaluate use of color, form, space, and visual hierarchy where applicable
- Assess clarity of visual communication and intended message

For DOCUMENT-BASED ASSIGNMENTS:
- Evaluate content organization and presentation
- Assess formatting, structure, and professional appearance
- Consider completeness and thoroughness of work

GRADING CRITERIA:
- 90-100: Exceptional work demonstrating mastery of concepts, creativity, and technical excellence
- 80-89: Strong work with minor areas for improvement
- 70-79: Good work with some notable strengths and areas needing development
- 60-69: Adequate work meeting basic requirements but needing significant improvement
- Below 60: Work that does not meet assignment requirements or demonstrates fundamental misunderstandings

RESPONSE FORMAT:
You must respond using EXACTLY this structure:

OVERALL GRADE:
[Number 0-100]

STRENGTHS:
- [Area 1: Specific strength with brief explanation]
- [Area 2: Specific strength with brief explanation]
- [Optional: Area 3]

AREAS FOR IMPROVEMENT:
- [Area 1: Specific point needing improvement with suggestion]
- [Area 2: Specific point needing improvement with suggestion]
- [Optional: Area 3]

DETAILED FEEDBACK:
[Provide a comprehensive narrative here. This section should elaborate on the strengths and areas for improvement, offering specific examples from the student's work. Aim for 2-4 paragraphs.]

RECOMMENDATIONS:
- [Actionable recommendation 1 for the student to improve next time]
- [Actionable recommendation 2 for the student to improve next time]
- [Optional: Actionable recommendation 3, possibly suggesting a resource or technique]

CONCLUDING REMARKS:
[A brief, encouraging closing statement.]

IMPORTANT: Ensure each section header (e.g., "OVERALL GRADE:", "STRENGTHS:") is exactly as written and is followed by a newline.
`;

// Helper function to extract content between two section headers or a header and the end of the text
const extractSectionContent = (text, startHeader, endHeader) => {
  const startIndex = text.indexOf(startHeader);
  if (startIndex === -1) {
    return null; // Start header not found
  }

  const contentStartIndex = startIndex + startHeader.length;
  let contentEndIndex = text.length; // Default to end of text

  if (endHeader) {
    const endIndex = text.indexOf(endHeader, contentStartIndex);
    if (endIndex !== -1) {
      contentEndIndex = endIndex;
    }
  }
  return text.substring(contentStartIndex, contentEndIndex).trim();
};


export const evaluateAssignment = async (assignmentContent, assignmentType, assignmentTitle = "", instructions = "", maxPoints = 100, fileData = null) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    // Constructing a more detailed user prompt for Gemini
    const userPrompt = `
Assignment Title: "${assignmentTitle}"
Assignment Type: ${assignmentType}
Original Instructions: "${instructions}"
Maximum Points: ${maxPoints}

Student's Assignment Content:
---
${assignmentContent}
---

Please evaluate this assignment based on the system guidelines provided.
Focus on providing a numerical grade out of ${maxPoints}, detailed feedback, and actionable recommendations.
    `;

    let requestPayload;

    // Handle different content types (text vs image)
    if (fileData && fileData.type === 'image') {
      // For images, use Gemini's vision capabilities
      requestPayload = {
        contents: [{
          role: "user",
          parts: [
            { text: userPrompt },
            {
              inline_data: {
                mime_type: fileData.mimeType,
                data: fileData.base64
              }
            }
          ]
        }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          // temperature: 0.7,
          // maxOutputTokens: 2048,
          // topP: 0.9,
          // topK: 40,
        }
      };
    } else {
      // For text content, use standard text-based request
      requestPayload = {
        contents: [{
          role: "user",
          parts: [{ text: userPrompt }]
        }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          // temperature: 0.7,
          // maxOutputTokens: 2048,
          // topP: 0.9,
          // topK: 40,
        }
      };
    }

    console.log('Making API request to Gemini...', fileData ? 'with image data' : 'with text data');
    // console.log('Request payload:', JSON.stringify(requestPayload, null, 2)); // Verbose, enable if needed

    const response = await axios.post(
      GEMINI_API_URL,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // console.log('API Response Data:', JSON.stringify(response.data, null, 2)); // Verbose

    const candidate = response.data.candidates?.[0];
    if (!candidate || candidate.finishReason === "SAFETY" || candidate.finishReason === "RECITATION" || candidate.finishReason === "OTHER") {
        let errorMessage = 'No valid content generated by AI.';
        if (candidate?.finishReason) {
            errorMessage = `AI generation stopped due to: ${candidate.finishReason}.`;
            if (candidate.safetyRatings) {
                errorMessage += ` Safety ratings: ${JSON.stringify(candidate.safetyRatings)}`;
            }
        }
        console.error(errorMessage, candidate);
        throw new Error(errorMessage);
    }

    const rawTextResponse = candidate.content?.parts?.[0]?.text;
    if (!rawTextResponse) {
      console.error('No text found in Gemini response candidate part.');
      throw new Error('No feedback text generated by AI.');
    }

    // --- Parse the structured feedback ---
    let grade = null;
    let feedback = ""; // Will be the "DETAILED FEEDBACK" section
    let suggestions = [];

    // 1. Parse Grade
    const gradeMatch = rawTextResponse.match(/^OVERALL GRADE:\s*(\d+)/im);
    if (gradeMatch && gradeMatch[1]) {
      grade = parseInt(gradeMatch[1], 10);
      // Ensure grade is within 0-maxPoints range, though Gemini is asked for 0-100
      // The frontend will display it as grade / maxPoints from submission
      if (grade > 100) grade = 100; // Cap at 100 if Gemini gives more
      if (grade < 0) grade = 0;
    } else {
      console.warn("Could not parse OVERALL GRADE from AI response.");
    }

    // 2. Parse Detailed Feedback
    const detailedFeedbackContent = extractSectionContent(rawTextResponse, "DETAILED FEEDBACK:", "RECOMMENDATIONS:");
    if (detailedFeedbackContent) {
      feedback = detailedFeedbackContent;
    } else {
      console.warn("Could not parse DETAILED FEEDBACK section. Falling back to a larger portion or full response for feedback.");
      // Fallback: try to get content after "AREAS FOR IMPROVEMENT:" and before "CONCLUDING REMARKS:"
      const fallbackFeedback = extractSectionContent(rawTextResponse, "AREAS FOR IMPROVEMENT:", "CONCLUDING REMARKS:");
      feedback = fallbackFeedback || rawTextResponse; // If all else fails, use the whole response
    }

    // 3. Parse Recommendations (Suggestions)
    const recommendationsContent = extractSectionContent(rawTextResponse, "RECOMMENDATIONS:", "CONCLUDING REMARKS:");
    if (recommendationsContent) {
      suggestions = recommendationsContent
        .split('\n')
        .map(line => line.trim().replace(/^-\s*/, '').trim()) // Remove leading hyphens and trim
        .filter(line => line.length > 0); // Remove empty lines
    } else {
      console.warn("Could not parse RECOMMENDATIONS section from AI response.");
    }
    
    // If grade is null but we have text, it means parsing failed.
    // This is a critical failure of the AI to follow instructions.
    if (grade === null && rawTextResponse.length > 50) { // Arbitrary length to indicate some content was returned
        console.error("Failed to parse critical 'OVERALL GRADE' from AI. AI response did not follow structured format. Raw response:", rawTextResponse);
        // We could throw an error here, or return the raw text for manual review
        // For now, let's return what we have, but the grade will be null.
        // The frontend should handle a null grade appropriately.
    }


    return {
      grade, // This will be a number (0-100) or null
      feedback, // This will be the "DETAILED FEEDBACK" string
      suggestions, // This will be an array of strings
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('Error evaluating assignment with Gemini:', error);
    let errorMessage = `Error: ${error.message}`;

    if (error.response) {
      // Axios error with response
      console.error('Gemini API Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        configUrl: error.config?.url,
      });
      const apiError = error.response.data?.error;
      const apiMessage = apiError?.message || error.response.statusText;
      switch (error.response.status) {
        case 400: errorMessage = `Invalid request to AI: ${apiMessage}. Check prompt or payload.`; break;
        case 401:
        case 403: errorMessage = `AI Authentication/Authorization error: ${apiMessage}. Check API Key and permissions.`; break;
        case 404: errorMessage = `AI API endpoint not found (${error.config?.url}). Check configuration.`; break;
        case 429: errorMessage = `AI rate limit exceeded: ${apiMessage}. Try again later.`; break;
        case 500:
        case 503: errorMessage = `AI server error: ${apiMessage}. Try again later.`; break;
        default: errorMessage = `AI API error: ${error.response.status} - ${apiMessage}`;
      }
    } else if (error.request) {
      // Axios error with no response
      console.error('Gemini API No Response:', error.request);
      errorMessage = 'No response from AI server. Check network connection or AI service status.';
    } else {
      // Other errors (e.g., setup, parsing before API call)
      // errorMessage is already set from error.message
    }
    throw new Error(errorMessage); // Re-throw a new error with a more user-friendly or specific message
  }
};