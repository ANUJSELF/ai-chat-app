import OpenAI from 'openai';
import { User, Message } from '../types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface SystemPromptOptions {
  user: User;
  conversationHistory: Message[];
}

function buildSystemPrompt(options: SystemPromptOptions): string {
  const { user, conversationHistory } = options;
  const jobInfo = user.job_title ? `Job Title: ${user.job_title}` : '';
  const interestsInfo = user.interests ? `Interests: ${user.interests}` : '';
  const styleInfo = `Communication Style: ${user.communication_style || 'professional'}`;

  let prompt = `You are a helpful, friendly AI assistant chatting with ${user.name}.

User Profile:
- Name: ${user.name}
${jobInfo ? `- ${jobInfo}` : ''}
${interestsInfo ? `- ${interestsInfo}` : ''}
- ${styleInfo}

Guidelines:
- Personalize your responses based on the user's profile
- Use a ${user.communication_style || 'professional'} tone
- Reference their job title or interests when relevant
- Be helpful, empathetic, and concise unless asked for more detail`;

  if (conversationHistory.length > 0) {
    const recentMessages = conversationHistory.slice(-10);
    prompt += `\n\nRecent conversation context:`;
    recentMessages.forEach((msg) => {
      const sender = msg.sender === 'user' ? user.name : 'Assistant';
      prompt += `\n${sender}: ${msg.content}`;
    });
  }

  return prompt;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateResponse(
  userMessage: string,
  user: User,
  conversationHistory: Message[]
): Promise<string> {
  try {
    const systemPrompt = buildSystemPrompt({ user, conversationHistory });

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
        .filter((m) => m.sender === 'user' || m.sender === 'assistant')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      { role: 'user', content: userMessage },
    ];

    // Call OpenAI Chat Completion API
    const resp = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages as any,
      max_tokens: 1024,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    });

    const content = resp.choices?.[0]?.message?.content as string | undefined;
    return content ?? 'Unable to generate response at the moment.';
  } catch (error) {
    console.error('OpenAI LLM Error:', error);
    throw new Error('Failed to generate response');
  }
}
