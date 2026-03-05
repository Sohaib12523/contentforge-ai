import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

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

Respond with a valid JSON object in this exact format:
{
  "twitterThread": "Tweet 1\\n\\nTweet 2\\n\\nTweet 3...",
  "linkedinPost": "The LinkedIn post content...",
  "instagramCaption": "Caption with hashtags...",
  "shortVideoScript": "[Visual: ...]\\nScript text...",
  "viralHooks": "1. Hook one\\n2. Hook two\\n3. Hook three\\n4. Hook four\\n5. Hook five"
}

Important: Return ONLY valid JSON, no additional text or markdown.`

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

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Generate content using LLM
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `Transform this content into platform-optimized posts:\n\n${content}`
        }
      ],
      thinking: { type: 'disabled' }
    })

    const responseText = completion.choices[0]?.message?.content

    if (!responseText) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      )
    }

    // Parse the JSON response
    let generatedContent
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
      
      generatedContent = JSON.parse(cleanedResponse.trim())
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      console.error('Response text:', responseText)
      return NextResponse.json(
        { error: 'Failed to parse generated content' },
        { status: 500 }
      )
    }

    // Validate the response structure
    const requiredFields = ['twitterThread', 'linkedinPost', 'instagramCaption', 'shortVideoScript', 'viralHooks']
    for (const field of requiredFields) {
      if (!generatedContent[field] || typeof generatedContent[field] !== 'string') {
        return NextResponse.json(
          { error: `Missing or invalid field: ${field}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(generatedContent)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while generating content' },
      { status: 500 }
    )
  }
}
