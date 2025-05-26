import React, { useState, useEffect } from 'react';
import {
  FaFlag,
  FaUser,
  FaClock,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaEye,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import { moderationService } from '../../services/moderationService';
import GlassCard from '../ui/GlassCard';

const ContentReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'pending',
    priority: '',
    search: ''
  });

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    setLoading(true);
    try {
      // Use mock data for now - replace with real API call when backend is ready
      const result = moderationService.getMockContentReports();
      if (result.success) {
        setReports(result.data);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId, action, notes) => {
    try {
      const result = await moderationService.handleContentReport(reportId, action, notes);
      if (result.success) {
        // Refresh reports list
        loadReports();
        setShowModal(false);
        setSelectedReport(null);
      } else {
        alert('Failed to handle report: ' + result.error);
      }
    } catch (error) {
      console.error('Error handling report:', error);
      alert('Failed to handle report');
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

  const getReasonLabel = (reason) => {
    const labels = {
      inappropriate_content: 'Inappropriate Content',
      spam: 'Spam',
      harassment: 'Harassment',
      hate_speech: 'Hate Speech',
      violence: 'Violence',
      copyright_violation: 'Copyright Violation',
      misinformation: 'Misinformation',
      other: 'Other'
    };
    return labels[reason] || reason;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Reports</h2>
          <p className="text-gray-600">Review and moderate reported content</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {reports.length} reports found
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
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </GlassCard>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FaFlag className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
          <p className="text-gray-600">No content reports match your current filters.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <GlassCard key={report._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                      {report.priority?.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {report.contentType?.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {getReasonLabel(report.reason)}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Reported by:</div>
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span className="font-medium">
                          {report.reportedBy?.firstName} {report.reportedBy?.lastName}
                        </span>
                        <span className="text-gray-500">(@{report.reportedBy?.username})</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Target user:</div>
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span className="font-medium">
                          {report.targetUserId?.firstName} {report.targetUserId?.lastName}
                        </span>
                        <span className="text-gray-500">(@{report.targetUserId?.username})</span>
                      </div>
                    </div>
                  </div>

                  {report.description && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-1">Description:</div>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{report.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    className="btn-outline flex items-center gap-2"
                    onClick={() => {
                      setSelectedReport(report);
                      setShowModal(true);
                    }}
                  >
                    <FaEye />
                    Review
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Review Content Report</h3>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Details
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {selectedReport.contentType}
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span> {selectedReport.priority}
                      </div>
                      <div>
                        <span className="font-medium">Reason:</span> {getReasonLabel(selectedReport.reason)}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(selectedReport.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {selectedReport.description && (
                      <div className="mt-3">
                        <span className="font-medium">Description:</span>
                        <p className="mt-1">{selectedReport.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moderator Notes
                  </label>
                  <textarea
                    id="moderatorNotes"
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Add your notes about this report..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  className="btn-outline"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedReport(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => {
                    const notes = document.getElementById('moderatorNotes').value;
                    handleReportAction(selectedReport._id, 'none', notes);
                  }}
                >
                  <FaTimes />
                  Dismiss
                </button>
                <button
                  className="btn-primary flex items-center gap-2"
                  onClick={() => {
                    const notes = document.getElementById('moderatorNotes').value;
                    handleReportAction(selectedReport._id, 'content_removed', notes);
                  }}
                >
                  <FaCheck />
                  Take Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentReports;
