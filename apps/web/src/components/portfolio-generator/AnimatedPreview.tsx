'use client';

import React, { useEffect, useState } from 'react';
import { Github, Linkedin, Mail, Briefcase, Award, Code, ExternalLink, Sparkles } from 'lucide-react';

interface AnimatedPreviewProps {
  portfolioData: any;
  template?: 'modern' | 'minimal' | 'creative';
}

export default function AnimatedPreview({ portfolioData, template = 'modern' }: AnimatedPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animateSection, setAnimateSection] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => {
      setAnimateSection(prev => (prev + 1) % 4);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fadeInUp = {
    opacity: isVisible ? 1 : 0,
    transform: `translateY(${isVisible ? 0 : 20}px)`,
    transition: 'all 0.6s ease-out'
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 overflow-y-auto">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Hero Section with Animation */}
        <section className="min-h-screen flex items-center justify-center py-20">
          <div style={fadeInUp} className="text-center">
            <div className="mb-8 inline-block">
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                {portfolioData.name || 'Your Name'}
              </h1>
            </div>
            
            <p className="text-2xl md:text-3xl text-gray-300 mb-6">
              {portfolioData.role || 'Your Title'}
            </p>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
              {portfolioData.bio || 'Creative professional passionate about building amazing experiences'}
            </p>

            <div className="text-gray-500 mb-8 text-sm">
              {portfolioData.email && (
                <p className="mb-2">
                  <Mail size={16} className="inline mr-2" />
                  {portfolioData.email}
                </p>
              )}
              <div className="flex items-center justify-center gap-6">
                {portfolioData.linkedin && (
                  <a href={portfolioData.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors" aria-label="LinkedIn profile" title="LinkedIn">
                    <Linkedin size={20} />
                  </a>
                )}
                {portfolioData.github && (
                  <a href={portfolioData.github} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors" aria-label="GitHub profile" title="GitHub">
                    <Github size={20} />
                  </a>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* About Section */}
        <section className="py-20 border-t border-gray-700">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              About Me
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-gray-300">
              <p className="text-lg leading-relaxed">
                {portfolioData.bio || 'I am a passionate developer with years of experience building innovative solutions.'}
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-all">
                  <div className="text-3xl font-bold text-purple-400 mb-2">5+</div>
                  <div className="text-gray-400">Years Experience</div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all">
                  <div className="text-3xl font-bold text-blue-400 mb-2">50+</div>
                  <div className="text-gray-400">Projects</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg opacity-20 blur-2xl"></div>
              <div className="relative bg-gray-800 p-8 rounded-lg border border-gray-700">
                <Briefcase size={48} className="text-purple-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                <p className="text-gray-400">Dedicated to delivering excellence</p>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section with Animation */}
        <section className="py-20 border-t border-gray-700">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Skills & Technologies
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {(portfolioData.skills?.length > 0 ? portfolioData.skills : ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker']).map((skill: string, index: number) => (
              <div
                key={index}
                className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-all hover:scale-105"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Code size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{skill}</h3>
                    <p className="text-gray-400 text-sm">Expert Level</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-20 border-t border-gray-700">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Featured Projects
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {portfolioData.projects?.slice(0, 4).map((project: any, index: number) => (
              <div
                key={index}
                className="group bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 transition-all overflow-hidden hover:scale-105"
              >
                <div className="h-48 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="absolute bottom-4 right-4">
                    <ExternalLink size={20} className="text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{project.title || `Project ${index + 1}`}</h3>
                  <p className="text-gray-400 mb-4">{project.description || 'Amazing project description'}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies?.map((tech: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        {portfolioData.experience && portfolioData.experience.length > 0 && (
          <section className="py-20 border-t border-gray-700">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Experience
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
            </div>
            
            <div className="space-y-6">
              {portfolioData.experience.map((exp: string, index: number) => (
                <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-lg leading-relaxed">{exp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements Section */}
        {portfolioData.achievements && portfolioData.achievements.length > 0 && (
          <section className="py-20 border-t border-gray-700">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Achievements & Awards
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {portfolioData.achievements.map((achievement: string, index: number) => (
                <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-all hover:scale-105">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm leading-relaxed">{achievement}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section className="py-20 border-t border-gray-700">
          <div className="max-w-2xl mx-auto text-center">
            <Sparkles size={48} className="text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Let's Work Together
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Have a project in mind? I'd love to hear from you.
            </p>
            <a
              href={`mailto:${portfolioData.email}`}
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-2xl transition-all hover:scale-105"
            >
              Get In Touch
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-700 text-center text-gray-400">
          <p>© {new Date().getFullYear()} {portfolioData.name || 'Your Name'}. All rights reserved.</p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

