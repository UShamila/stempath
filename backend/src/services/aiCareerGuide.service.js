import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';

export default function AICareerGuide() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Career Guide. I can help you discover the best STEM learning path based on your interests and goals. Tell me about what excites you in technology, or ask me about any STEM career!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const conversationHistory = [...messages, userMsg].map(m => `${m.role}: ${m.content}`).join('\n');

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI Career Guide for STEMPath, a STEM education platform focused on helping students (especially African women) pursue careers in technology and science.

Based on the conversation below, provide helpful career guidance. You can:
- Ask about their interests, skills, and goals
- Recommend specific STEM career paths
- Suggest learning paths and courses (from: Programming Fundamentals, Web Development, Databases, Backend Development, AI Basics, Cybersecurity, Data Science, Cloud Computing)
- Explain what skills are needed for different roles
- Provide motivational guidance

Example career paths you can recommend:
- Backend Developer: Programming Fundamentals → JavaScript → Node.js → Databases → API Development
- Data Scientist: Programming Fundamentals → Python → Statistics → Machine Learning → Data Visualization
- Cybersecurity Analyst: Networking Basics → Operating Systems → Security Fundamentals → Ethical Hacking
- AI Engineer: Programming → Mathematics → Machine Learning → Deep Learning → AI Applications

Keep responses concise but helpful. Use markdown formatting.

Conversation:
${conversationHistory}

Respond as the AI Career Guide:`,
    });

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  const quickPrompts = [
    "I want to become a Backend Developer",
    "What should I learn for Data Science?",
    "I'm interested in Cybersecurity",
    "Help me choose a career path",
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Career Guide</h1>
          <p className="text-sm text-muted-foreground">Get personalized STEM career recommendations</p>
        </div>
      </div>

      {messages.length === 1 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {quickPrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => { setInput(prompt); }}
              className="text-left p-4 rounded-xl border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
            >
              <Sparkles className="h-4 w-4 text-primary mb-2" />
              {prompt}
            </button>
          ))}
        </div>
      )}

      <Card className="border-0 shadow-sm flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-2 shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm
                ${msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>

        <div className="p-3 border-t">
          <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
            <Input
              placeholder="Ask about STEM careers..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

module.exports = new AICareerGuide();
