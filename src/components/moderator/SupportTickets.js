import React, { useState, useEffect } from 'react';
import {
  FaTicketAlt,
  FaUser,
  FaClock,
  FaExclamationTriangle,
  FaCheck,
  FaUserPlus,
  FaFilter,
  FaSearch,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';
import { moderationService } from '../../services/moderationService';
import GlassCard from '../ui/GlassCard';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      // Use mock data for now - replace with real API call when backend is ready
      const result = moderationService.getMockSupportTickets();
      if (result.success) {
        setTickets(result.data);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTicket = async (ticketId) => {
    try {
      const result = await moderationService.assignTicket(ticketId);
      if (result.success) {
        loadTickets();
        alert('Ticket assigned successfully');
      } else {
        alert('Failed to assign ticket: ' + result.error);
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
      alert('Failed to assign ticket');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'waiting_for_user': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      technical_issue: 'Technical Issue',
      billing: 'Billing',
      content_request: 'Content Request',
      account_issue: 'Account Issue',
      feature_request: 'Feature Request',
      bug_report: 'Bug Report',
      content_dispute: 'Content Dispute',
      other: 'Other'
    };
    return labels[category] || category;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
          <p className="text-gray-600">Manage and respond to user support requests</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {tickets.length} tickets found
          </span>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_user">Waiting for User</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              <option value="technical_issue">Technical Issue</option>
              <option value="billing">Billing</option>
              <option value="content_request">Content Request</option>
              <option value="account_issue">Account Issue</option>
              <option value="feature_request">Feature Request</option>
              <option value="bug_report">Bug Report</option>
              <option value="content_dispute">Content Dispute</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </GlassCard>

      {/* Tickets List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FaTicketAlt className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tickets Found</h3>
          <p className="text-gray-600">No support tickets match your current filters.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <GlassCard key={ticket._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority?.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status?.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getCategoryLabel(ticket.category)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {ticket.subject}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">User:</div>
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span className="font-medium">
                          {ticket.userId?.firstName} {ticket.userId?.lastName}
                        </span>
                        <span className="text-gray-500">(@{ticket.userId?.username})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <FaEnvelope className="text-gray-400 text-sm" />
                        <span className="text-sm text-gray-600">{ticket.userId?.email}</span>
                      </div>
                    </div>

                    {ticket.assignedTo && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Assigned to:</div>
                        <div className="flex items-center gap-2">
                          <FaUserPlus className="text-gray-400" />
                          <span className="font-medium">
                            {ticket.assignedTo?.firstName} {ticket.assignedTo?.lastName}
                          </span>
                          <span className="text-gray-500">(@{ticket.assignedTo?.username})</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!ticket.assignedTo && (
                    <button
                      className="btn-primary flex items-center gap-2"
                      onClick={() => handleAssignTicket(ticket._id)}
                    >
                      <FaUserPlus />
                      Assign to Me
                    </button>
                  )}
                  <button
                    className="btn-outline flex items-center gap-2"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowModal(true);
                    }}
                  >
                    <FaTicketAlt />
                    View Details
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Ticket Details Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Support Ticket Details</h3>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedTicket.subject}</h4>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority?.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status?.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getCategoryLabel(selectedTicket.category)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">User Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedTicket.userId?.firstName} {selectedTicket.userId?.lastName}
                    </div>
                    <div>
                      <span className="font-medium">Username:</span> @{selectedTicket.userId?.username}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedTicket.userId?.email}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(selectedTicket.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <p className="text-gray-800">{selectedTicket.description || 'No description provided.'}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Response</h5>
                  <textarea
                    id="ticketResponse"
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Type your response to the user..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  className="btn-outline"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedTicket(null);
                  }}
                >
                  Close
                </button>
                <button
                  className="btn-primary flex items-center gap-2"
                  onClick={() => {
                    const response = document.getElementById('ticketResponse').value;
                    if (response.trim()) {
                      alert('Response sent successfully!');
                      setShowModal(false);
                      setSelectedTicket(null);
                    } else {
                      alert('Please enter a response');
                    }
                  }}
                >
                  <FaCheck />
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
