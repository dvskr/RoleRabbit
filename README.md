# RoleReady - AI-Powered Resume Builder

A sophisticated, AI-powered resume builder application built with React, TypeScript, and Tailwind CSS. Create professional, ATS-optimized resumes with advanced features like AI content generation, version control, and real-time editing.

## 🚀 Features

### Core Resume Building
- **ATS-Optimized Templates**: Multiple professional resume templates
- **Real-time Editing**: Live preview with instant updates
- **Section Management**: Drag-and-drop, reordering, visibility control
- **Custom Fields**: Add custom sections and fields
- **Typography Control**: Font families, sizes, spacing, and styling options

### AI-Powered Features
- **Job Description Analysis**: Keyword matching and optimization
- **AI Content Generation**: Summary, experience descriptions
- **Resume Tailoring**: Full and partial AI optimization
- **Conversation Interface**: Interactive AI assistant
- **Smart Recommendations**: AI-driven improvement suggestions

### Advanced Management
- **Version Control**: Git-like versioning system with branching
- **Auto-Save**: Automatic resume saving with local storage
- **Export Options**: PDF, Word, JSON, and print formats
- **Import/Export**: JSON-based data portability
- **Search & Highlight**: Find and highlight content across resume

### User Experience
- **Keyboard Shortcuts**: Ctrl+Z, Ctrl+Y, Ctrl+S, Ctrl+F, etc.
- **Mobile Responsive**: Mobile-optimized interface with FAB
- **Notifications**: Toast notifications for user feedback
- **Professional Tools**: Job tracker, Gmail integration, discussion platform

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React (40+ icons)
- **Build Tool**: Vite
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Custom Hooks**: Undo/Redo, Auto-save, Form validation, Search

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd roleready-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
roleready-ui/
├── src/
│   ├── main.tsx          # React app entry point
│   ├── App.tsx           # Main app component
│   └── index.css         # Global styles and Tailwind
├── components/
│   └── EnhancedModals.tsx # Modal components (Export, Search, Notifications)
├── hooks/
│   └── useEnhancedFeatures.ts # Custom React hooks
├── ui.tsx                # Main RoleReady component (3,653 lines)
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3b82f6 to #2563eb)
- **Secondary**: Purple gradient (#a855f7 to #9333ea)
- **Background**: Gradient from slate to blue to purple
- **Glassmorphism**: White/80 with backdrop blur

### Typography
- **Font Families**: System fonts (Arial, Times New Roman, Calibri, etc.)
- **ATS-Friendly**: Optimized for Applicant Tracking Systems
- **Responsive**: Scales appropriately across devices

### Components
- **Modals**: Glassmorphism design with backdrop blur
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Focus rings and smooth transitions
- **Cards**: Subtle shadows and rounded corners

## ⌨️ Keyboard Shortcuts

- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Ctrl+S**: Save
- **Ctrl+N**: New resume
- **Ctrl+O**: Open/restore
- **Ctrl+E**: Export
- **Ctrl+F**: Search
- **Ctrl+A**: AI optimize

## 📱 Mobile Features

- **Responsive Design**: Mobile-first approach
- **Floating Action Buttons**: Quick access to key functions
- **Touch Optimized**: Swipe gestures and touch-friendly UI
- **Mobile Menu**: Collapsible navigation

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Organization

The application is structured as a single-file component (`ui.tsx`) with:
- **76+ useState hooks** for comprehensive state management
- **Custom hooks** for enhanced functionality
- **Modular components** for modals and UI elements
- **TypeScript** for type safety

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

3. **Configure environment variables** if needed

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Sathish Kumar**
- Email: dvskr.333@gmail.com
- LinkedIn: linkedin.com/in/dvskr
- GitHub: https://github.com/dvskr

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, email dvskr.333@gmail.com or create an issue in the repository.

---

**RoleReady** - Empowering professionals with AI-driven resume building technology.
