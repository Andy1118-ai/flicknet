import React, { useState } from 'react';
import {
  FaUsers,
  FaComments,
  FaThumbsUp,
  FaReply,
  FaSearch,
  FaPlus,
  FaFire,
  FaClock,
  FaStar,
  FaUserFriends
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Community = () => {
  // const { user } = useAuth(); // Commented out to avoid unused variable warning
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchQuery, setSearchQuery] = useState('');

  const discussions = [
    {
      id: 1,
      title: "What's your favorite movie of 2024 so far?",
      author: {
        name: "MovieBuff2024",
        avatar: null,
        reputation: 1250
      },
      category: "General Discussion",
      replies: 47,
      likes: 23,
      lastActivity: "2 hours ago",
      isHot: true,
      excerpt: "I've been watching a lot of great films this year and I'm curious to hear what everyone else thinks..."
    },
    {
      id: 2,
      title: "Dune: Part Two - Discussion Thread [SPOILERS]",
      author: {
        name: "SciFiFan",
        avatar: null,
        reputation: 890
      },
      category: "Movie Discussion",
      replies: 156,
      likes: 89,
      lastActivity: "5 hours ago",
      isHot: true,
      excerpt: "Let's discuss everything about Denis Villeneuve's latest masterpiece. Warning: Major spoilers ahead!"
    },
    {
      id: 3,
      title: "Best streaming platforms for indie films?",
      author: {
        name: "IndieExplorer",
        avatar: null,
        reputation: 567
      },
      category: "Recommendations",
      replies: 28,
      likes: 15,
      lastActivity: "1 day ago",
      isHot: false,
      excerpt: "Looking for platforms that have a good selection of independent and arthouse films..."
    },
    {
      id: 4,
      title: "Christopher Nolan's filmography ranked",
      author: {
        name: "CinematicMind",
        avatar: null,
        reputation: 2100
      },
      category: "Rankings & Lists",
      replies: 73,
      likes: 41,
      lastActivity: "1 day ago",
      isHot: false,
      excerpt: "After rewatching all of Nolan's films, here's my personal ranking from best to least favorite..."
    },
    {
      id: 5,
      title: "Weekly Movie Challenge: Hidden Gems",
      author: {
        name: "FlickNetModerator",
        avatar: null,
        reputation: 5000,
        isModerator: true
      },
      category: "Challenges",
      replies: 92,
      likes: 67,
      lastActivity: "2 days ago",
      isHot: false,
      excerpt: "This week's challenge: Share a movie you love that you think deserves more recognition!"
    }
  ];

  const topMembers = [
    {
      id: 1,
      name: "FlickNetModerator",
      reputation: 5000,
      posts: 234,
      badge: "Moderator",
      avatar: null
    },
    {
      id: 2,
      name: "CinematicMind",
      reputation: 2100,
      posts: 156,
      badge: "Expert",
      avatar: null
    },
    {
      id: 3,
      name: "MovieBuff2024",
      reputation: 1250,
      posts: 89,
      badge: "Enthusiast",
      avatar: null
    },
    {
      id: 4,
      name: "SciFiFan",
      reputation: 890,
      posts: 67,
      badge: "Regular",
      avatar: null
    }
  ];

  const categories = [
    { name: "General Discussion", count: 234, icon: FaComments },
    { name: "Movie Discussion", count: 189, icon: FaUsers },
    { name: "Recommendations", count: 156, icon: FaStar },
    { name: "Rankings & Lists", count: 98, icon: FaFire },
    { name: "Challenges", count: 45, icon: FaUserFriends }
  ];

  const tabs = [
    { id: 'discussions', label: 'Discussions', icon: FaComments },
    { id: 'members', label: 'Top Members', icon: FaUsers },
    { id: 'categories', label: 'Categories', icon: FaFire }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const formatReputation = (rep) => {
    if (rep >= 1000) {
      return `${(rep / 1000).toFixed(1)}k`;
    }
    return rep.toString();
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Moderator': return 'moderator';
      case 'Expert': return 'expert';
      case 'Enthusiast': return 'enthusiast';
      default: return 'regular';
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-start mb-8 gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FlickNet Community</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Connect with fellow movie enthusiasts, share recommendations, and discuss your favorite films
          </p>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative w-80">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:border-primary-600"
              />
            </div>
          </form>

          <button className="btn-primary flex items-center gap-2">
            <FaPlus />
            New Discussion
          </button>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <FaUsers className="text-2xl text-primary-600" />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">2.4K</span>
            <span className="text-sm text-gray-600">Active Members</span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <FaComments className="text-2xl text-primary-600" />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">1.2K</span>
            <span className="text-sm text-gray-600">Discussions</span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <FaThumbsUp className="text-2xl text-primary-600" />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">8.9K</span>
            <span className="text-sm text-gray-600">Likes Given</span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <FaClock className="text-2xl text-primary-600" />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">24/7</span>
            <span className="text-sm text-gray-600">Active Community</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors duration-200 border-b-2 ${
                activeTab === tab.id
                  ? 'text-primary-600 border-primary-600'
                  : 'text-gray-600 border-transparent hover:text-primary-600'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="text-base" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {/* Discussions Tab */}
        {activeTab === 'discussions' && (
          <div>
            <div className="space-y-6">
              {discussions.map((discussion) => (
                <div key={discussion.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {discussion.isHot && (
                        <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                          <FaFire />
                          Hot
                        </span>
                      )}
                      <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-xs font-medium">
                        {discussion.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                      <span className="flex items-center gap-1">
                        <FaComments />
                        {discussion.replies}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaThumbsUp />
                        {discussion.likes}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-primary-600 cursor-pointer transition-colors duration-200">
                    {discussion.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{discussion.excerpt}</p>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center overflow-hidden">
                        {discussion.author.avatar ? (
                          <img src={discussion.author.avatar} alt={discussion.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-white font-semibold text-sm">
                            {discussion.author.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {discussion.author.name}
                          </span>
                          {discussion.author.isModerator && (
                            <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-medium">
                              MOD
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatReputation(discussion.author.reputation)} reputation
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{discussion.lastActivity}</span>
                      <button className="btn-outline btn-sm flex items-center gap-1">
                        <FaReply />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Members Tab */}
        {activeTab === 'members' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topMembers.map((member, index) => (
                <div key={member.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow duration-300 relative">
                  <div className="absolute top-4 left-4 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    #{index + 1}
                  </div>

                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-600 flex items-center justify-center overflow-hidden">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-white font-bold text-lg">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{member.name}</h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      member.badge === 'Moderator' ? 'bg-green-100 text-green-600' :
                      member.badge === 'Expert' ? 'bg-blue-100 text-blue-600' :
                      member.badge === 'Enthusiast' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {member.badge}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="block text-lg font-bold text-gray-900">{formatReputation(member.reputation)}</span>
                      <span className="text-xs text-gray-500">Reputation</span>
                    </div>
                    <div>
                      <span className="block text-lg font-bold text-gray-900">{member.posts}</span>
                      <span className="text-xs text-gray-500">Posts</span>
                    </div>
                  </div>

                  <button className="btn-outline btn-sm w-full">
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Icon className="text-xl text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{category.name}</h4>
                        <span className="text-sm text-gray-500">{category.count} discussions</span>
                      </div>
                    </div>
                    <button className="btn-outline btn-sm w-full">
                      Browse
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Community Guidelines */}
      <div className="mt-12 bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Guidelines</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">•</span>
            Be respectful and kind to all members
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">•</span>
            No spoilers without proper warnings
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">•</span>
            Stay on topic and contribute meaningfully
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">•</span>
            No spam, self-promotion, or offensive content
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">•</span>
            Use appropriate categories for your discussions
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Community;
