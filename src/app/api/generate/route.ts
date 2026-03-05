import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Set max duration for Vercel/Netlify

const SYSTEM_PROMPT = `You are an expert social media content creator and copywriter. Your task is to transform given content into multiple platform-optimized posts.

For each platform, follow these specific guidelines:

**Twitter Thread:**
- Create a compelling thread (3-5 tweets)
- Each tweet should be under 280 characters
- Start with a strong hook
- Use engaging language and emojis
- End with a call-to-action or question

**LinkedIn Post:**
- Professional yet conversational tone
- Start with an attention-grabbing opening
- Use line breaks for readability
- Include relevant insights or lessons
- End with a thought-provoking question or call-to-action
- Keep it substantive but scannable

**Instagram Caption:**
- Engaging hook in the first line
- Tell a story or share value
- Include relevant hashtags (8-12)
- Use emojis strategically
- End with a question or CTA for engagement

**Short Video Script:**
- Create a 30-60 second script
- Start with a hook in the first 3 seconds
- Include visual cues in [brackets]
- Keep sentences short and punchy
- End with a strong CTA

**Viral Hooks:**
- Generate 5 attention-grabbing opening lines
- Each hook should be unique in style
- Make them scroll-stopping
- Use proven psychological triggers (curiosity, controversy, value, etc.)

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format, with no additional text before or after:
{
  "twitterThread": "Tweet 1\\n\\nTweet 2\\n\\nTweet 3...",
  "linkedinPost": "The LinkedIn post content...",
  "instagramCaption": "Caption with hashtags...",
  "shortVideoScript": "[Visual: ...]\\nScript text...",
  "viralHooks": "1. Hook one\\n2. Hook two\\n3. Hook three\\n4. Hook four\\n5. Hook five"
}`

async function generateWithOpenAI(content: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Transform this content into platform-optimized posts:\n\n${content}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: 'json_object' }, // Force JSON response
    })

    return completion.choices[0]?.message?.content
  } catch (error: unknown) {
    console.error('OpenAI API Error:', error)
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('Invalid OpenAI API key. Please check your API key.')
      }
      if (error.message.includes('429')) {
        throw new Error('OpenAI rate limit exceeded. Please try again in a moment.')
      }
      if (error.message.includes('insufficient_quota')) {
        throw new Error('OpenAI quota exceeded. Please check your billing.')
      }
    }
    
    throw new Error('OpenAI API error. Please try again.')
  }
}

async function generateWithZAI(content: string): Promise<string | null> {
  try {
    // Dynamic import for z-ai-web-dev-sdk (only works in Z.ai sandbox)
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    
    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Transform this content into platform-optimized posts:\n\n${content}`,
        },
      ],
      thinking: { type: 'disabled' },
    })

    return completion.choices[0]?.message?.content
  } catch (error) {
    console.error('ZAI SDK Error:', error)
    throw error
  }
}

function parseGeneratedContent(responseText: string | null | undefined) {
  if (!responseText) {
    return null
  }

  try {
    // Clean up the response - remove any markdown code blocks if present
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7)
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3)
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3)
    }

    return JSON.parse(cleanedResponse.trim())
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError)
    console.error('Response text:', responseText.substring(0, 500))
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: 'Content must be at least 10 characters long' },
        { status: 400 }
      )
    }

    if (content.trim().length > 5000) {
      return NextResponse.json(
        { error: 'Content is too long. Please limit to 5000 characters.' },
        { status: 400 }
      )
    }

    let responseText: string | null | undefined
    let usedProvider = ''

    // Try OpenAI first if configured (for external deployment)
    // Fall back to ZAI SDK (for Z.ai sandbox)
    if (process.env.OPENAI_API_KEY) {
      console.log('Using OpenAI API for content generation')
      usedProvider = 'OpenAI'
      try {
        responseText = await generateWithOpenAI(content)
        console.log('OpenAI succeeded')
      } catch (openaiError) {
        console.error('OpenAI Error:', openaiError)
        const errorMessage = openaiError instanceof Error ? openaiError.message : 'OpenAI API error'
        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        )
      }
    } else {
      // Try ZAI SDK (works in Z.ai sandbox)
      console.log('Trying ZAI SDK for content generation')
      usedProvider = 'ZAI'
      try {
        responseText = await generateWithZAI(content)
        console.log('ZAI SDK succeeded')
      } catch (zaiError) {
        console.error('ZAI SDK Error:', zaiError)
        return NextResponse.json(
          { error: 'AI service not available. For external deployment, please configure OPENAI_API_KEY environment variable in your hosting platform.' },
          { status: 500 }
        )
      }
    }

    const generatedContent = parseGeneratedContent(responseText)

    if (!generatedContent) {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    // Validate the response structure
    const requiredFields = ['twitterThread', 'linkedinPost', 'instagramCaption', 'shortVideoScript', 'viralHooks']
    const missingFields = requiredFields.filter(field => 
      !generatedContent[field] || typeof generatedContent[field] !== 'string'
    )

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `AI response missing fields: ${missingFields.join(', ')}. Please try again.` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...generatedContent,
      _provider: usedProvider, // For debugging
    })
  } catch (error) {
    console.error('API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while generating content'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
