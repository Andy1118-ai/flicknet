import React, { useState } from 'react';
import { FaHeart, FaRocket, FaBolt, FaBrain, FaLaugh, FaGhost } from 'react-icons/fa';
import GlassCard from './GlassCard';

const MoodSelector = ({ onMoodSelect, selectedMood }) => {
  const [hoveredMood, setHoveredMood] = useState(null);

  const moods = [
    {
      id: 'romantic',
      name: 'Romantic',
      icon: FaHeart,
      color: 'from-pink-500 to-rose-500',
      emoji: '💕',
      description: 'Love stories and heartwarming tales',
      keywords: ['romance', 'love', 'drama', 'heartwarming']
    },
    {
      id: 'adventurous',
      name: 'Adventurous',
      icon: FaRocket,
      color: 'from-orange-500 to-amber-500',
      emoji: '🗺️',
      description: 'Epic journeys and exciting quests',
      keywords: ['adventure', 'action', 'journey', 'epic']
    },
    {
      id: 'thrilling',
      name: 'Thrilling',
      icon: FaBolt,
      color: 'from-red-500 to-pink-500',
      emoji: '⚡',
      description: 'Edge-of-your-seat excitement',
      keywords: ['thriller', 'suspense', 'action', 'intense']
    },
    {
      id: 'thoughtful',
      name: 'Thoughtful',
      icon: FaBrain,
      color: 'from-purple-500 to-indigo-500',
      emoji: '🧠',
      description: 'Mind-bending and philosophical',
      keywords: ['drama', 'philosophical', 'indie', 'art']
    },
    {
      id: 'funny',
      name: 'Funny',
      icon: FaLaugh,
      color: 'from-yellow-500 to-orange-500',
      emoji: '😂',
      description: 'Laugh-out-loud comedies',
      keywords: ['comedy', 'funny', 'humor', 'lighthearted']
    },
    {
      id: 'scary',
      name: 'Scary',
      icon: FaGhost,
      color: 'from-gray-700 to-gray-900',
      emoji: '👻',
      description: 'Spine-chilling horror',
      keywords: ['horror', 'scary', 'supernatural', 'thriller']
    }
  ];

  const handleMoodClick = (mood) => {
    onMoodSelect?.(mood);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold glass-text-primary mb-2 text-shadow">
          What's your mood?
        </h3>
        <p className="glass-text-secondary text-shadow">
          Tell us how you're feeling and we'll find the perfect movie
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {moods.map((mood, index) => {
          const Icon = mood.icon;
          const isSelected = selectedMood?.id === mood.id;
          const isHovered = hoveredMood === mood.id;

          return (
            <button
              key={mood.id}
              onClick={() => handleMoodClick(mood)}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              className={`
                mood-button relative overflow-hidden p-6 rounded-xl text-white font-semibold
                bg-gradient-to-br ${mood.color}
                transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                ${isSelected ? 'ring-4 ring-white/50 scale-105' : ''}
                ${isHovered ? 'shadow-2xl' : 'shadow-lg'}
              `}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 right-2 text-4xl opacity-50">
                  {mood.emoji}
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className={`
                  p-3 rounded-full bg-white/20 backdrop-blur-sm
                  transition-all duration-300
                  ${isHovered ? 'bg-white/30 scale-110' : ''}
                `}>
                  <Icon className="text-xl" />
                </div>

                <div className="text-center">
                  <div className="font-bold text-lg">{mood.name}</div>
                  <div className={`
                    text-sm opacity-90 transition-all duration-300
                    ${isHovered ? 'opacity-100' : ''}
                  `}>
                    {mood.description}
                  </div>
                </div>
              </div>

              {/* Ripple Effect */}
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </button>
          );
        })}
      </div>

      {/* Selected Mood Display */}
      {selectedMood && (
        <GlassCard className="p-4 text-center animate-fadeInUp">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">{selectedMood.emoji}</span>
            <div>
              <div className="glass-text-primary font-semibold text-shadow">Perfect! You're feeling {selectedMood.name.toLowerCase()}</div>
              <div className="text-sm glass-text-secondary text-shadow">
                Finding {selectedMood.description.toLowerCase()} for you...
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default MoodSelector;
