import { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ClockIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline';
import { apiClient, type Ticket, TicketStatus, TicketPriority } from '~/lib/api';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onUpdate: () => void;
}

export function TicketDetailModal({ isOpen, onClose, ticket: initialTicket, onUpdate }: TicketDetailModalProps) {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch full ticket details when modal opens
  useEffect(() => {
    if (isOpen && initialTicket.id) {
      loadTicketDetails();
    }
  }, [isOpen, initialTicket.id]);

  const loadTicketDetails = async () => {
    setLoading(true);
    try {
      const fullTicket = await apiClient.getTicket(initialTicket.id);
      setTicket(fullTicket);
    } catch (error) {
      console.error('Failed to load ticket details:', error);
      // Fallback to initial ticket data
      setTicket(initialTicket);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: TicketStatus) => {
    setUpdating(true);
    try {
      await apiClient.updateTicketStatus(ticket.id, status);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update ticket status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityUpdate = async (priority: TicketPriority) => {
    setUpdating(true);
    try {
      await apiClient.updateTicket(ticket.id, { priority });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update priority:', error);
      alert('Failed to update ticket priority');
    } finally {
      setUpdating(false);
    }
  };

  const getSentimentColor = (score?: number) => {
    if (score === undefined) return 'text-gray-400';
    if (score > 0.3) return 'text-green-600';
    if (score < -0.3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentLabel = (score?: number) => {
    if (score === undefined) return 'Not analyzed';
    if (score > 0.3) return 'Positive';
    if (score < -0.3) return 'Negative';
    return 'Neutral';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Ticket #{ticket.id}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Created {new Date(ticket.created_at).toLocaleString()}
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Main Content - 2/3 width */}
              <div className="col-span-2 space-y-6">
                {/* Title and Description */}
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{ticket.title}</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                    {ticket.description}
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                    AI Analysis Results
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Category</p>
                      <p className="text-sm font-medium text-gray-900">
                        {ticket.category || 'Uncategorized'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Sentiment</p>
                      <p className={`text-sm font-medium ${getSentimentColor(ticket.sentiment_score)}`}>
                        {getSentimentLabel(ticket.sentiment_score)}
                        {ticket.sentiment_score !== undefined &&
                          ` (${(ticket.sentiment_score * 100).toFixed(0)}%)`
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Urgency Score</p>
                      <p className="text-sm font-medium text-gray-900">
                        {ticket.urgency_score !== undefined
                          ? `${(ticket.urgency_score * 100).toFixed(0)}%`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">AI Confidence</p>
                      <p className="text-sm font-medium text-gray-900">
                        {ticket.confidence_score !== undefined
                          ? `${(ticket.confidence_score * 100).toFixed(0)}%`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {ticket.needs_human_review && (
                    <div className="mt-3 flex items-center text-sm text-amber-700 bg-amber-100 rounded px-3 py-2">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      This ticket needs human review
                    </div>
                  )}
                </div>

                {/* Tags */}
                {ticket.tags && ticket.tags.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <TagIcon className="h-5 w-5 mr-2 text-gray-400" />
                      Tags
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {ticket.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Customer Information
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">{ticket.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{ticket.customer_email}</p>
                    </div>
                    {ticket.customer_phone && (
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{ticket.customer_phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar - 1/3 width */}
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusUpdate(e.target.value as TicketStatus)}
                    disabled={updating}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md disabled:opacity-50"
                  >
                    <option value={TicketStatus.OPEN}>Open</option>
                    <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TicketStatus.RESOLVED}>Resolved</option>
                    <option value={TicketStatus.CLOSED}>Closed</option>
                    <option value={TicketStatus.PENDING}>Pending</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityUpdate(e.target.value as TicketPriority)}
                    disabled={updating}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md disabled:opacity-50"
                  >
                    <option value={TicketPriority.LOW}>Low</option>
                    <option value={TicketPriority.MEDIUM}>Medium</option>
                    <option value={TicketPriority.HIGH}>High</option>
                    <option value={TicketPriority.URGENT}>Urgent</option>
                  </select>
                </div>

                {/* Details */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Channel</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{ticket.channel}</p>
                  </div>
                  {ticket.integration_name && (
                    <div>
                      <p className="text-xs text-gray-600">Integration</p>
                      <p className="text-sm font-medium text-gray-900">{ticket.integration_name}</p>
                    </div>
                  )}
                  {ticket.assignee_name && (
                    <div>
                      <p className="text-xs text-gray-600">Assigned To</p>
                      <p className="text-sm font-medium text-gray-900">{ticket.assignee_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-600">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(ticket.updated_at).toLocaleString()}
                    </p>
                  </div>
                  {ticket.resolved_at && (
                    <div>
                      <p className="text-xs text-gray-600">Resolved At</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(ticket.resolved_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Processing Status */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    {ticket.is_processed ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                    )}
                    <span className={ticket.is_processed ? 'text-green-700' : 'text-gray-600'}>
                      {ticket.is_processed ? 'AI Processed' : 'Pending Processing'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
          {/* )} */}
        </div>
      </div>
    </div>
  );
}
