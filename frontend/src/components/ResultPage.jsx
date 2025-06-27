import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar
} from 'recharts';

//chart colors
const PIE_COLORS = ['#006400', // DarkGreen
  '#228B22', // ForestGreen
  '#2E8B57', // SeaGreen
  '#006A4E', // BottleGreen
  '#556B2F', // DarkOliveGreen
  '#3B7A57', // Amazon
  '#264d00', // Deep Green
  '#013220'];
const BAR_COLORS = ['#38a169', '#48bb78', '#81e6d9'];
const BMI_COLORS = ['#a0aec0', '#68d391', '#f6e05e', '#fc8181'];

//BMI Radial Gauge Component
function BmiGauge({ bmiValue }) {
  const bmi = parseFloat(bmiValue);
  const bmiData = [
    { name: 'Underweight', value: 18.5, fill: BMI_COLORS[0] },
    { name: 'Normal', value: 6.4, fill: BMI_COLORS[1] },
    { name: 'Overweight', value: 5, fill: BMI_COLORS[2] },
    { name: 'Obese', value: 10, fill: BMI_COLORS[3] },
    { name: 'Your BMI', value: bmi, fill: '#8884d8' }
  ];

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-center mb-4 text-gray-700">BMI Health Indicator</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="20%"
            outerRadius="100%"
            data={bmiData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              minAngle={15}
              label={{ position: 'insideStart', fill: '#fff' }}
              background
              clockWise
              dataKey="value"
            />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            <Tooltip
              formatter={(value, name) =>
                name === 'Your BMI' ? [`${value}`, 'Your BMI'] : null
              }
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

BmiGauge.propTypes = {
  bmiValue: PropTypes.string.isRequired,
};

// Nutrition Pie Chart
function NutritionPieChart({ recommendations }) {
  const processedData = recommendations.map((item, index) => ({
    name: `${item?.food_recommendation?.split(',')[0] || 'Meal'} #${index + 1}`,
    value: item.calories,
  }));
  

  const renderLabel = ({ percent }) => `${(percent * 100).toFixed(0)}%`;

  return (
    <div className="w-full bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold text-center py-4 text-gray-800 bg-gray-50 rounded-t-lg">
        Calories Distribution
      </h3>
      <div className="h-80 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={processedData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={50}
              paddingAngle={3}
              label={renderLabel}
              labelLine={false}
            >
              {processedData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} calories`} />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

NutritionPieChart.propTypes = {
  recommendations: PropTypes.arrayOf(
    PropTypes.shape({
      food_recommendation: PropTypes.string.isRequired,
      calories: PropTypes.number.isRequired,
    })
  ).isRequired,
};

// Nutrition Bar Chart
function NutritionBarChart({ recommendations }) {
  const barData = recommendations.map((meal, index) => ({
    name: `Meal ${index + 1}`,
    Protein: meal.protein,
    Carbs: meal.carbs,
    Fats: meal.fats,
  }));

  return (
    <div className="w-full bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold text-center py-4 text-gray-800 bg-gray-50 rounded-t-lg">
        Nutrients Comparison
      </h3>
      <div className="h-80 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Protein" fill={BAR_COLORS[0]} name="Protein (g)" />
            <Bar dataKey="Carbs" fill={BAR_COLORS[1]} name="Carbs (g)" />
            <Bar dataKey="Fats" fill={BAR_COLORS[2]} name="Fats (g)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

NutritionBarChart.propTypes = {
  recommendations: PropTypes.arrayOf(
    PropTypes.shape({
      protein: PropTypes.number.isRequired,
      carbs: PropTypes.number.isRequired,
      fats: PropTypes.number.isRequired,
    })
  ).isRequired,
};

// Main Result Page
export default function ResultPage() {
  const { state } = useLocation();
  const result = state?.result;
  const recommendations = result?.recommendations?.recommendations ?? [];
  console.log("Parsed recommendations array:", recommendations);


  // console.log("Result object:", result);

  // const recommendations = Array.isArray(response?.recommendations) ? response.recommendations : [];

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <p className="text-gray-700">No results found. Please fill the form first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#e6fff5] p-4">
  {result.message ? (
    <div className="bg-yellow-100 p-6 rounded-lg shadow-md">
      <p className="text-yellow-800">{result.message}</p>
    </div>
  ) : (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-6xl mx-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#1e4d2b]">Your Health Report</h2>
        <div className="mt-4 text-xl">
          <span className="font-semibold">BMI: </span>
          <span className={`font-bold ${
            result.health_status === 'Underweight' ? 'text-blue-500' :
            result.health_status === 'Normal' ? 'text-green-600' :
            result.health_status === 'Overweight' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {result.bmi} ({result.health_status})
          </span>
        </div>
      </div>

      {/* BMI Chart */}
      <div className="mb-8">
        <BmiGauge bmiValue={result.bmi} />
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
          <div className="bg-blue-100 text-blue-900 p-2 rounded">Underweight (&lt;18.5)</div>
          <div className="bg-green-100 text-green-900 p-2 rounded">Normal (18.5–24.9)</div>
          <div className="bg-yellow-100 text-yellow-900 p-2 rounded">Overweight (25–29.9)</div>
          <div className="bg-red-100 text-red-900 p-2 rounded">Obese (30+)</div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-[#1e4d2b]">Recommended Meals</h3>
        <ul className="space-y-4">
          {recommendations.map((meal, index) => (
            <li key={index} className="p-4 bg-[#f0fdf4] rounded-lg hover:bg-[#defbe6] transition">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-800">
                <p><strong>Meal:</strong> {meal.meal}</p>
                <p><strong>Calories:</strong> {meal.calories}g</p>
                <p><strong>Protein:</strong> {meal.protein}g</p>
                <p><strong>Carbs:</strong> {meal.carbs}g</p>
                <p><strong>Fats:</strong> {meal.fats}g</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <NutritionPieChart recommendations={recommendations} />
        <NutritionBarChart recommendations={recommendations} />
      </div>
    </div>
  )}
</div>
  );
}
