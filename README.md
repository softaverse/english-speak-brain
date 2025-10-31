# EnglishBrain - AI-Powered English Speaking Practice App

An intelligent web application that helps users improve their English speaking skills through AI-powered instant feedback, personalized daily reviews, and comprehensive progress tracking.

## Features

### 🎤 Voice Recording & Practice
- Record English sentences using your device's microphone
- Real-time audio capture with pause/resume functionality
- Instant speech-to-text transcription
- Support for multiple recording sessions

### ✨ AI-Powered Instant Feedback
- Grammar analysis and correction
- Pronunciation evaluation
- Fluency scoring
- Detailed error explanations with examples
- Corrected sentence versions
- Personalized improvement suggestions

### 📚 Daily Review Mode
- Customized exercises based on common mistakes
- Multiple exercise types:
  - Fill in the blank
  - Multiple choice
  - Sentence rewriting
  - Speaking practice
- Progress tracking for daily goals
- Streak tracking to maintain consistency

### 📊 Analytics & Progress Dashboard
- Overall performance metrics
- Score trends over time
- Error type analysis
- Fluency metrics
- Learning insights and recommendations
- Personalized strength and weakness identification

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
english-speak-brain/
├── src/
│   ├── app/                      # Next.js app router pages
│   │   ├── layout.tsx           # Root layout with navigation
│   │   ├── page.tsx             # Home page
│   │   ├── practice/            # Practice page
│   │   ├── review/              # Daily review page
│   │   └── analytics/           # Analytics dashboard
│   │
│   ├── components/              # Shared components
│   │   ├── ui/                  # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Progress.tsx
│   │   └── layout/              # Layout components
│   │       └── Header.tsx
│   │
│   ├── features/                # Feature-based modules
│   │   ├── practice/            # Voice recording & analysis
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   ├── review/              # Daily review exercises
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   └── analytics/           # Progress tracking
│   │       ├── components/
│   │       ├── hooks/
│   │       └── types/
│   │
│   ├── lib/                     # Utilities and services
│   │   ├── api/                 # API client & services
│   │   │   ├── client.ts        # Base API client
│   │   │   ├── practice.ts      # Practice API
│   │   │   ├── review.ts        # Review API
│   │   │   └── analytics.ts     # Analytics API
│   │   ├── hooks/               # Custom React hooks
│   │   │   └── useAudioRecorder.ts
│   │   └── utils/               # Utility functions
│   │       ├── cn.ts            # Class name merger
│   │       └── format.ts        # Formatting utilities
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts            # All shared types
│   │
│   └── styles/                  # Global styles
│       └── globals.css
│
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
cd english-speak-brain
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Update the `.env.local` file with your backend API URL:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build the production application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

## Architecture Highlights

### Feature-Based Organization
The project uses a feature-based architecture where each major feature (practice, review, analytics) is self-contained with its own components, hooks, and types. This makes the codebase:
- Easy to navigate
- Simple to extend with new features
- Maintainable at scale
- Clear separation of concerns

### API Service Layer
All backend communication goes through a centralized API client with:
- Request timeout handling
- Error handling and retry logic
- Type-safe responses
- File upload support
- Centralized configuration

### Custom Hooks
Reusable React hooks encapsulate complex logic:
- `useAudioRecorder`: Manages audio recording state and MediaRecorder API
- Easy to test and reuse across components

### TypeScript Types
Comprehensive type definitions ensure type safety across:
- API requests and responses
- Component props
- State management
- Data models

### Responsive Design
Mobile-first design approach using Tailwind CSS with:
- Responsive grid layouts
- Mobile-optimized navigation
- Touch-friendly UI elements

## API Integration

The frontend expects a backend API with the following endpoints:

### Practice API
- `POST /api/practice/analyze` - Upload audio for analysis
- `GET /api/practice/history` - Get practice history
- `POST /api/practice/session/start` - Start practice session
- `POST /api/practice/session/end` - End practice session

### Review API
- `GET /api/review/today` - Get today's review
- `POST /api/review/submit` - Submit exercise answer
- `POST /api/review/complete` - Mark review as complete

### Analytics API
- `GET /api/analytics/stats` - Get user statistics
- `GET /api/analytics/error-trends` - Get error trends
- `GET /api/analytics/fluency` - Get fluency metrics
- `GET /api/analytics/insights` - Get learning insights
- `GET /api/analytics/progress` - Get progress data

## Browser Support

- Chrome/Edge (recommended for best audio recording support)
- Firefox
- Safari (iOS 14.5+)

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Social features (practice with friends)
- [ ] Gamification (badges, achievements)
- [ ] Offline mode support
- [ ] Mobile app (React Native)
- [ ] Multiple language support
- [ ] Advanced pronunciation analysis with visual feedback
- [ ] Speaking challenges and competitions
- [ ] Integration with popular language learning platforms

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
