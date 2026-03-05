'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Sparkles, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Video, 
  Zap, 
  Copy, 
  Check, 
  Loader2,
  FileText,
  ArrowRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface GeneratedContent {
  twitterThread: string
  linkedinPost: string
  instagramCaption: string
  shortVideoScript: string
  viralHooks: string
}

export default function Home() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content to transform')
      return
    }

    setIsLoading(true)
    setGeneratedContent(null)
    setError(null)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        // Show the actual error message from the API
        const errorMessage = data.error || 'Failed to generate content'
        setError(errorMessage)
        toast.error(errorMessage)
        return
      }

      setGeneratedContent(data)
      toast.success('Content generated successfully!')
    } catch (err) {
      console.error('Error:', err)
      
      let errorMessage = 'Failed to generate content. Please try again.'
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try with shorter content.'
        } else {
          errorMessage = err.message || errorMessage
        }
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const outputSections = [
    {
      id: 'twitterThread',
      title: 'Twitter Thread',
      description: 'Optimized for maximum engagement',
      icon: Twitter,
      color: 'from-sky-500 to-blue-600',
      badge: 'X/Twitter',
    },
    {
      id: 'linkedinPost',
      title: 'LinkedIn Post',
      description: 'Professional and thought-provoking',
      icon: Linkedin,
      color: 'from-blue-600 to-blue-800',
      badge: 'LinkedIn',
    },
    {
      id: 'instagramCaption',
      title: 'Instagram Caption',
      description: 'Visual-focused with hashtags',
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      badge: 'Instagram',
    },
    {
      id: 'shortVideoScript',
      title: 'Short Video Script',
      description: 'Perfect for TikTok & Reels',
      icon: Video,
      color: 'from-red-500 to-orange-500',
      badge: 'Video',
    },
    {
      id: 'viralHooks',
      title: 'Viral Hooks',
      description: 'Attention-grabbing openers',
      icon: Zap,
      color: 'from-yellow-500 to-amber-500',
      badge: 'Hooks',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur-lg opacity-50"></div>
              <div className="relative bg-gradient-to-r from-violet-600 to-fuchsia-600 p-2.5 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                ContentForge AI
              </h1>
              <p className="text-xs text-muted-foreground">Transform content into viral posts</p>
            </div>
          </div>
          <Badge variant="secondary" className="hidden sm:flex gap-1.5 py-1.5 px-3">
            <Sparkles className="w-3 h-3" />
            AI-Powered
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            One Content,{' '}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
              Multiple Platforms
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Paste your content and let AI transform it into platform-optimized posts for Twitter, LinkedIn, Instagram, and more.
          </p>
        </div>

        {/* Input Section */}
        <Card className="max-w-3xl mx-auto mb-10 md:mb-14 border-2 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Your Content</CardTitle>
            </div>
            <CardDescription>
              Paste your blog post, article, idea, or any content you want to transform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your content here... For example: 'I just discovered a game-changing productivity technique that doubled my output in just 2 weeks...'"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[160px] resize-none text-base"
              disabled={isLoading}
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {content.length} characters
              </p>
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !content.trim()}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Content
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && !isLoading && (
          <div className="max-w-3xl mx-auto mb-8">
            <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setError(null)
                    handleGenerate()
                  }}
                  className="ml-4"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Output Sections */}
        {(isLoading || generatedContent) && (
          <div className="space-y-6">
            <div className="text-center">
              <Badge variant="outline" className="px-4 py-1.5 text-sm">
                Generated Content
              </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {outputSections.map((section) => (
                <Card 
                  key={section.id} 
                  className="relative overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  {/* Gradient accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${section.color}`} />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color} bg-opacity-10`}>
                          <section.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{section.title}</CardTitle>
                          <CardDescription className="text-xs">{section.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {section.badge}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                        <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                      </div>
                    ) : generatedContent ? (
                      <div className="relative">
                        <div className="text-sm whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                          {generatedContent[section.id as keyof GeneratedContent]}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopy(
                            generatedContent[section.id as keyof GeneratedContent],
                            section.id
                          )}
                        >
                          {copiedSection === section.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !generatedContent && !error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 mb-4">
              <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Transform</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter your content above and click &quot;Generate Content&quot; to create platform-optimized posts
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Built with AI magic by ContentForge
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Transform your content</span>
              <span>•</span>
              <span>Reach more audiences</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
