import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MegaphoneIcon,
  PlusIcon,
  CalendarIcon,
  TagIcon,
  PaperClipIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ChevronDownIcon,
  SparklesIcon,
  BookOpenIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'Midterm Exam Schedule Released',
      content: 'The detailed schedule for midterm examinations is now available in the portal...',
      date: '2024-03-20',
      tags: ['Exams', 'Important'],
      attachments: 2,
      target: 'All Students',
      pinned: true
    },
    {
      id: 2,
      title: 'Project Submission Deadline Extended',
      content: 'Due to technical issues, the deadline for final project submissions has been extended...',
      date: '2024-03-18',
      tags: ['Assignments'],
      attachments: 1,
      target: 'Batch 2024',
      pinned: false
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    tags: [],
    target: 'All Students',
    attachments: []
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/*': ['.pdf', '.doc', '.docx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    onDrop: acceptedFiles => {
      setNewAnnouncement(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...acceptedFiles]
      }));
    }
  });

  const createAnnouncement = (e) => {
    e.preventDefault();
    const announcement = {
      id: Date.now(),
      ...newAnnouncement,
      date: new Date().toISOString().split('T')[0],
      pinned: false
    };
    setAnnouncements([announcement, ...announcements]);
    setShowCreateModal(false);
    setNewAnnouncement({
      title: '',
      content: '',
      tags: [],
      target: 'All Students',
      attachments: []
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800/50 border-r border-gray-700/50 p-6">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            SPARK IQ
          </h1>
        </div>
        <nav className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 text-purple-400 bg-purple-500/20 rounded-lg">
            <MegaphoneIcon className="w-5 h-5" />
            Announcements
          </button>
          {/* Add other navigation items as needed */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Announcement Center
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Communicate important updates to students effectively
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 rounded-lg transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            New Announcement
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Announcements', value: announcements.length, icon: MegaphoneIcon, color: 'blue' },
            { title: 'Pinned Updates', value: announcements.filter(a => a.pinned).length, icon: SparklesIcon, color: 'purple' },
            { title: 'Avg. Engagement', value: '78%', icon: BookOpenIcon, color: 'green' },
            { title: 'Active Batches', value: 4, icon: UserGroupIcon, color: 'indigo' },
          ].map((stat, index) => (
            <div key={index} className={`bg-gradient-to-br from-${stat.color}-600/20 to-${stat.color}-600/10 p-6 rounded-xl border border-${stat.color}-500/20 hover:shadow-lg transition-all`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-12 h-12 p-2.5 rounded-full bg-${stat.color}-500/20 text-${stat.color}-400`} />
              </div>
            </div>
          ))}
        </div>

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map(announcement => (
            <motion.div 
              key={announcement.id}
              whileHover={{ scale: 1.02 }}
              className="group bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 hover:border-purple-400/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {announcement.title}
                    {announcement.pinned && (
                      <SparklesIcon className="w-5 h-5 text-yellow-400 inline ml-2" />
                    )}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {announcement.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <TagIcon className="w-4 h-4" />
                      {announcement.target}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 hover:bg-gray-700/30 rounded-lg">
                    <PencilIcon className="w-5 h-5 text-blue-400" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-700/30 rounded-lg">
                    <TrashIcon className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">{announcement.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {announcement.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-gray-700/50 rounded-full text-blue-300">
                      {tag}
                    </span>
                  ))}
                </div>
                {announcement.attachments > 0 && (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <PaperClipIcon className="w-4 h-4" />
                    {announcement.attachments} files
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create Announcement Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl relative"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Create New Announcement
              </h3>
              
              <form onSubmit={createAnnouncement} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-gray-300">Title</label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-300">Content</label>
                  <textarea
                    rows="4"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-gray-300">Target Group</label>
                    <select
                      value={newAnnouncement.target}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, target: e.target.value})}
                      className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option>All Students</option>
                      <option>Batch 2024</option>
                      <option>Batch 2025</option>
                      <option>Post Graduates</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-300">Tags</label>
                    <input
                      type="text"
                      placeholder="Add tags (comma separated)"
                      className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-300">Attachments</label>
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  >
                    <input {...getInputProps()} />
                    <PaperClipIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">
                      Drag & drop files here, or click to select
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      (PDF, DOC, JPG, PNG up to 50MB)
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newAnnouncement.attachments.map(file => (
                      <span key={file.name} className="px-2 py-1 bg-gray-700/50 rounded-full text-sm">
                        {file.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <MegaphoneIcon className="w-5 h-5" />
                    Publish Announcement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnnouncementsPage;