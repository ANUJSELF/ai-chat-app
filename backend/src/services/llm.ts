import { Anthropic } from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';
import { User, Message } from '../types';

const provider = process.env.LLM_PROVIDER || 'anthropic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SystemPromptOptions {
  user: User;
  conversationHistory: Message[];
}

function buildSystemPrompt(options: SystemPromptOptions): string {
  const { user, conversationHistory } = options;

  const jobInfo = user.job_title ? `Job Title: ${user.job_title}` : '';
  const interestsInfo = user.interests ? `Interests: ${user.interests}` : '';
  const styleInfo = `Communication Style: ${user.communication_style}`;

  let prompt = `You are a helpful and friendly AI assistant chatting with ${user.name}.

User Profile:
- Name: ${user.name}
${jobInfo ? `- ${jobInfo}` : ''}
${interestsInfo ? `- ${interestsInfo}` : ''}
- ${styleInfo}

Guidelines:
- Personalize your responses based on the user's profile
- Use a ${user.communication_style} tone
- Reference their job title or interests when relevant
- Be helpful, empathetic, and professional
- Keep responses concise unless asked for more detail`;

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
    const messages: ConversationMessage[] = conversationHistory
      .filter((m) => m.sender === 'user' || m.sender === 'assistant')
      .map((m) => ({
        role: m.sender as 'user' | 'assistant',
        content: m.content,
      }));

    messages.push({
      role: 'user',
      content: userMessage,
    });

    if (provider === 'openai') {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: messages as any,
        system: systemPrompt,
        max_tokens: 1024,
        temperature: 0.7,
      });

      return response.choices[0].message.content || 'Unable to generate response';
    } else {
      // Default to Anthropic
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages as any,
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }
      return 'Unable to generate response';
    }
  } catch (error) {
    console.error('LLM Error:', error);
    throw new Error('Failed to generate response');
  }
}
