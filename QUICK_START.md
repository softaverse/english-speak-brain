# Quick Start Guide

## Project Overview

A complete Next.js frontend for an AI-powered English speaking practice app with:
- Voice recording and instant AI feedback
- Daily review exercises
- Progress analytics and tracking
- Modern, responsive UI with Tailwind CSS

## Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

## Project Structure

```
src/
├── app/                          # Next.js pages (App Router)
│   ├── page.tsx                 # Home page
│   ├── practice/page.tsx        # Voice recording & practice
│   ├── review/page.tsx          # Daily review exercises
│   └── analytics/page.tsx       # Progress dashboard
│
├── features/                     # Feature modules
│   ├── practice/                # Voice recording feature
│   ├── review/                  # Daily review feature
│   └── analytics/               # Analytics dashboard
│
├── components/
│   ├── ui/                      # Reusable UI components
│   └── layout/                  # Layout components
│
├── lib/
│   ├── api/                     # API client services
│   ├── hooks/                   # Custom React hooks
│   └── utils/                   # Utility functions
│
└── types/                       # TypeScript definitions
```

## Key Features Implemented

### 1. Voice Recording (`/practice`)
- MediaRecorder API integration
- Real-time audio capture
- Pause/resume functionality
- Audio upload to backend

**Key Files:**
- `src/lib/hooks/useAudioRecorder.ts` - Recording logic
- `src/features/practice/components/VoiceRecorder.tsx` - UI component
- `src/features/practice/components/AnalysisFeedback.tsx` - Results display

### 2. Daily Review (`/review`)
- Exercise types: multiple choice, fill-in-blank, rewrite, speaking
- Progress tracking
- Score calculation
- Exercise navigation

**Key Files:**
- `src/features/review/components/DailyReviewPage.tsx` - Main page
- `src/features/review/components/ExerciseCard.tsx` - Exercise UI

### 3. Analytics Dashboard (`/analytics`)
- Progress charts (Recharts)
- Error trend analysis
- Fluency metrics
- Learning insights

**Key Files:**
- `src/features/analytics/components/AnalyticsDashboard.tsx` - Main dashboard
- `src/features/analytics/components/ProgressChart.tsx` - Line chart
- `src/features/analytics/components/ErrorTrendsChart.tsx` - Bar chart

## API Integration

The app expects a backend API at `NEXT_PUBLIC_API_BASE_URL`. Update `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Required Endpoints

**Practice API:**
- `POST /api/practice/analyze` - Upload audio
- `GET /api/practice/history` - Get history

**Review API:**
- `GET /api/review/today` - Get daily review
- `POST /api/review/submit` - Submit answer

**Analytics API:**
- `GET /api/analytics/stats` - User statistics
- `GET /api/analytics/error-trends` - Error trends
- `GET /api/analytics/progress` - Progress data

See `src/lib/api/` for complete API interface definitions.

## Extending the App

### Adding a New Feature

1. Create feature directory:
```
src/features/my-feature/
├── components/
├── hooks/
└── types/
```

2. Add API service:
```typescript
// src/lib/api/my-feature.ts
export async function myApiCall() { ... }
```

3. Create page route:
```typescript
// src/app/my-feature/page.tsx
export default function MyFeature() { ... }
```

4. Add navigation link in `src/components/layout/Header.tsx`

### Adding a New UI Component

Create in `src/components/ui/`:
```typescript
// src/components/ui/MyComponent.tsx
import { cn } from '@/lib/utils';

export default function MyComponent({ className, ...props }) {
  return <div className={cn('base-styles', className)} {...props} />;
}
```

### Adding New Types

Add to `src/types/index.ts`:
```typescript
export interface MyNewType {
  id: string;
  name: string;
}
```

## Browser Compatibility

- Chrome/Edge: Full support (recommended)
- Firefox: Full support
- Safari: iOS 14.5+ for audio recording
- Mobile: Responsive design, works on all modern mobile browsers

## Tips for Development

1. **Hot Reload**: Changes auto-reload in dev mode
2. **Type Safety**: Run `npm run type-check` before committing
3. **API Mocking**: Mock API responses in components during development
4. **Component Testing**: Use browser DevTools to test components

## Common Issues

**Audio recording not working:**
- Check HTTPS (required for microphone access)
- Grant microphone permissions in browser
- Test in Chrome/Edge for best compatibility

**API errors:**
- Verify `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Check backend server is running
- Inspect Network tab in DevTools

**Build errors:**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

## Next Steps

1. Set up your backend API server
2. Configure environment variables
3. Test voice recording in browser
4. Customize the UI theme in `tailwind.config.ts`
5. Add authentication (if needed)

For more details, see the main [README.md](./README.md).
