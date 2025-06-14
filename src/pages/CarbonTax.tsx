
import { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import Navigation from '../components/Navigation';

const CarbonTax = () => {
  const [emissionData, setEmissionData] = useState({
    scope1: '',
    scope2: '',
    scope3: '',
    carbonPrice: '300'
  });

  const [results, setResults] = useState({
    totalEmissions: 0,
    totalCost: 0,
    scope1Cost: 0,
    scope2Cost: 0,
    scope3Cost: 0
  });

  const handleCalculate = () => {
    const scope1 = parseFloat(emissionData.scope1) || 0;
    const scope2 = parseFloat(emissionData.scope2) || 0;
    const scope3 = parseFloat(emissionData.scope3) || 0;
    const price = parseFloat(emissionData.carbonPrice) || 0;

    const totalEmissions = scope1 + scope2 + scope3;
    const scope1Cost = scope1 * price;
    const scope2Cost = scope2 * price;
    const scope3Cost = scope3 * price;
    const totalCost = totalEmissions * price;

    setResults({
      totalEmissions,
      totalCost,
      scope1Cost,
      scope2Cost,
      scope3Cost
    });
  };

  const scenarios = [
    { price: 200, description: '保守情境', year: '2024' },
    { price: 300, description: '基準情境', year: '2025' },
    { price: 500, description: '積極情境', year: '2026' },
    { price: 800, description: '嚴格情境', year: '2027' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              碳費模擬計算
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              精確計算碳費成本，協助企業進行財務規劃與減碳投資評估
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Calculator className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">碳費計算器</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  範疇一排放量 (公噸CO2e)
                </label>
                <input
                  type="number"
                  value={emissionData.scope1}
                  onChange={(e) => setEmissionData({...emissionData, scope1: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="直接排放量"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  範疇二排放量 (公噸CO2e)
                </label>
                <input
                  type="number"
                  value={emissionData.scope2}
                  onChange={(e) => setEmissionData({...emissionData, scope2: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="間接排放量"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  範疇三排放量 (公噸CO2e)
                </label>
                <input
                  type="number"
                  value={emissionData.scope3}
                  onChange={(e) => setEmissionData({...emissionData, scope3: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="其他間接排放量"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  碳價 (NT$/噸CO2e)
                </label>
                <input
                  type="number"
                  value={emissionData.carbonPrice}
                  onChange={(e) => setEmissionData({...emissionData, carbonPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="300"
                />
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                計算碳費
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">計算結果</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">總排放量</div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.totalEmissions.toLocaleString()} 公噸CO2e
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">總碳費成本</div>
                <div className="text-2xl font-bold text-blue-600">
                  NT$ {results.totalCost.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-red-600 mb-1">範疇一</div>
                  <div className="text-sm font-semibold text-red-600">
                    NT$ {results.scope1Cost.toLocaleString()}
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-yellow-600 mb-1">範疇二</div>
                  <div className="text-sm font-semibold text-yellow-600">
                    NT$ {results.scope2Cost.toLocaleString()}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-green-600 mb-1">範疇三</div>
                  <div className="text-sm font-semibold text-green-600">
                    NT$ {results.scope3Cost.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scenarios Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">碳價情境分析</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {scenarios.map((scenario, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-gray-900 mb-2">
                  NT$ {scenario.price}
                </div>
                <div className="text-sm text-gray-600 mb-1">{scenario.description}</div>
                <div className="text-xs text-gray-500">{scenario.year}</div>
                <div className="mt-3 text-sm font-medium text-blue-600">
                  總成本: NT$ {(results.totalEmissions * scenario.price).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonTax;
