import Link from 'next/link';
import { Mic, BookOpen, TrendingUp, Sparkles, Target, Brain } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary-100 p-4">
              <Brain className="h-16 w-16 text-primary-600" />
            </div>
          </div>
          <h1 className="mb-4 text-5xl font-bold text-gray-900">
            Master English Speaking with{' '}
            <span className="text-primary-600">AI</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Get instant feedback on your pronunciation, grammar, and fluency. Practice
            anytime, anywhere with personalized AI coaching.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/practice">
              <Button size="lg" className="gap-2">
                <Mic className="h-5 w-5" />
                Start Practicing
              </Button>
            </Link>
            <Link href="/analytics">
              <Button size="lg" variant="outline" className="gap-2">
                <TrendingUp className="h-5 w-5" />
                View Progress
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="mt-2 text-gray-600">
            Three simple steps to improve your English speaking skills
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Feature 1 */}
          <Card variant="elevated">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <Mic className="h-6 w-6 text-primary-600" />
              </div>
              <CardTitle>1. Speak Naturally</CardTitle>
              <CardDescription>
                Record yourself speaking English sentences using your device's microphone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• No scripts or prompts required</li>
                <li>• Practice at your own pace</li>
                <li>• Speak about any topic</li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card variant="elevated">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success-100">
                <Sparkles className="h-6 w-6 text-success-600" />
              </div>
              <CardTitle>2. Get AI Feedback</CardTitle>
              <CardDescription>
                Receive instant analysis of your grammar, pronunciation, and fluency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Detailed error explanations</li>
                <li>• Corrected versions provided</li>
                <li>• Score breakdown by category</li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card variant="elevated">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-warning-100">
                <Target className="h-6 w-6 text-warning-600" />
              </div>
              <CardTitle>3. Practice & Improve</CardTitle>
              <CardDescription>
                Get personalized daily reviews targeting your common mistakes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Customized exercises</li>
                <li>• Track progress over time</li>
                <li>• Build learning streaks</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-12 text-center text-white">
        <h2 className="mb-4 text-3xl font-bold">Ready to improve your English?</h2>
        <p className="mb-8 text-lg text-primary-100">
          Start practicing today and see results in just a few sessions
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/practice">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary-700 hover:bg-gray-100"
            >
              Start Now
            </Button>
          </Link>
          <Link href="/review">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Daily Review
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-8 md:grid-cols-3">
        <div className="text-center">
          <div className="mb-2 text-4xl font-bold text-primary-600">AI-Powered</div>
          <p className="text-gray-600">Advanced speech recognition and analysis</p>
        </div>
        <div className="text-center">
          <div className="mb-2 text-4xl font-bold text-primary-600">Instant</div>
          <p className="text-gray-600">Real-time feedback on your speaking</p>
        </div>
        <div className="text-center">
          <div className="mb-2 text-4xl font-bold text-primary-600">Personalized</div>
          <p className="text-gray-600">Tailored exercises for your needs</p>
        </div>
      </section>
    </div>
  );
}
