import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NutritionForm() {
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    diseases: "",
    medications: "",
    allergies: "",
    dietary_restrictions: "",
    max_calories: "",
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const requestData = {
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        max_calories: parseFloat(formData.max_calories),
        diseases: formData.diseases ? [formData.diseases] : [],
        medications: formData.medications ? [formData.medications] : [],
        allergies: formData.allergies ? [formData.allergies] : [],
        dietary_restrictions: formData.dietary_restrictions.toLowerCase()
      };

      const response = await axios.post(
        "http://localhost:5555/personalised_meal_plan", 
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.message) {
        setResult({ message: response.data.message });
      } else {
        const bmi = (requestData.weight / ((requestData.height / 100) ** 2)).toFixed(2);
        let health_status = '';
        if (bmi < 18.5) health_status = 'Underweight';
        else if (bmi < 24.9) health_status = 'Normal';
        else if (bmi < 29.9) health_status = 'Overweight';
        else health_status = 'Obese';

        setResult({
          bmi,
          health_status,
          recommendations: response.data
        });
        navigate("/result", { state: { result: { 
            bmi,
            health_status,
            recommendations: response.data
          }}});
      }
      
    } catch (error) {
      console.error("Error fetching data", error);
      setError(error.response?.data?.error || "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-emerald-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-emerald-100">
        <div className="text-center mb-8">
          <div className="inline-block bg-emerald-100 p-4 rounded-full">
            <span className="text-4xl text-emerald-600">🥑</span>
          </div>
          <h2 className="text-3xl font-bold text-emerald-800 mt-4 mb-2 font-serif">
            Personalized Nutrition Guide
          </h2>
          <p className="text-emerald-600 text-lg">Get Your Custom Meal Plan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                🏋️ Weight (kg)
              </label>
              <input 
                type="number" 
                name="weight" 
                value={formData.weight} 
                onChange={handleChange} 
                className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
                required 
                min="1"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                📏 Height (cm)
              </label>
              <input 
                type="number" 
                name="height" 
                value={formData.height} 
                onChange={handleChange} 
                className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
                required 
                min="1"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-emerald-700 mb-2">
              🍽️ Dietary Preferences
            </label>
            <select
              name="dietary_restrictions"
              value={formData.dietary_restrictions}
              onChange={handleChange}
              className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 appearance-none bg-white"
              required
            >
              <option value="">Select Your Diet...</option>
              <option value="vegetarian">🌱 Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="non-vegetarian">🍗 Non-Vegetarian</option>
              {/* <option value="gluten-free">Gluten-free</option> */}
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-emerald-700 mb-2">
              🔥 Daily Calorie Limit
            </label>
            <input 
              type="number" 
              name="max_calories" 
              value={formData.max_calories} 
              onChange={handleChange} 
              className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
              required 
              min="1"
              placeholder="Enter your calorie goal"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-emerald-700 mb-2">
              ⚕️ Health Conditions
            </label>
            <input 
              type="text" 
              name="diseases" 
              placeholder="e.g., Diabetes, Hypertension" 
              value={formData.diseases} 
              onChange={handleChange} 
              className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-emerald-700 mb-2">
              💊 Current Medications
            </label>
            <input 
              type="text" 
              name="medications" 
              placeholder="e.g., Aspirin, Insulin" 
              value={formData.medications} 
              onChange={handleChange} 
              className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-emerald-700 mb-2">
              🚫 Food Allergies
            </label>
            <input 
              type="text" 
              name="allergies" 
              placeholder="e.g., Nuts, Shellfish" 
              value={formData.allergies} 
              onChange={handleChange} 
              className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-semibold transition-all 
                      transform hover:scale-[1.02] shadow-lg hover:shadow-emerald-100 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Analyzing...
              </div>
            ) : (
              <>
                🍎 Generate My Plan
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </div>
        )}

        {result && result.message && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-emerald-700">🍃 {result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}