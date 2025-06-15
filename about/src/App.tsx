import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Calendar, 
  Users, 
  Trophy, 
  Star, 
  Check, 
  ArrowRight, 
  Menu, 
  X,
  Target,
  BookOpen,
  Clock,
  Globe,
  Award,
  Zap,
  ChevronDown,
  MessageCircle,
  Heart,
  Smartphone,
  Video,
  RotateCcw,
  Gauge
} from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Calendar className="w-12 h-12" />,
      title: "毎日の習慣づくり",
      subtitle: "Daily Habit Building",
      description: "あなたのペースに合わせた個別の練習プランで、無理なく空手を習慣化できます。",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Video className="w-12 h-12" />,
      title: "動画で自習学習",
      subtitle: "Video Self-Learning", 
      description: "高品質な動画コンテンツで、基礎から応用まで段階的に自分のペースで学習できます。",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <RotateCcw className="w-12 h-12" />,
      title: "鏡映し・スロー再生",
      subtitle: "Mirror & Slow Motion",
      description: "鏡映し表示とスロー再生（0.5倍速）で、動きを正確に理解し練習できます。",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "世界中の仲間",
      subtitle: "Global Community",
      description: "世界中の空手愛好家とつながり、お互いの成長を応援し合えるコミュニティです。",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "レベルを選択",
      subtitle: "Choose Your Level",
      description: "初心者から上級者まで、あなたの経験に合わせてコースを選択します。",
      image: "🥋"
    },
    {
      number: "2", 
      title: "習慣を設定",
      subtitle: "Set Your Routine",
      description: "ライフスタイルに合わせて、毎日の練習スケジュールを作成します。",
      image: "📅"
    },
    {
      number: "3",
      title: "動画で学習",
      subtitle: "Learn with Videos", 
      description: "高品質な動画を見ながら、自宅で本格的な空手を自習で学びます。",
      image: "📱"
    },
    {
      number: "4",
      title: "成長を実感",
      subtitle: "Track Progress",
      description: "詳細な分析と達成バッジで、あなたの上達を可視化します。",
      image: "🏆"
    }
  ];

  // const testimonials = [
  //   {
  //     name: "田中 美咲",
  //     nameEn: "Misaki Tanaka",
  //     country: "日本 / Japan",
  //     text: "忙しい毎日でも続けられる！6ヶ月間毎日練習を続けています。",
  //     textEn: "I can continue even with a busy schedule! I've been practicing daily for 6 months.",
  //     rating: 5,
  //     avatar: "👩"
  //   },
  //   {
  //     name: "マルコ・ロドリゲス",
  //     nameEn: "Marco Rodriguez", 
  //     country: "スペイン / Spain",
  //     text: "動画の品質が素晴らしく、習慣トラッキングが毎日のモチベーションになっています。",
  //     textEn: "The video quality is exceptional and habit tracking motivates me every day.",
  //     rating: 5,
  //     avatar: "👨"
  //   },
  //   {
  //     name: "エマ・チェン",
  //     nameEn: "Emma Chen",
  //     country: "オーストラリア / Australia", 
  //     text: "忙しい社会人にぴったり。いつでもどこでも空手を練習できます。",
  //     textEn: "Perfect for busy professionals. I can practice karate anywhere, anytime.",
  //     rating: 5,
  //     avatar: "👩‍💼"
  //   }
  // ];

  const faqs = [
    {
      question: "空手初心者でも大丈夫ですか？",
      questionEn: "Is it okay for karate beginners?",
      answer: "はい、完全初心者の方でも安心して始められます。基礎の基礎から丁寧な動画で、あなたのペースに合わせて進められます。"
    },
    {
      question: "どのくらいの時間が必要ですか？",
      questionEn: "How much time do I need?",
      answer: "1日15分から始められます。忙しい方でも続けやすいよう、短時間で効果的な練習メニューを用意しています。"
    },
    {
      question: "スマートフォンでも利用できますか？",
      questionEn: "Can I use it on my smartphone?",
      answer: "はい、スマートフォン、タブレット、パソコンなど、どのデバイスでもご利用いただけます。"
    },
    {
      question: "海外からでも利用できますか？",
      questionEn: "Can I use it from overseas?",
      answer: "はい、世界中どこからでもご利用いただけます。多言語対応も順次拡大予定です。"
    },
    {
      question: "鏡映し機能とは何ですか？",
      questionEn: "What is the mirror function?",
      answer: "動画を左右反転して表示する機能です。まるで鏡を見ているように、講師と同じ向きで練習できるため、動きを正確に覚えられます。"
    },
    {
      question: "スロー再生はどのように使いますか？",
      questionEn: "How do I use slow motion playback?",
      answer: "複雑な動きや技を0.5倍速でゆっくり再生できます。細かい動作を確認しながら、正確なフォームを身につけることができます。"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">空手ポケット道場</div>
                <div className="text-xs text-gray-500">Karate Pocket Dojo</div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-red-600 transition-colors font-medium">特徴</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-red-600 transition-colors font-medium">使い方</a>
              <a href="#faq" className="text-gray-700 hover:text-red-600 transition-colors font-medium">FAQ</a>
              <button className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2.5 rounded-full hover:shadow-lg transition-all duration-300 font-medium">
                無料で始める
              </button>
            </div>

            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 text-gray-700 font-medium">特徴</a>
              <a href="#how-it-works" className="block py-2 text-gray-700 font-medium">使い方</a>
              <a href="#faq" className="block py-2 text-gray-700 font-medium">FAQ</a>
              <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-full mt-4 font-medium">
                無料で始める
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-orange-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <Heart className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">まもなくリリース予定</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="block">自宅で始める</span>
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent block">
                  空手の習慣化
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                忙しい毎日でも続けられる。動画学習と習慣化サポートで、
                <br className="hidden sm:block" />
                あなたの空手ライフを始めませんか？
              </p>
              
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Transform your daily routine with comprehensive karate video learning platform.
                Build lasting habits while mastering traditional techniques from home.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
                事前登録で特典GET
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </button>
              <button className="bg-white text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors shadow-md border border-gray-200">
                デモを見る
                <Play className="inline-block ml-2 w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 pt-4">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-red-500" />
                <span>高品質動画</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-blue-500" />
                <span>鏡映し対応</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-green-500" />
                <span>世界対応</span>
              </div>
            </div>
          </div>

          {/* Hero Visual - Practice Calendar Style */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">練習カレンダー</h3>
                  <p className="text-gray-600">日々のトレーニング進捗を追跡</p>
                </div>
                
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">1</div>
                    <div className="text-sm text-gray-600">今日の練習回数</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
                    <div className="text-sm text-gray-600">練習日数</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">3%</div>
                    <div className="text-sm text-gray-600">達成率</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">1</div>
                    <div className="text-sm text-gray-600">今月の目標</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <ChevronDown className="w-5 h-5 rotate-90 text-gray-600" />
                    </button>
                    <h4 className="text-lg font-semibold text-gray-900">2025年6月</h4>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <ChevronDown className="w-5 h-5 -rotate-90 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    <div className="text-gray-500 font-medium py-2">S</div>
                    <div className="text-gray-500 font-medium py-2">M</div>
                    <div className="text-gray-500 font-medium py-2">T</div>
                    <div className="text-gray-500 font-medium py-2">W</div>
                    <div className="text-gray-500 font-medium py-2">T</div>
                    <div className="text-gray-500 font-medium py-2">F</div>
                    <div className="text-gray-500 font-medium py-2">S</div>
                    
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map((day) => (
                      <div 
                        key={day} 
                        className={`py-2 rounded-lg transition-colors ${
                          day === 14 
                            ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold' 
                            : day === 3 
                            ? 'bg-green-100 text-green-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Karate Pocket Dojo Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-red-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white space-y-8">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <MessageCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">空手ポケット道場って何？</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold">
              より簡単に、あなたの物語を。
            </h2>
            
            <p className="text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
              空手ポケット道場は、忙しい現代人のために作られた革新的な動画学習プラットフォームです。
              伝統的な空手の技術と現代の習慣化科学を組み合わせ、
              誰でも自宅で本格的な空手を自習で学べる環境を提供します。
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold mb-3">いつでもどこでも</h3>
                <p className="text-orange-100">
                  スマートフォンがあれば、通勤中でも自宅でも、
                  あなたの好きな時間に空手を学習できます。
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-3">習慣化をサポート</h3>
                <p className="text-orange-100">
                  科学的な習慣形成理論に基づいて、
                  無理なく継続できる学習プランを提案します。
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-xl font-bold mb-3">鏡映し・スロー再生</h3>
                <p className="text-orange-100">
                  鏡映し表示とスロー再生で、
                  複雑な動きも正確に理解できます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              選ばれる理由
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              空手ポケット道場が多くの学習者に愛される4つの特徴
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <div className={`bg-gradient-to-br ${feature.color} p-6 text-white`}>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-center text-sm opacity-90">
                    {feature.subtitle}
                  </p>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              動画学習の特徴
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              最適な学習環境を提供する3つの動画機能
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <RotateCcw className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">鏡映し表示</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                動画を左右反転して表示。まるで鏡を見ているように、講師と同じ向きで練習できます。
              </p>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-700 font-medium">
                  ✨ 正確なフォームを身につけやすい
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Gauge className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">スロー再生</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                0.5倍速でゆっくり再生。複雑な動きや技を細かく確認しながら練習できます。
              </p>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-700 font-medium">
                  ✨ 細かい動作まで理解できる
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Play className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">通常再生</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                1倍速の通常再生で、実際のスピードでの動きを確認。リズムを掴めます。
              </p>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-700 font-medium">
                  ✨ 実践的なリズム感を養える
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              使い方はとても簡単
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              4つのステップで空手の習慣化を始められます
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-6 hover:shadow-xl transition-all duration-300">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                      {step.image}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {step.subtitle}
                    </p>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-red-300">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Commented Out */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              利用者の声
            </h2>
            <p className="text-xl text-gray-600">
              世界中の学習者から愛されています
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                <div className="space-y-4 mb-6">
                  <p className="text-gray-800 font-medium leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    "{testimonial.textEn}"
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.nameEn}</p>
                    <p className="text-xs text-gray-500">{testimonial.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              よくある質問
            </h2>
            <p className="text-xl text-gray-600">
              お客様からよくいただく質問にお答えします
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <button
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {faq.questionEn}
                    </p>
                  </div>
                  <ChevronDown 
                    className={`w-6 h-6 text-gray-400 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {openFaq === index && (
                  <div className="px-8 pb-6">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                今すぐ空手の習慣を始めませんか？
              </h2>
              <p className="text-xl text-red-100">
                世界中の仲間と一緒に、あなたの空手ライフをスタートしましょう
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-red-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg">
                事前登録で特典GET
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-red-600 transition-colors">
                詳しく相談する
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-red-100">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>メール登録のみ</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>リリース時特典あり</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>いつでも配信停止可能</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">空手ポケット道場</div>
                  <div className="text-xs text-gray-400">Karate Pocket Dojo</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                自宅で始める空手の習慣化プラットフォーム。
                あなたのペースで、確実に上達できます。
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">サービス</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">特徴</a></li>
                <li><a href="#" className="hover:text-white transition-colors">動画学習</a></li>
                <li><a href="#" className="hover:text-white transition-colors">習慣化サポート</a></li>
                <li><a href="#" className="hover:text-white transition-colors">モバイルアプリ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">サポート</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">ヘルプセンター</a></li>
                <li><a href="#" className="hover:text-white transition-colors">コミュニティ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">お問い合わせ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">会社情報</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">私たちについて</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ブログ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">採用情報</a></li>
                <li><a href="#" className="hover:text-white transition-colors">プレス</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 空手ポケット道場 / Karate Pocket Dojo. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">プライバシーポリシー</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">利用規約</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;