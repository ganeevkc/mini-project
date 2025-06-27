import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

df = pd.read_csv('intelligent_health_meal_dataset.csv')
df.columns = df.columns.str.strip()

string_columns = ['Diseases', 'Medications', 'Allergies', 'Dietary Restrictions', 'Food Recommendations']
for col in string_columns:
    if col in df.columns:
        df[col] = df[col].astype(str).str.strip().str.lower()

# Normalize 'Diet' for filtering
df['Diet'] = df['Diet'].astype(str).str.lower().str.replace('-', '').str.replace(' ', '')

@app.route('/personalised_meal_plan', methods=['POST'])
def personalised_meal_plan():
    data = request.get_json()

    required_fields = ['weight', 'height', 'dietary_restrictions', 'max_calories', 'diseases', 'medications', 'allergies']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400

    try:
        weight = float(data.get('weight'))
        height = float(data.get('height'))
        max_calories = float(data.get('max_calories'))

        # 🧼 Normalize input case + format
        diseases = [d.strip().lower() for d in data.get('diseases', data.get('Health Conditions', [])) if d]
        medications = [m.strip().lower() for m in data.get('medications', data.get('Current Medications', [])) if m]
        allergies = [a.strip().lower() for a in data.get('allergies', data.get('Food allergies', [])) if a]

        # Normalize diet (e.g., 'nonvegetarian' → 'non vegetarian')
        raw_diet = str(data.get('dietary_restrictions', '')).strip().lower().replace('-', '').replace('_', '')
        diet_mapping = {
            'nonvegetarian': 'non vegetarian',
            'vegetarian': 'vegetarian',
            'vegan': 'vegan'
        }
        normalized_diet = diet_mapping.get(raw_diet, raw_diet)  # Fallback to raw if not matched
        diet_preference = normalized_diet.replace(' ', '')  # For matching

    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid input for weight, height, or max_calories'}), 400

    print("GUI Input:", weight, height, diseases, medications, allergies, diet_preference, max_calories)

    recommendations = df.copy()

    try:
        # Filter: Diet & Calories
        recommendations = recommendations[
            (recommendations['Calories'] <= max_calories) &
            (recommendations['Diet'].str.lower() == diet_preference)
        ]

        # Filter: Allergies
        if allergies:
            allergy_pattern = '|'.join(allergies)
            recommendations = recommendations[
                ~recommendations['Allergies'].str.contains(allergy_pattern, case=False, na=False)
            ]

        # Filter: Diseases
        if diseases:
            disease_pattern = '|'.join(diseases)
            recommendations = recommendations[
                recommendations['Diseases'].str.contains(disease_pattern, case=False, na=False)
            ]

        # Fallbacks if no result
        if recommendations.empty:
            recommendations = df[
                (df['Calories'] <= max_calories) &
                (df['Diet'].str.lower().str.contains(diet_preference, case=False, na=False))
            ]
            if allergies:
                recommendations = recommendations[
                    ~recommendations['Allergies'].str.contains(allergy_pattern, case=False, na=False)
                ]

        if recommendations.empty:
            recommendations = df.sort_values('Calories').head(5)
        else:
            recommendations = recommendations.sort_values(
                by=['Protein', 'Calories'],
                ascending=[False, True]
            ).head(5)

    except KeyError as e:
        print(f"Column not found: {e}")
        return jsonify({'error': 'Data configuration error'}), 500

    if recommendations.empty:
        return jsonify({'message': 'No recommendations available based on your inputs.'}), 200

    result = []
    for _, row in recommendations.iterrows():
        result.append({
            'meal': row['Food Recommendations'].title(),
            'calories': row['Calories'],
            'protein': row['Protein'],
            'carbs': row['Carbs'],
            'fats': row['Fats'],
            'diet_type': row['Diet'].title()
        })

    return jsonify({
        'status': 'success',
        'recommendations': result,
        'filters_applied': {
            'diet': diet_preference,
            'max_calories': max_calories,
            'allergies': allergies,
            'diseases': diseases
        }
    })


if __name__ == '__main__':
    app.run(debug=True, port=5555)
