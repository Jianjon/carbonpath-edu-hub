
import { Info, Mail, User } from 'lucide-react';

const AboutSection = () => {
    return (
        <div className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        關於本站與聯絡方式
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        本站旨在提供一個學習永續發展的模擬平台，所有數據與分析僅供教學參考。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left side: About text */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                                <Info className="h-6 w-6 mr-2 text-green-600" />
                                網站初衷
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                建立這個網站的初衷，是希望提供一個簡單易用的平台，幫助企業與個人更好地理解與實踐永續發展及減碳策略。透過互動式工具與模擬，讓複雜的永續概念變得平易近人。
                            </p>
                        </div>
                        <div>
                             <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                                <Info className="h-6 w-6 mr-2 text-yellow-600" />
                                重要聲明
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                請注意：本網站所有數據與分析結果均為模擬情境，僅供學習與理解原理之用，不構成任何實際的投資或決策建議。
                            </p>
                        </div>
                    </div>

                    {/* Right side: Contact Info */}
                    <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">聯絡我</h3>
                        <div className="flex flex-col items-center space-y-4">
                            <img 
                                src="/lovable-uploads/2c3ccb0e-a2ac-4e11-b16c-d153e30ad962.png" 
                                alt="LINE QR Code"
                                className="w-40 h-40 rounded-md"
                            />
                             <div className="text-center">
                                <p className="text-gray-700 font-medium flex items-center justify-center">
                                    <User className="h-5 w-5 mr-2 text-gray-500" />
                                    Jon Chang
                                </p>
                                <p className="text-gray-700 font-medium flex items-center mt-2 justify-center">
                                    <Mail className="h-5 w-5 mr-2 text-gray-500" />
                                    <a href="mailto:jonchang1980@gmail.com" className="hover:text-green-600">
                                        jonchang1980@gmail.com
                                    </a>
                                </p>
                                <p className="text-sm text-gray-500 mt-3">（掃描QR Code或透過Email與我聯繫）</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutSection;
