'use client';

interface TopicPreset {
  id: string;
  name: string;
  topic: string;
  initialMessage: string;
}

interface TopicConfigurationPanelProps {
  presets: TopicPreset[];
  customTopic: string;
  customInitialMessage: string;
  onCustomTopicChange: (value: string) => void;
  onCustomInitialMessageChange: (value: string) => void;
  onPresetSelect: (preset: TopicPreset) => void;
  onCustomSubmit: () => void;
}

export default function TopicConfigurationPanel({
  presets,
  customTopic,
  customInitialMessage,
  onCustomTopicChange,
  onCustomInitialMessageChange,
  onPresetSelect,
  onCustomSubmit,
}: TopicConfigurationPanelProps) {
  const isCustomValid = customTopic.trim() && customInitialMessage.trim();

  return (
    <div className="mx-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Configure Conversation Topic
      </h2>

      {/* Preset Topics */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Quick Select Presets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onPresetSelect(preset)}
              className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 rounded-lg border border-gray-200 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Topic Input */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Or Create Custom Topic
        </h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="custom-topic"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Conversation Topic Description
            </label>
            <textarea
              id="custom-topic"
              value={customTopic}
              onChange={(e) => onCustomTopicChange(e.target.value)}
              placeholder="Describe the conversation scenario and context..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="custom-message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Initial AI Message
            </label>
            <textarea
              id="custom-message"
              value={customInitialMessage}
              onChange={(e) => onCustomInitialMessageChange(e.target.value)}
              placeholder="Enter the AI's opening message to start the conversation..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={onCustomSubmit}
            disabled={!isCustomValid}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Start Custom Conversation
          </button>
        </div>
      </div>
    </div>
  );
}
