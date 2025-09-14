# 📱 Lexipic

**A revolutionary language learning app that transforms everyday moments into personalized learning experiences through computer vision and AI.**

![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

---

## 🌟 Inspiration

We wanted to move away from the traditional "flashcards and textbooks" approach to language learning. Language is rarely encountered in such a straightforward, un-contextualized manner, and recent research in cognition shows the importance of **multimodal situational experiences** in building semantic meaning for a language learner. 

These ideas led us to design **Lexipic**—an app that integrates our everyday world into a dynamic language-learning playground. Inspired by recent advances in computer vision, image understanding, and natural language processing, we combine multiple domains and provide a personalized, contextualized language-learning environment.

## 🚀 What it does

- **📷 Real-time Object Recognition**: Uses the phone's camera to recognize objects in real time through advanced computer vision
- **🧠 Contextual Quizzes**: Generates personalized questions based on what you're looking at, asking you to identify or describe objects in your target language
- **🎯 Multi-language Support**: Currently supports Spanish, Japanese, and Chinese with contextually appropriate questions
- **🎮 Gamified Learning**: Includes progress tracking and makes practice feel like a game rather than a chore
- **⚡ Instant Feedback**: Provides immediate evaluation and constructive feedback on your answers
- **🔄 Adaptive Difficulty**: Questions adapt to your proficiency level for optimal learning

## 🛠️ Tech Stack

### Frontend
- **React Native** with **Expo** for cross-platform mobile development
- **TypeScript** for type safety and better development experience
- **Expo Camera** for real-time image capture
- **Expo Image** for optimized image handling
- **React Native AsyncStorage** for local data persistence

### Backend
- **Node.js** with **Express.js** for RESTful API
- **TypeScript** for consistent typing across the stack
- **Supabase** for database and authentication
- **Python** for AI/ML image processing and question generation
- **Sharp** for image processing and optimization
- **JWT** for secure authentication

### AI & Machine Learning
- **Computer Vision APIs** for object recognition and segmentation
- **Claude AI** for generating contextually appropriate questions
- **Natural Language Processing** for adaptive difficulty and feedback generation

### DevOps & Tooling
- **Git** for version control
- **npm/Node Package Manager** for dependency management
- **ESLint** for code quality
- **Nodemon** for development

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Node.js API   │    │   Python ML     │
│   Frontend      │◄──►│   Server        │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • Camera        │    │ • Authentication│    │ • Image Analysis│
│ • UI/UX         │    │ • Image Upload  │    │ • Question Gen  │
│ • State Mgmt    │    │ • Quiz Logic    │    │ • AI Processing │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   Supabase      │
                       │   Database      │
                       │                 │
                       │ • User Data     │
                       │ • Progress      │
                       │ • Analytics     │
                       └─────────────────┘
```

## 🏃‍♂️ How we built it

We built Lexipic using **React Native with Expo Go** for fast prototyping and deployment. We integrated **computer vision APIs** for object recognition and connected the results to our custom quiz logic. The UI was designed to be lightweight, intuitive, and mobile-friendly to keep the focus on the learning experience.

### Development Process
1. **Rapid Prototyping**: Used Expo for quick iterations and testing
2. **API-First Design**: Built a robust backend API to handle image analysis
3. **AI Integration**: Connected multiple AI services for vision and language processing
4. **User-Centered Design**: Focused on intuitive UX for seamless learning

## 👥 Individual Contributions

- **Jaime**: Built the frontend with React Native, designed the UX/UI, and implemented the backend API
- **David**: Developed the computer vision models for object segmentation and integrated them into the app  
- **Hannah**: Leveraged Claude AI to generate contextually appropriate questions and adaptive difficulty levels for quizzes

## 💪 Challenges we ran into

- **Performance Optimization**: Ensuring object recognition was fast and accurate enough for a smooth user experience
- **UX Balance**: Balancing simplicity and gamification—too much complexity made the app clunky, while too little made it feel like a demo
- **Technical Integration**: Integrating multiple APIs within the constraints of Expo Go
- **Cross-platform Compatibility**: Ensuring consistent behavior across iOS and Android
- **Real-time Processing**: Managing the complexity of real-time image analysis and question generation

## 🏆 Accomplishments that we're proud of

- **🎨 Intuitive Design**: Creating a clean, intuitive UI that makes language learning engaging and easy to use
- **🔗 Seamless Integration**: Building a working prototype that seamlessly connects real-world objects to language quizzes
- **🌍 Immersive Learning**: Making language learning feel immersive and fun, instead of abstract and disconnected
- **📱 Mobile Excellence**: Successfully integrating real-time object recognition in a mobile app with excellent performance
- **🤖 AI Innovation**: Leveraging cutting-edge AI for personalized, contextual language learning

## 📚 What we learned

- **🌍 Context Matters**: The importance of designing for real-world contexts, not just in-app interactions
- **⚡ Rapid Development**: How to rapidly prototype with Expo Go and integrate external APIs effectively
- **🎮 True Gamification**: That gamification isn't just points and badges—it's about keeping users engaged through meaningful interaction
- **🔧 Technical Integration**: Managing complex integrations between computer vision, AI, and mobile development
- **👥 User Research**: The value of user feedback in creating truly useful language learning tools

## 🔮 What's next for Lexipic

### Short Term
- **🌐 Language Expansion**: Adding support for more languages and expanding vocabulary databases
- **🎤 Speech Recognition**: Implementing spoken answers, not just text input, for pronunciation practice
- **🎯 Enhanced Gamification**: Building comprehensive levels, streaks, and reward systems

### Medium Term  
- **👥 Social Features**: Adding multiplayer or collaborative learning features
- **📊 Advanced Analytics**: Detailed progress tracking and personalized learning insights
- **🔧 Offline Mode**: Enabling core functionality without internet connectivity

### Long Term
- **🥽 AR Integration**: Potentially integrating with Augmented Reality to make the experience even more immersive
- **🧠 Advanced AI**: More sophisticated AI tutoring and adaptive learning algorithms
- **🏫 Educational Partnerships**: Integration with schools and language learning institutions

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Expo CLI
- Python 3.8+
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/lexipic.git
   cd lexipic
   ```

2. **Backend Setup**
   ```bash
   cd backend/api
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend/expo-fe
   npm install
   cp .env.example .env
   # Configure your API URL
   npx expo start
   ```

4. **Python Services Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Environment Variables

Create `.env` files in the appropriate directories with:

**Backend API (.env)**
```
PORT=3000
DATABASE_URL=your_supabase_url
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
```

**Frontend (.env)**
```
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000/api
```

## 📖 Documentation

- [Mobile Setup Guide](MOBILE_SETUP.md)
- [Backend API Documentation](backend/api/README.md)
- [Frontend Documentation](frontend/expo-fe/README.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Claude AI** for intelligent question generation
- **Expo Team** for amazing mobile development tools
- **Supabase** for seamless backend infrastructure
- **React Native Community** for excellent libraries and support

---

**Made with ❤️ by the Lexipic Team**

*Transforming everyday moments into language learning opportunities.*