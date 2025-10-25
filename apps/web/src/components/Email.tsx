'use client';

import React, { useState } from 'react';
import {
  Mail,
  Send,
  Plus,
  Search,
  Filter,
  Star,
  Archive,
  Trash2,
  Reply,
  ReplyAll,
  Forward,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  Paperclip,
  Smile,
  Image,
  Link,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bot,
  Sparkles,
  Zap,
  Target,
  Users,
  Building,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Settings,
  MoreHorizontal,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  GripVertical,
  Menu,
  Home as HomeIcon,
  FileText,
  User,
  Shield,
  Lock,
  Unlock,
  Bell,
  Bookmark,
  Flag,
  Heart,
  ThumbsUp,
  MessageCircle,
  Share2,
  ExternalLink,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  BatteryLow,
  BatteryFull,
  Power,
  PowerOff,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Umbrella,
  Snowflake,
  Zap as Lightning,
  Flame as Fire,
  Heart as Love,
  Star as Favorite,
  Award as Trophy,
  Crown as King,
  Shield as Protection,
  Target as Goal,
  Lightbulb as Idea,
  Megaphone as Announcement,
  Calendar as Event,
  MapPin as Location,
  Tag as Label,
  Hash as Number,
  AtSign as Mention,
  Bell as Notification,
  Settings as Config,
  RefreshCw as Refresh,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Copy as CopyIcon,
  ExternalLink as External,
  Maximize2 as Maximize,
  Minimize2 as Minimize,
  RotateCcw as RotateLeft,
  RotateCw as RotateRight,
  Play as PlayIcon,
  Pause as PauseIcon,
  Volume2 as Volume,
  VolumeX as Mute,
  Mic as Microphone,
  MicOff as MicrophoneOff,
  Video as VideoIcon,
  VideoOff as VideoOffIcon,
  Camera as CameraIcon,
  CameraOff as CameraOffIcon,
  Phone as PhoneIcon,
  PhoneOff as PhoneOffIcon,
  Mail as MailIcon,
  MailOpen as MailOpenIcon,
  Archive as ArchiveIcon,
  ArchiveRestore as ArchiveRestoreIcon,
  Trash as TrashIcon,
  RotateCcw as TrashRestoreIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  File as FileIcon,
  FileText as FileTextIcon,
  FileImage as FileImageIcon,
  FileVideo as FileVideoIcon,
  FileAudio as FileAudioIcon,
  File as FilePdfIcon,
  File as FileWordIcon,
  File as FileExcelIcon,
  File as FilePowerpointIcon,
  FileArchive as FileArchiveIcon,
  FileCode as FileCodeIcon,
  FileSpreadsheet as FileSpreadsheetIcon,
  Database as DatabaseIcon,
  Server as ServerIcon,
  Cloud as CloudIcon,
  CloudOff as CloudOffIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Signal as SignalIcon,
  Signal as SignalOffIcon,
  Battery as BatteryIcon,
  BatteryLow as BatteryLowIcon,
  BatteryFull as BatteryFullIcon,
  Power as PowerIcon,
  PowerOff as PowerOffIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Sunrise as SunriseIcon,
  Sunset as SunsetIcon,
  CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon,
  CloudLightning as CloudLightningIcon,
  Wind as WindIcon,
  Thermometer as ThermometerIcon,
  Droplets as DropletsIcon,
  Umbrella as UmbrellaIcon,
  Snowflake as SnowflakeIcon
} from 'lucide-react';

interface EmailProps {}

interface EmailTemplate {
  id: string;
  name: string;
  category: 'cold-email' | 'follow-up' | 'thank-you' | 'networking' | 'application' | 'inquiry';
  subject: string;
  content: string;
  aiGenerated: boolean;
  successRate: number;
  usageCount: number;
  tags: string[];
}

interface EmailDraft {
  id: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  content: string;
  attachments: string[];
  template?: EmailTemplate;
  aiGenerated: boolean;
  createdAt: string;
  status: 'draft' | 'sent' | 'scheduled' | 'failed';
}

interface EmailCampaign {
  id: string;
  name: string;
  template: EmailTemplate;
  recipients: string[];
  sent: number;
  opened: number;
  replied: number;
  clicked: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: string;
}

export default function Email({}: EmailProps) {
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'templates' | 'campaigns' | 'analytics'>('inbox');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [emailDraft, setEmailDraft] = useState<EmailDraft>({
    id: '',
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    content: '',
    attachments: [],
    aiGenerated: false,
    createdAt: new Date().toISOString(),
    status: 'draft'
  });

  // AI Email Generator State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiContext, setAiContext] = useState({
    recipientType: 'hr',
    industry: 'tech',
    position: 'software-engineer',
    tone: 'professional',
    length: 'medium'
  });

  // Sample email templates
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Cold Email - Software Engineer',
      category: 'cold-email',
      subject: 'Experienced Software Engineer Interested in [Company] Opportunities',
      content: `Hi [Recipient Name],

I hope this email finds you well. I came across [Company] and was impressed by your innovative approach to [specific company achievement or product].

As a software engineer with [X] years of experience in [relevant technologies], I'm particularly drawn to your work in [specific area]. I've been following [Company]'s growth and would love to contribute to your team's success.

I've attached my resume for your review. I'd appreciate the opportunity to discuss how my skills in [specific skills] could benefit [Company].

Thank you for your time and consideration.

Best regards,
[Your Name]`,
      aiGenerated: true,
      successRate: 78,
      usageCount: 1240,
      tags: ['software', 'engineer', 'cold-email', 'tech']
    },
    {
      id: '2',
      name: 'Follow-up Email',
      category: 'follow-up',
      subject: 'Following up on my application for [Position]',
      content: `Hi [Recipient Name],

I hope you're doing well. I wanted to follow up on my application for the [Position] role that I submitted on [Date].

I remain very interested in this opportunity and believe my background in [relevant experience] makes me a strong fit for your team.

I'd be happy to provide any additional information or schedule a call at your convenience.

Thank you for your consideration.

Best regards,
[Your Name]`,
      aiGenerated: true,
      successRate: 65,
      usageCount: 890,
      tags: ['follow-up', 'application', 'professional']
    },
    {
      id: '3',
      name: 'Networking Email',
      category: 'networking',
      subject: 'Connecting with fellow [Industry] professionals',
      content: `Hi [Recipient Name],

I hope this message finds you well. I came across your profile and was impressed by your work at [Company] in [specific area].

As someone also working in [industry], I'd love to connect and learn more about your experience. I'm particularly interested in [specific topic or challenge].

Would you be open to a brief conversation? I'd be happy to share insights from my own experience as well.

Thank you for your time.

Best regards,
[Your Name]`,
      aiGenerated: true,
      successRate: 82,
      usageCount: 567,
      tags: ['networking', 'professional', 'connection']
    },
    {
      id: '4',
      name: 'Thank You Email',
      category: 'thank-you',
      subject: 'Thank you for the interview opportunity',
      content: `Hi [Recipient Name],

Thank you for taking the time to interview me for the [Position] role yesterday. I enjoyed our conversation about [specific topics discussed] and learning more about [Company]'s vision.

I'm even more excited about the opportunity to contribute to your team, particularly in [specific area mentioned].

Please let me know if you need any additional information from me.

Thank you again for your time and consideration.

Best regards,
[Your Name]`,
      aiGenerated: false,
      successRate: 95,
      usageCount: 2340,
      tags: ['thank-you', 'interview', 'follow-up']
    }
  ]);

  // Sample email campaigns
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([
    {
      id: '1',
      name: 'Software Engineer Outreach',
      template: emailTemplates[0],
      recipients: ['hr@google.com', 'recruiting@microsoft.com', 'jobs@amazon.com'],
      sent: 150,
      opened: 89,
      replied: 23,
      clicked: 45,
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Follow-up Campaign',
      template: emailTemplates[1],
      recipients: ['hr@meta.com', 'recruiting@netflix.com'],
      sent: 75,
      opened: 52,
      replied: 8,
      clicked: 18,
      status: 'completed',
      createdAt: '2024-01-10'
    }
  ]);

  const generateAIEmail = () => {
    const prompt = `Generate a ${aiContext.tone} ${aiContext.recipientType} email for a ${aiContext.position} position in the ${aiContext.industry} industry. Length: ${aiContext.length}. Context: ${aiPrompt}`;

    // Simulate AI generation
    const generatedContent = `Hi [Recipient Name],

${aiPrompt}

I hope this email finds you well. I'm writing to express my interest in opportunities at your company.

As a ${aiContext.position} with experience in the ${aiContext.industry} industry, I believe I could contribute significantly to your team.

I'd appreciate the opportunity to discuss this further.

Best regards,
[Your Name]`;

    setEmailDraft(prev => ({
      ...prev,
      content: generatedContent,
      aiGenerated: true
    }));
    setShowAIGenerator(false);
  };

  const sendEmail = () => {
    // Simulate email sending
    console.log('Sending email:', emailDraft);
    setShowComposeModal(false);
    setEmailDraft({
      id: '',
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      content: '',
      attachments: [],
      aiGenerated: false,
      createdAt: new Date().toISOString(),
      status: 'draft'
    });
  };

  const useTemplate = (template: EmailTemplate) => {
    setEmailDraft(prev => ({
      ...prev,
      subject: template.subject,
      content: template.content,
      template: template,
      aiGenerated: template.aiGenerated
    }));
    setShowComposeModal(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cold-email': return <Target size={16} />;
      case 'follow-up': return <RefreshCw size={16} />;
      case 'thank-you': return <Heart size={16} />;
      case 'networking': return <Users size={16} />;
      case 'application': return <Briefcase size={16} />;
      case 'inquiry': return <MessageCircle size={16} />;
      default: return <Mail size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cold-email': return 'bg-red-100 text-red-700';
      case 'follow-up': return 'bg-blue-100 text-blue-700';
      case 'thank-you': return 'bg-green-100 text-green-700';
      case 'networking': return 'bg-purple-100 text-purple-700';
      case 'application': return 'bg-orange-100 text-orange-700';
      case 'inquiry': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Send professional emails with AI assistance</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
              <RefreshCw size={14} className="inline mr-1" />
              Sync
            </button>
            <button
              onClick={() => setShowComposeModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-semibold shadow-sm"
            >
              <Plus size={14} className="inline mr-1" />
              Compose
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'inbox'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Mail size={14} className="inline mr-1" />
            Inbox
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'compose'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Edit size={14} className="inline mr-1" />
            Compose
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'templates'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText size={14} className="inline mr-1" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'campaigns'
                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Target size={14} className="inline mr-1" />
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'analytics'
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 size={14} className="inline mr-1" />
            Analytics
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <Filter size={16} className="inline mr-1" />
            Filter
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* AI Generator Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">AI Email Generator</h2>
                  <p className="text-sm text-gray-600">Generate personalized emails with AI assistance</p>
                </div>
                <button
                  onClick={() => setShowAIGenerator(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold"
                >
                  <Bot size={16} className="inline mr-2" />
                  Generate Email
                </button>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emailTemplates.map(template => (
                <div key={template.id} className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                          {getCategoryIcon(template.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getCategoryColor(template.category)}`}>
                            {template.category.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      {template.aiGenerated && (
                        <div className="flex items-center gap-1">
                          <Bot size={12} className="text-purple-500" />
                          <span className="text-xs text-purple-600 font-medium">AI</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-1">Subject:</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{template.subject}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-1">Preview:</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp size={12} />
                          {template.successRate}% success
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {template.usageCount} uses
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                          #{tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => useTemplate(template)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
                      >
                        Use Template
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Email Campaigns</h2>
                <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-semibold">
                  <Plus size={16} className="inline mr-2" />
                  New Campaign
                </button>
              </div>

              <div className="space-y-4">
                {emailCampaigns.map(campaign => (
                  <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">Template: {campaign.template.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{campaign.sent}</div>
                        <div className="text-xs text-gray-500">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{campaign.opened}</div>
                        <div className="text-xs text-gray-500">Opened</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{campaign.replied}</div>
                        <div className="text-xs text-gray-500">Replied</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{campaign.clicked}</div>
                        <div className="text-xs text-gray-500">Clicked</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        View Details
                      </button>
                      <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <BarChart3 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Emails Sent</p>
                    <p className="text-lg font-bold text-gray-900">1,247</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Send size={16} className="text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Open Rate</p>
                    <p className="text-lg font-bold text-gray-900">68.5%</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye size={16} className="text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Reply Rate</p>
                    <p className="text-lg font-bold text-gray-900">23.2%</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Reply size={16} className="text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">AI Generated</p>
                    <p className="text-lg font-bold text-gray-900">847</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Bot size={16} className="text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Email Performance Trends</h2>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 size={48} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Email performance charts will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Emails</h2>
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        HR
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">HR Team</div>
                        <div className="text-sm text-gray-600">hr@company.com</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">2 hours ago</div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Re: Software Engineer Position</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">Thank you for your interest in our Software Engineer position. We'd like to schedule an interview...</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        R
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Recruiter</div>
                        <div className="text-sm text-gray-600">recruiter@tech.com</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">1 day ago</div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">New Opportunities Available</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">We have several new positions that might interest you based on your profile...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Compose Email</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAIGenerator(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-sm font-semibold"
                  >
                    <Bot size={14} className="inline mr-1" />
                    AI Assist
                  </button>
                  <button
                    onClick={() => setShowComposeModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
                  <input
                    type="email"
                    value={emailDraft.to}
                    onChange={(e) => setEmailDraft(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="recipient@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CC</label>
                  <input
                    type="email"
                    value={emailDraft.cc}
                    onChange={(e) => setEmailDraft(prev => ({ ...prev, cc: e.target.value }))}
                    placeholder="cc@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">BCC</label>
                  <input
                    type="email"
                    value={emailDraft.bcc}
                    onChange={(e) => setEmailDraft(prev => ({ ...prev, bcc: e.target.value }))}
                    placeholder="bcc@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={emailDraft.subject}
                  onChange={(e) => setEmailDraft(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={emailDraft.content}
                  onChange={(e) => setEmailDraft(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Type your message here..."
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {emailDraft.aiGenerated && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <Bot size={16} className="text-purple-600" />
                  <span className="text-sm text-purple-700 font-medium">This email was generated with AI assistance</span>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowComposeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={sendEmail}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold"
              >
                <Send size={16} className="inline mr-2" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">AI Email Generator</h2>
                <button
                  onClick={() => setShowAIGenerator(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Generate personalized emails with AI assistance</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Type</label>
                  <select
                    value={aiContext.recipientType}
                    onChange={(e) => setAiContext(prev => ({ ...prev, recipientType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="hr">HR Manager</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="hiring-manager">Hiring Manager</option>
                    <option value="ceo">CEO</option>
                    <option value="networking">Networking Contact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
                  <select
                    value={aiContext.industry}
                    onChange={(e) => setAiContext(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="tech">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                  <input
                    type="text"
                    value={aiContext.position}
                    onChange={(e) => setAiContext(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tone</label>
                  <select
                    value={aiContext.tone}
                    onChange={(e) => setAiContext(prev => ({ ...prev, tone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="persuasive">Persuasive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Context</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want to achieve with this email..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAIGenerator(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateAIEmail}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold"
                >
                  <Bot size={16} className="inline mr-2" />
                  Generate Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}