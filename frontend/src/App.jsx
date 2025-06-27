import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import NutritionForm from './components/NutritionForm';
import ResultPage from './components/ResultPage';

function App() {
  // const navigate = useNavigate(); // <-- Define navigate here
  // const [submittedData, setSubmittedData] = useState(null);

  // const handleFormSubmit = (formData) => {
  //   setSubmittedData(formData);
  //   // Use navigate to go to the ResultPage after submitting the form
  //   navigate('/result', { state: { result: formData } });
  // };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<NutritionForm />}
        />
        <Route
          path="/result"
          element={<ResultPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
