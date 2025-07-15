import React from 'react';
import { Play, Zap, Globe, Clock, Check, Star } from 'lucide-react';
import ScrollReveal from '../Animations/ScrollReveal';
import ParallaxSection from '../Animations/ParallaxSection';
import ScrollProgressBar from '../Animations/ScrollProgressBar';
import ScrollTriggeredCounter from '../Animations/ScrollTriggeredCounter';
import VideoCreationTimeline from '../Animations/VideoCreationTimeline';
import ScrollBasedVideoPreview from '../Animations/ScrollBasedVideoPreview';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0F1116] text-white">
      <ScrollProgressBar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <ParallaxSection speed={0.3}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#27AE60]/20 to-[#2ECC71]/20"></div>
        </ParallaxSection>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <ScrollReveal direction="left" delay={200}>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Catalyze Your Content Creation
                </h1>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={400}>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl">
                  The enzyme of AI-powered video creation — automatically generate, voice, and publish video content at scale.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={600}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => onNavigate('signup')}
                    className="bg-[#27AE60] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#229954] transition-all transform hover:scale-105 hover-glow"
                  >
                    Start Creating Free
                  </button>
                  <button className="border border-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-all hover-lift">
                    Watch Demo
                  </button>
                </div>
              </ScrollReveal>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <ScrollReveal direction="right" delay={300}>
                <div className="relative">
                  <div className="w-96 h-96 bg-gradient-to-r from-[#27AE60]/20 to-[#2ECC71]/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-32 h-32 bg-gradient-to-r from-[#27AE60] to-[#2ECC71] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce">
                      <Play className="w-16 h-16 text-white fill-white ml-2" />
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll-Based Video Preview */}
      <section className="py-20">
        <ScrollBasedVideoPreview />
      </section>
      {/* Features Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal direction="up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Create</h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-xl text-gray-300">AI-powered video creation made simple</p>
            </ScrollReveal>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={100}>
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 hover:border-[#27AE60]/50 transition-all hover-lift">
                <div className="w-12 h-12 bg-[#27AE60] rounded-lg flex items-center justify-center mb-4 animate-bounce">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Generation</h3>
                <p className="text-gray-400">Create videos from simple prompts. Our AI handles scripts, voiceovers, and visuals automatically.</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={200}>
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 hover:border-[#27AE60]/50 transition-all hover-lift">
                <div className="w-12 h-12 bg-[#27AE60] rounded-lg flex items-center justify-center mb-4 animate-bounce">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Multi-Platform Publishing</h3>
                <p className="text-gray-400">Automatically publish to YouTube, TikTok, and Instagram with optimized formats for each platform.</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={300}>
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 hover:border-[#27AE60]/50 transition-all hover-lift">
                <div className="w-12 h-12 bg-[#27AE60] rounded-lg flex items-center justify-center mb-4 animate-bounce">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Scale Your Content</h3>
                <p className="text-gray-400">Generate unlimited videos with consistent quality. Perfect for content creators and businesses.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal direction="up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-xl text-gray-300">Create professional videos in minutes, not hours</p>
            </ScrollReveal>
          </div>
          
          <VideoCreationTimeline />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <ScrollReveal direction="up" delay={100}>
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
                <div className="text-4xl font-bold text-[#27AE60] mb-2">
                  <ScrollTriggeredCounter end={50000} suffix="+" />
                </div>
                <p className="text-gray-400">Videos Created</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={200}>
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
                <div className="text-4xl font-bold text-[#27AE60] mb-2">
                  <ScrollTriggeredCounter end={10000} suffix="+" />
                </div>
                <p className="text-gray-400">Happy Creators</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={300}>
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
                <div className="text-4xl font-bold text-[#27AE60] mb-2">
                  <ScrollTriggeredCounter end={1000000} suffix="+" />
                </div>
                <p className="text-gray-400">Total Views</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={400}>
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
                <div className="text-4xl font-bold text-[#27AE60] mb-2">
                  <ScrollTriggeredCounter end={99} suffix="%" />
                </div>
                <p className="text-gray-400">Satisfaction Rate</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal direction="up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-xl text-gray-300">Choose the plan that fits your content creation needs</p>
            </ScrollReveal>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <ScrollReveal direction="up" delay={100}>
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 hover-lift">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Free</h3>
                  <div className="text-4xl font-bold mb-4">$0<span className="text-base text-gray-400">/month</span></div>
                  <p className="text-gray-400 mb-6">Perfect for trying out Vidzyme</p>
                  <button
                    onClick={() => onNavigate('signup')}
                    className="w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors hover-lift"
                  >
                    Get Started
                  </button>
                </div>
                <ul className="mt-8 space-y-3">
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />3 videos per month</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />3 minutes of voiceover</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />Basic templates</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />Watermark included</li>
                </ul>
              </div>
            </ScrollReveal>
            
            {/* Pro Plan */}
            <ScrollReveal direction="up" delay={200}>
              <div className="bg-gradient-to-b from-[#27AE60]/20 to-[#2ECC71]/20 rounded-xl p-8 border border-[#27AE60] relative hover-lift animate-glow">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#27AE60] text-white px-4 py-1 rounded-full text-sm font-semibold animate-bounce">
                    Most Popular
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Pro</h3>
                  <div className="text-4xl font-bold mb-4">$29<span className="text-base text-gray-400">/month</span></div>
                  <p className="text-gray-400 mb-6">Great for content creators</p>
                  <button
                    onClick={() => onNavigate('signup')}
                    className="w-full bg-[#27AE60] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#229954] transition-colors hover-glow"
                  >
                    Start Pro Trial
                  </button>
                </div>
                <ul className="mt-8 space-y-3">
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />30 videos per month</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />30 minutes of voiceover</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />Premium templates</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />No watermark</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />Social media scheduling</li>
                </ul>
              </div>
            </ScrollReveal>
            
            {/* Premium Plan */}
            <ScrollReveal direction="up" delay={300}>
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 hover-lift">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Premium</h3>
                  <div className="text-4xl font-bold mb-4">$99<span className="text-base text-gray-400">/month</span></div>
                  <p className="text-gray-400 mb-6">For agencies and businesses</p>
                  <button
                    onClick={() => onNavigate('signup')}
                    className="w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors hover-lift"
                  >
                    Contact Sales
                  </button>
                </div>
                <ul className="mt-8 space-y-3">
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />100 videos per month</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />120 minutes of voiceover</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />Custom templates</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />Priority support</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-[#27AE60] mr-3" />Advanced analytics</li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal direction="up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Creators Are Saying</h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-xl text-gray-300">Join thousands of content creators using Vidzyme</p>
            </ScrollReveal>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={100}>
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 hover-lift">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"Vidzyme has revolutionized my content creation process. I can now produce high-quality videos in minutes instead of hours."</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#27AE60] rounded-full flex items-center justify-center mr-3 animate-pulse">
                    <span className="text-white font-semibold">SM</span>
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Miller</div>
                    <div className="text-gray-400 text-sm">YouTube Creator</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={200}>
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 hover-lift">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"The AI-generated voiceovers are incredibly natural. My audience can't tell the difference from human narration."</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#27AE60] rounded-full flex items-center justify-center mr-3 animate-pulse">
                    <span className="text-white font-semibold">JD</span>
                  </div>
                  <div>
                    <div className="font-semibold">Jake Davis</div>
                    <div className="text-gray-400 text-sm">TikTok Influencer</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={300}>
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 hover-lift">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"Finally, a tool that handles everything from script to social media posting. It's like having a full video production team."</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#27AE60] rounded-full flex items-center justify-center mr-3 animate-pulse">
                    <span className="text-white font-semibold">AL</span>
                  </div>
                  <div>
                    <div className="font-semibold">Alex Lee</div>
                    <div className="text-gray-400 text-sm">Marketing Director</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#27AE60] to-[#2ECC71]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Transform Your Content Creation?</h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={200}>
            <p className="text-xl text-green-100 mb-8">Join thousands of creators who are already using Vidzyme to scale their content.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={400}>
            <button
              onClick={() => onNavigate('signup')}
              className="bg-white text-[#27AE60] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 hover-glow"
            >
              Start Your Free Trial
            </button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}