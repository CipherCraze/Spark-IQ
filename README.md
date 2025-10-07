# Spark-IQ: AI-Powered Educational Platform

Spark-IQ is a comprehensive educational platform that leverages artificial intelligence to enhance the learning experience for both students and educators. The platform provides intelligent assignment management, automated grading, personalized feedback, and real-time collaboration tools.

## 🚀 Key Features

### For Students

- **Smart Assignment Submissions**: Submit assignments in multiple formats including text, documents, and images
- **AI-Powered Evaluation**: Receive instant feedback and grades for your submissions
- **Image Analysis**: Submit artwork, diagrams, charts, and other visual content for AI evaluation
- **Personalized Feedback**: Get detailed, constructive feedback tailored to your work
- **Progress Tracking**: Monitor your academic performance with comprehensive analytics
- **Real-time Chat**: Connect with teachers and peers through integrated messaging
- **Resource Management**: Access and organize educational materials efficiently

### For Educators

- **Intelligent Assignment Management**: Create and manage assignments with AI-assisted grading
- **Automated Evaluation**: Save time with AI-powered assessment of student work
- **Visual Content Analysis**: Evaluate artwork, diagrams, and visual assignments using AI vision
- **Comprehensive Analytics**: Track student progress and performance metrics
- **Real-time Communication**: Engage with students through integrated chat features
- **Resource Sharing**: Distribute educational materials and announcements easily

## 🖼️ Image Submission & AI Evaluation

Spark-IQ now supports advanced image analysis for assignments:

### Supported Image Formats

- **JPG/JPEG**: Standard photographic images
- **PNG**: High-quality images with transparency support
- **GIF**: Animated images and simple graphics
- **WEBP**: Modern web-optimized images

### AI Vision Capabilities

- **Visual Composition Analysis**: Evaluates design principles and artistic elements
- **Technical Execution Assessment**: Reviews craftsmanship and attention to detail
- **Creativity Evaluation**: Analyzes originality and visual communication effectiveness
- **Assignment Compliance**: Checks adherence to visual problem-solving requirements
- **Color and Form Analysis**: Evaluates use of visual elements and hierarchy

### How It Works

1. **Upload**: Students can upload images up to 10MB in size
2. **Preview**: See a preview of your image before submission
3. **AI Analysis**: The system uses Gemini's vision capabilities to analyze visual content
4. **Instant Feedback**: Receive detailed evaluation including strengths, areas for improvement, and actionable recommendations
5. **Grading**: Get a numerical grade based on visual assessment criteria

## 🛠️ Technology Stack

- **Frontend**: React.js with Vite
- **Backend**: Node.js with Express
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **AI Services**: Google Gemini API for text and vision analysis
- **Authentication**: Firebase Authentication
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Heroicons

## 📁 Supported File Types

### Documents

- PDF files
- Microsoft Word documents (DOC, DOCX)
- Plain text files (TXT)
- Markdown files (MD)

### Images

- JPEG/JPG images
- PNG images with transparency
- GIF animated images
- WEBP modern web images

### Archives

- ZIP compressed files

## 🔧 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/Spark-IQ.git
   cd Spark-IQ
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🎯 Usage

### For Students

1. **Login** to your student account
2. **Browse Assignments** in the assignment submission section
3. **Upload Files** by selecting supported file types
4. **Submit** your work for AI evaluation
5. **Review Feedback** and grades instantly
6. **Track Progress** through the analytics dashboard

### For Educators

1. **Login** to your educator account
2. **Create Assignments** with detailed instructions and rubrics
3. **Upload Resources** to support student learning
4. **Review Submissions** and AI-generated evaluations
5. **Provide Additional Feedback** as needed
6. **Monitor Progress** through comprehensive analytics

## 🤖 AI Integration

Spark-IQ integrates with Google's Gemini API to provide:

- **Text Analysis**: Comprehensive evaluation of written assignments
- **Visual Analysis**: Advanced image assessment for visual content
- **Personalized Feedback**: Tailored recommendations for improvement
- **Grading Consistency**: Standardized evaluation criteria across all submissions

## 📊 Analytics & Reporting

- **Student Performance Tracking**: Monitor individual progress over time
- **Class Analytics**: View overall class performance and trends
- **Assignment Insights**: Analyze submission patterns and common issues
- **Grade Distribution**: Visual representation of class performance

## 🔒 Security & Privacy

- **Secure Authentication**: Firebase Authentication with role-based access
- **Data Encryption**: All data is encrypted in transit and at rest
- **Privacy Protection**: Student data is protected and handled according to educational privacy standards
- **Access Control**: Role-based permissions for students and educators

## 🚀 Deployment

The application is configured for deployment on Vercel with the following features:

- **Automatic Builds**: CI/CD pipeline for seamless deployments
- **Environment Management**: Secure handling of environment variables
- **Performance Optimization**: Optimized for fast loading and smooth interactions
- **Mobile Responsiveness**: Fully responsive design for all devices

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Check our [Documentation](docs/)
- Open an [Issue](https://github.com/yourusername/Spark-IQ/issues)
- Contact our support team

## 🔮 Roadmap

- [ ] Advanced video analysis capabilities
- [ ] Multi-language support
- [ ] Integration with learning management systems
- [ ] Mobile app development
- [ ] Advanced analytics and reporting
- [ ] Collaborative assignment features
- [ ] Real-time collaboration tools

---

**Spark-IQ** - Empowering education through intelligent technology.
