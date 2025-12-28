'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Book, FileText, AlertCircle } from 'lucide-react';

/**
 * 3-Mode Command Chatbot for Incident Replay Engine
 * Mode 1: Command - Execute deterministic scene commands
 * Mode 2: Coach - Answer "how-to" questions
 * Mode 3: Report - Generate incident reports
 */

export type ChatbotMode = 'command' | 'coach' | 'report';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  mode?: ChatbotMode;
  error?: boolean;
}

export interface CommandChatbotProps {
  onCommand?: (command: string) => Promise<{ success: boolean; message: string }>;
  initialMode?: ChatbotMode;
}

export function CommandChatbot({ onCommand, initialMode = 'command' }: CommandChatbotProps) {
  const [mode, setMode] = useState<ChatbotMode>(initialMode);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'system',
      content: 'Command mode: Enter deterministic commands like "add forklift at (10, 20)" or "move truck to (30, 40)". No assumptions, no inference.',
      timestamp: Date.now(),
      mode: 'command'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleModeChange = (newMode: ChatbotMode) => {
    setMode(newMode);

    const modeMessages: Record<ChatbotMode, string> = {
      command: 'Command mode: Enter deterministic commands like "add forklift at (10, 20)" or "move truck to (30, 40)". No assumptions, no inference.',
      coach: 'Coach mode: Ask "how-to" questions like "How do I add a keyframe?" or "How do I change playback speed?"',
      report: 'Report mode: Request incident reports like "Generate timeline summary" or "Export keyframe descriptions"'
    };

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        role: 'system',
        content: `Switched to ${newMode} mode. ${modeMessages[newMode]}`,
        timestamp: Date.now(),
        mode: newMode
      }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
      mode
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      let response: string;

      if (mode === 'command') {
        // Execute command
        if (onCommand) {
          const result = await onCommand(input.trim());
          response = result.success
            ? `✓ ${result.message}`
            : `✗ ${result.message}`;
        } else {
          response = parseCommandResponse(input.trim());
        }
      } else if (mode === 'coach') {
        response = generateCoachResponse(input.trim());
      } else {
        response = generateReportResponse(input.trim());
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
          mode
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now(),
          mode,
          error: true
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700">
      {/* Mode selector */}
      <div className="bg-gray-800 border-b border-gray-700 p-3">
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('command')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === 'command'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Command
          </button>
          <button
            onClick={() => handleModeChange('coach')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === 'coach'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Book className="w-4 h-4" />
            Coach
          </button>
          <button
            onClick={() => handleModeChange('report')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === 'report'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            Report
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.role === 'system'
                  ? 'bg-gray-700 text-gray-300 italic'
                  : msg.error
                  ? 'bg-red-900 bg-opacity-30 border border-red-700 text-red-400'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            placeholder={
              mode === 'command'
                ? 'Enter command...'
                : mode === 'coach'
                ? 'Ask a question...'
                : 'Request report...'
            }
            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Parse command and generate deterministic response
 */
function parseCommandResponse(command: string): string {
  const lower = command.toLowerCase();

  // Add object
  if (lower.startsWith('add ')) {
    return `✓ To add an object: Click the asset in the left palette, then place it on the canvas.\n\nCommand syntax requires explicit parameters. Use the asset palette for object placement.`;
  }

  // Move object
  if (lower.includes('move ')) {
    return `✓ To move an object: Select it on canvas and drag, or use the Property Panel to enter exact coordinates.\n\nExample: Select "Forklift-1" → Property Panel → Position: (25.5, 30.2) meters`;
  }

  // Rotate object
  if (lower.includes('rotate ')) {
    return `✓ To rotate an object: Select it → Property Panel → Rotation slider or input exact degrees (0-360).\n\nExample: Set rotation to 45° for northeast heading`;
  }

  // Add keyframe
  if (lower.includes('keyframe')) {
    return `✓ To add keyframe: Double-click the timeline scrubber at the desired timestamp.\n\nKeyframes capture object positions at specific times for interpolated playback.`;
  }

  // Playback
  if (lower.includes('play') || lower.includes('animation')) {
    return `✓ Timeline controls:\n- Play/Pause: Start/stop animation\n- Speed: 0.25x, 0.5x, 1x, 2x, 4x\n- Step: Frame-by-frame navigation\n- Scrubber: Drag to seek to specific time`;
  }

  // Default response
  return `⚠ Command not recognized. Available actions:\n\n- Add object: Use asset palette (left sidebar)\n- Move object: Drag on canvas or use Property Panel\n- Rotate object: Property Panel rotation slider\n- Add keyframe: Double-click timeline\n- Playback: Use timeline controls (bottom)\n\nNo assumptions are made. All commands require explicit parameters.`;
}

/**
 * Generate coach response for "how-to" questions
 */
function generateCoachResponse(question: string): string {
  const lower = question.toLowerCase();

  if (lower.includes('keyframe')) {
    return `To add a keyframe:\n1. Position objects where you want them at this timestep\n2. Double-click the timeline scrubber at the desired time\n3. Keyframe will appear as a blue diamond\n4. Hover to see label, click X to delete\n\nKeyframes define object positions at specific times. The engine interpolates between keyframes during playback.`;
  }

  if (lower.includes('envelope')) {
    return `Operational Envelopes:\n- Forklift Vision: Toggle to show visibility cone and blind spots\n- MAFI Swing: Toggle to show trailer swing path during turns\n- Spotter LOS: Toggle to show line-of-sight indicators\n- Ramp Clearance: Toggle to show height restriction zones\n\nUse the envelope toggles (below toolbar) to show/hide each type.`;
  }

  if (lower.includes('speed') || lower.includes('playback')) {
    return `Playback controls:\n- Speed selector: Choose 0.25x (slow motion) up to 4x (fast forward)\n- Step backward/forward: Navigate frame-by-frame (30fps)\n- Jump to keyframe: Click blue diamond on timeline\n- Drag scrubber: Seek to any timestamp\n\nAll playback is deterministic - linear interpolation between keyframes, no physics simulation.`;
  }

  if (lower.includes('coordinate') || lower.includes('meter')) {
    return `Coordinate System:\n- World coordinates: Meters (maritime standard)\n- Canvas coordinates: Pixels (internal, not shown to user)\n- Property Panel: Always displays meters\n- Grid: 1 square = 1 meter\n\nCourt-safe documentation requires measurements in meters, never pixels.`;
  }

  return `Available topics:\n- Keyframes & timeline\n- Operational envelopes\n- Playback controls\n- Coordinate system\n- Object properties\n- Export options\n\nAsk specific "how-to" questions for detailed guidance.`;
}

/**
 * Generate report response
 */
function generateReportResponse(request: string): string {
  const lower = request.toLowerCase();

  if (lower.includes('timeline') || lower.includes('summary')) {
    return `Timeline Summary Report:\n\nT0 (00:00): Initial state\n- Objects positioned\n- Keyframe captured\n\n[Additional keyframes would be listed here]\n\nExport options:\n- PNG: Static snapshot (Export menu)\n- PDF: Full incident packet with timeline\n- MP4: Animated playback video\n\nUse Export menu to generate court-safe documentation.`;
  }

  if (lower.includes('keyframe') || lower.includes('description')) {
    return `Keyframe Descriptions:\n\nT0 - Initial State (00:00.00)\nAll objects positioned for incident start\n\n[Additional keyframes with descriptions]\n\nTo export: Use PDF export for comprehensive keyframe documentation including diagrams and timestamps.`;
  }

  return `Report Options:\n- Timeline summary: Lists all keyframes with timestamps\n- Keyframe descriptions: Detailed notes for each timestep\n- Object inventory: All vehicles, actors, and safety objects\n- Envelope analysis: Visibility, clearance, and safety metrics\n\nSpecify the report type you need.`;
}
