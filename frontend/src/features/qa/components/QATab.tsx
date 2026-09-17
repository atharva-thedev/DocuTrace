import React, { useState, useRef, useEffect } from 'react';
import { QAMessage, QACitation } from '../../../types';
import { qaApi } from '../api/qaApi';
import { CitationBadge } from './CitationBadge';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { sanitizeHtml } from '../../../utils/sanitize';

interface QATabProps {
  documentId: string;
  onSelectCitation?: (citation: QACitation) => void;
  onJumpToCitation?: (pageNumber: number) => void;
}

export const QATab: React.FC<QATabProps> = ({ documentId, onSelectCitation, onJumpToCitation }) => {
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isQuerying]);

  // Load existing threads for this document
  useEffect(() => {
    const loadThreads = async () => {
      try {
        const threads = await qaApi.listThreads(documentId);
        if (threads.length > 0) {
          const latest = threads[0];
          setThreadId(latest.id);
          setMessages(latest.messages || []);
        }
      } catch {
        // First time opening QA on this document
      }
    };
    if (documentId) loadThreads();
  }, [documentId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isQuerying) return;

    const userQuery = prompt.trim();
    setPrompt('');

    // Optimistically push user message
    const tempUserMsg: QAMessage = {
      id: `user-${Date.now()}`,
      thread_id: threadId || '',
      sender_type: 'user',
      content: userQuery,
      citations: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsQuerying(true);

    try {
      const response = await qaApi.query({
        query: userQuery,
        document_id: documentId,
        thread_id: threadId,
      });

      setThreadId(response.thread_id);
      setMessages((prev) => [...prev, response]);
    } catch {
      const errorMsg: QAMessage = {
        id: `err-${Date.now()}`,
        thread_id: threadId || '',
        sender_type: 'assistant',
        content:
          'Sorry, an error occurred while searching document embeddings or processing your question. Please verify your connection and try again.',
        citations: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsQuerying(false);
    }
  };

  const sampleQuestions = [
    'What is the total invoice amount and due date?',
    'Are there any penalty or indemnity clauses?',
    'What are the payment milestone terms?',
  ];

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center mb-3 shadow-sm">
              <Bot className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Query Document Evidence</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
              DocuTrace searches vector embeddings and returns answers strictly grounded in document evidence with page citations.
            </p>

            <div className="mt-6 space-y-2 w-full max-w-xs text-left">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 px-1">Suggested Inquiries</p>
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(q);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#0E131F] dark:border-slate-800 dark:hover:border-blue-500/50 dark:hover:bg-slate-800/60 text-xs dark:text-slate-200 text-left transition cursor-pointer shadow-sm"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender_type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender_type === 'assistant' && (
                <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm font-bold">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-4 space-y-2.5 shadow-sm ${
                  msg.sender_type === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm font-medium shadow-blue-500/20'
                    : 'bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.content) }}
                  className="whitespace-pre-wrap font-sans"
                />

                {/* Evidence Citations Badges */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Grounded Evidence:
                    </span>
                    {msg.citations.map((citation, cIdx) => (
                      <CitationBadge
                        key={cIdx}
                        citation={citation}
                        onClick={(c) => {
                          if (onSelectCitation) onSelectCitation(c);
                          if (onJumpToCitation && c.page_number) onJumpToCitation(c.page_number);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {msg.sender_type === 'user' && (
                <div className="h-7 w-7 rounded-lg bg-slate-800 text-white dark:bg-slate-800 dark:text-white border dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isQuerying && (
          <div className="flex gap-3 text-xs leading-relaxed items-center">
            <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-2 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span>Analyzing embeddings & grounding citations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Prompt Box */}
      <form onSubmit={handleSend} className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a question about this document..."
          disabled={isQuerying}
          className="flex-1 rounded-xl bg-white dark:bg-[#080C13] border border-slate-300 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none transition disabled:opacity-50 shadow-sm"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isQuerying}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};
