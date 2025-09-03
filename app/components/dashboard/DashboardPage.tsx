import { useState } from 'react';
import { 
  BellIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  GlobeAltIcon,
  FireIcon,
  FaceFrownIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  PaperClipIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';

interface Ticket {
  id: string;
  title: string;
  status: 'open' | 'resolved' | 'pending';
  urgency: 'low' | 'medium' | 'high';
  category: string;
  customer: string;
  timestamp: string;
  description: string;
  tags: string[];
  messages: Message[];
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isAgent: boolean;
}

interface Customer {
  name: string;
  email: string;
  role: string;
  company: string;
  plan: string;
  users: string;
  accountSince: string;
  previousTickets: string;
  satisfaction: string;
  ticketHistory: string[];
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Unable to process payment',
    status: 'open',
    urgency: 'high',
    category: 'Billing',
    customer: 'John Doe',
    timestamp: '2d',
    description: 'Figma ipsum component variant main layer. Underline layer library scale ellipse...',
    tags: ['#Billing', 'Urgent', 'Mad'],
    messages: [
      {
        id: '1',
        sender: 'John Doe',
        content: 'I\'m getting an error when trying to renew our company subscription. The payment keeps failing and our subscription expires tomorrow. This is urgent!',
        timestamp: '2 days ago',
        isAgent: false
      },
      {
        id: '2',
        sender: 'John Doe',
        content: 'Thanks Jane, let me check that for you.',
        timestamp: '2 days ago',
        isAgent: false
      }
    ]
  },
  {
    id: '2',
    title: 'API integration not working',
    status: 'open',
    urgency: 'medium',
    category: 'Bug Complaint',
    customer: 'Sarah Wilson',
    timestamp: '1d',
    description: 'Our API integration has stopped working after the latest update...',
    tags: ['#Bug Complaint', 'Medium'],
    messages: []
  },
  {
    id: '3',
    title: 'Feature request: Dark mode',
    status: 'pending',
    urgency: 'low',
    category: 'Feature Request',
    customer: 'Mike Johnson',
    timestamp: '3d',
    description: 'Would love to see a dark mode option in the dashboard...',
    tags: ['#Feature Request', 'Low'],
    messages: []
  }
];

const mockCustomer: Customer = {
  name: 'John Doe',
  email: 'randomcustomer@gmail.com',
  role: 'IT Director',
  company: 'TechCabal DS',
  plan: 'Enterprise ($399/month)',
  users: '72',
  accountSince: 'Jan 2024',
  previousTickets: '10',
  satisfaction: '4.6/5.0',
  ticketHistory: [
    'Dec 17: Resolved User permissions questions',
    'Aug 03: Resolved API integrations helps'
  ]
};

export function DashboardPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket>(mockTickets[0]);
  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState('All Tickets');
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  const navigationItems = [
    { name: 'Inbox', count: 5, active: true, badge: true },
    { name: 'All', count: 4 },
    { name: 'Mentions', count: 1 },
    { name: 'Created by you', count: 0 },
    { name: 'Assigned', count: 4 }
  ];

  const categories = [
    { name: 'Billing', count: 4 },
    { name: 'Bug Complaint', count: 4 },
    { name: 'Feature Request', count: 4 },
    { name: 'General Inquiry', count: 4 }
  ];

  const handleSendReply = () => {
    if (replyText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'Agent',
        content: replyText,
        timestamp: 'Just now',
        isAgent: true
      };
      
      setSelectedTicket(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage]
      }));
      setReplyText('');
    }
  };

  const handleAddNote = () => {
    if (noteText.trim()) {
      // TODO: Add note to ticket
      setNoteText('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'resolved': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Support IQ</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <div
              key={item.name}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${
                item.active ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-sm font-medium">{item.name}</span>
              {item.badge ? (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.count}
                </span>
              ) : (
                <span className="text-xs text-gray-500">{item.count}</span>
              )}
            </div>
          ))}

          {/* Categories */}
          <div className="mt-6">
            <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700">
              <span>Categories</span>
              <ChevronDownIcon className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500">{category.count}</span>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom Icons */}
        <div className="p-4 border-t border-gray-200 flex space-x-4">
          <Cog6ToothIcon className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
          <ChartBarIcon className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
          <GlobeAltIcon className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Ticket List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('All Tickets')}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    activeTab === 'All Tickets' ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
                  }`}
                >
                  All Tickets
                </button>
              </div>
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
            </div>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto">
            {mockTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedTicket.id === ticket.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(ticket.status)}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{ticket.title}</h3>
                      <span className="text-xs text-gray-500">{ticket.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {ticket.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            tag.includes('Urgent') ? 'bg-red-100 text-red-800' :
                            tag.includes('Mad') ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {tag.includes('Urgent') && <FireIcon className="h-3 w-3 mr-1" />}
                          {tag.includes('Mad') && <FaceFrownIcon className="h-3 w-3 mr-1" />}
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="flex-1 flex flex-col">
          {/* Ticket Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedTicket.customer}</h2>
                <p className="text-sm text-gray-600">Ticket: {selectedTicket.category} Issue - Refund Request</p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                Mark as resolved
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedTicket.messages.map((message) => (
              <div key={message.id} className={`flex ${message.isAgent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isAgent ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="text-sm font-medium mb-1">{message.sender}</div>
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${message.isAgent ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-sm text-blue-800">Auto-tagged as "{selectedTicket.category}"</span>
            </div>
          </div>

          {/* Reply Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">HIGH PRIORITY</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">#{selectedTicket.category}</span>
              <FireIcon className="h-4 w-4 text-red-500" />
              <FireIcon className="h-4 w-4 text-red-500" />
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Reassign</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Escalate</button>
            </div>

            <div className="relative">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                  <span className="text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-600">B</span>
                  <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-600">GIF</span>
                  <FaceSmileIcon className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                  <PaperClipIcon className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
          {/* Details Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">DETAILS</h3>
              <ChevronRightIcon className="h-4 w-4 text-gray-500 cursor-pointer" />
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Customer's Info</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 text-gray-900">{mockCustomer.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">{mockCustomer.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Role:</span>
                <span className="ml-2 text-gray-900">{mockCustomer.role}</span>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Company Info</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Company:</span>
                <span className="ml-2 text-gray-900">{mockCustomer.company}</span>
              </div>
              <div>
                <span className="text-gray-600">Plan:</span>
                <span className="ml-2 text-gray-900">{mockCustomer.plan}</span>
              </div>
              <div>
                <span className="text-gray-600">Users:</span>
                <span className="ml-2 text-gray-900">{mockCustomer.users}</span>
              </div>
              <div>
                <span className="text-gray-600">Account Since:</span>
                <span className="ml-2 text-gray-900">{mockCustomer.accountSince}</span>
              </div>
              <div>
                <span className="text-gray-600">Previous Tickets:</span>
                <span className="ml-2 text-gray-900">{mockCustomer.previousTickets}</span>
              </div>
              <div>
                <span className="text-gray-600">Satisfaction:</span>
                <span className="ml-2 text-gray-900">{mockCustomer.satisfaction}</span>
              </div>
            </div>
          </div>

          {/* Ticket History */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Ticket History</h4>
            <div className="space-y-2 text-sm">
              {mockCustomer.ticketHistory.map((ticket, index) => (
                <div key={index} className="text-gray-600">{ticket}</div>
              ))}
              <button className="text-blue-600 hover:text-blue-700 text-sm">View All</button>
            </div>
          </div>

          {/* Add Note */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Add Note</h4>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a private note..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim()}
              className="mt-2 w-full px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>

          {/* Attachments */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Attachments</h4>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <PaperClipIcon className="h-6 w-6 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
        <div></div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            New Ticket
          </button>
          <BellIcon className="h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-700" />
          <div className="w-8 h-8 bg-gray-300 rounded-full cursor-pointer"></div>
        </div>
      </div>
    </div>
  );
}



