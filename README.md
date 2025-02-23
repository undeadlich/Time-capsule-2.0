# ⏳ Time Capsule 2.0

> A modern platform for creating and sharing digital time capsules and albums with AI-powered features.

## 🔗 Table of Contents
-   [📌 Overview](#-overview)
-   [👾 Features](#-features)
-   [📁 Project Structure](#-project-structure)
-   [💻 Code Overview](#-code-overview)
-   [🚀 Getting Started](#-getting-started)
    -   [☑️ Prerequisites](#️-prerequisites)
    -   [⚙️ Installation](#️-installation)
-   [🤖 Usage](#-usage)

## 📌 Overview

Time Capsule 2.0 is a sophisticated digital platform that allows users to create, manage, and share meaningful memories through time capsules and albums. With advanced AI features and a focus on user privacy, it offers a unique way to preserve and share your special moments.

## 👾 Features

✨ **Core Features**
- **Time Capsules**: Create digital time capsules to preserve your memories
- **Smart Albums**: Organize your content with private and public albums
- **Selective Sharing**: Share albums and capsules with specific recipients
- **Time Lock**: Set specific release dates for your capsules (perfect for anniversaries, birthdays, etc.)

🎯 **Advanced Capabilities**
- **AI-Powered Image Search**: Find specific images across public albums
- **Description-Based Search**: Locate images in your albums using natural language descriptions
- **NSFW Content Filter**: Automatic filtering system to maintain a safe environment
- **Community Features**: Group similar albums and connect with like-minded users

⚡ **User Experience**
- **Editable Albums**: Flexible album management for better organization
- **User-Friendly Forms**: Intuitive interfaces for creating albums and capsules
- **Real-Time Updates**: Instant feedback and live preview features

## 📁 Project Structure
```sh
└── Time-capsule-2.0/
    ├── Desc Search AI/          # AI-powered image description search
    │   ├── app.py
    │   └── test.ipynb
    ├── NSFW-FILTER/            # Content safety filtering system
    │   ├── app.py
    │   └── test.ipynb
    ├── README.md
    └── TimeCapsule/            # Main application
        ├── .gitignore
        ├── README.md
        ├── eslint.config.js
        ├── index.html
        ├── package-lock.json
        ├── package.json
        ├── public/
        ├── src/
        └── vite.config.js
```

## 💻 Code Overview

### Frontend Architecture (TimeCapsule/)

#### 🎨 Components Structure
```sh
src/
├── components/
│   ├── Album/              # Album-related components
│   ├── TimeCapsule/       # Time capsule components
│   ├── Auth/              # Authentication components
│   └── Shared/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── services/             # API and service integrations
└── utils/                # Utility functions
```

#### 🔧 Key Technologies
- **Frontend Framework**: React + Vite
- **State Management**: React Context/Redux
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **API Integration**: Axios

### AI Services

#### 📷 NSFW Filter (NSFW-FILTER/)
```python
# Key Components in app.py
- Image preprocessing
- Model inference
- Content classification
- API endpoints for integration
```

#### 🔍 Descriptive Search (Desc Search AI/)
```python
# Key Components in app.py
- Natural language processing
- Image feature extraction
- Similarity matching
- Search API endpoints
```

### 🔌 API Integration Points

#### Frontend to Backend Communication
```javascript
// Example API structure
/api/
  ├── albums/           // Album management
  ├── capsules/         // Time capsule operations
  ├── search/           // Image search functionality
  └── users/            // User management
```

#### AI Service Integration
```javascript
// Integration endpoints
/ai/
  ├── nsfw-check       // Content safety verification
  └── image-search     // Descriptive image search
```

## 🚀 Getting Started

### ☑️ Prerequisites

Before diving into Time-capsule-2.0, ensure your environment meets these requirements:

| Requirement | Version/Description |
|------------|-------------------|
| JavaScript | ES6 or higher |
| Node.js | Latest LTS version |
| npm | Package manager |
| Python | 3.8 or higher (for AI features) |

### ⚙️ Installation

#### **Build from source:**

1. **Clone the repository**
   ```sh
   git clone https://github.com/undeadlich/Time-capsule-2.0
   ```

2. **Navigate to the project**
   ```sh
   cd Time-capsule-2.0/TimeCapsule
   ```

3. **Install dependencies**
   ```sh
   npm install
   ```

## 🤖 Usage

### Running the Application

1. **Launch the Frontend**
   ```sh
   npm run dev
   ```

2. **Start the NSFW Detector AI**
   ```sh
   cd ..
   cd NSFW-FILTER
   python app.py   # or python3 app.py
   ```

3. **Launch the Descriptive Image Search AI**
   ```sh
   cd ..
   cd Desc Search Ai
   python app.py   # or python3 app.py
   ```

---
*Built with ❤️ by the Time Capsule team*
