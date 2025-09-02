import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const Calculators = () => {
  const { t } = useTranslation();
  const [activeCalculator, setActiveCalculator] = useState('bmi');
  
  // BMI Calculator State
  const [bmiData, setBmiData] = useState({ height: '', weight: '', result: null });
  
  // BMR Calculator State
  const [bmrData, setBmrData] = useState({ 
    height: '', 
    weight: '', 
    age: '', 
    gender: 'male', 
    result: null 
  });
  
  // Calorie Calculator State
  const [calorieData, setCalorieData] = useState({
    height: '',
    weight: '',
    age: '',
    gender: 'male',
    activity: 'sedentary',
    result: null
  });
  
  // Water Calculator State
  const [waterData, setWaterData] = useState({ weight: '', activity: 'sedentary', result: null });

  const calculateBMI = () => {
    const heightM = parseFloat(bmiData.height) / 100;
    const weight = parseFloat(bmiData.weight);
    
    if (heightM > 0 && weight > 0) {
      const bmi = weight / (heightM * heightM);
      let category = '';
      
      if (bmi < 18.5) {
        category = 'Underweight / Zayıf';
      } else if (bmi < 25) {
        category = 'Normal / Normal';
      } else if (bmi < 30) {
        category = 'Overweight / Fazla Kilolu';
      } else {
        category = 'Obese / Obez';
      }
      
      setBmiData({ ...bmiData, result: { bmi: bmi.toFixed(1), category } });
    }
  };

  const calculateBMR = () => {
    const height = parseFloat(bmrData.height);
    const weight = parseFloat(bmrData.weight);
    const age = parseFloat(bmrData.age);
    
    if (height > 0 && weight > 0 && age > 0) {
      let bmr;
      if (bmrData.gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }
      
      setBmrData({ ...bmrData, result: Math.round(bmr) });
    }
  };

  const calculateCalories = () => {
    const height = parseFloat(calorieData.height);
    const weight = parseFloat(calorieData.weight);
    const age = parseFloat(calorieData.age);
    
    if (height > 0 && weight > 0 && age > 0) {
      let bmr;
      if (calorieData.gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }
      
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9
      };
      
      const calories = bmr * activityMultipliers[calorieData.activity];
      setCalorieData({ ...calorieData, result: Math.round(calories) });
    }
  };

  const calculateWater = () => {
    const weight = parseFloat(waterData.weight);
    
    if (weight > 0) {
      let baseWater = weight * 35; // ml per kg
      
      if (waterData.activity === 'active' || waterData.activity === 'veryActive') {
        baseWater += 500; // Additional water for active individuals
      }
      
      setWaterData({ ...waterData, result: Math.round(baseWater) });
    }
  };

  const calculatorTabs = [
    { id: 'bmi', title: t('calculators.bmi.title'), icon: 'bi-calculator' },
    { id: 'bmr', title: t('calculators.bmr.title'), icon: 'bi-speedometer2' },
    { id: 'calorie', title: t('calculators.calorie.title'), icon: 'bi-fire' },
    { id: 'water', title: t('calculators.water.title'), icon: 'bi-droplet' }
  ];

  return (
    <>
      <Helmet>
        <title>{t('calculators.title')} - Oğuz Yolyapan</title>
        <meta name="description" content={t('calculators.subtitle')} />
      </Helmet>

      <div className="container py-5">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-4">{t('calculators.title')}</h1>
              <p className="lead text-muted">{t('calculators.subtitle')}</p>
            </div>

            {/* Calculator Tabs */}
            <div className="row mb-4">
              <div className="col-12">
                <nav className="nav nav-pills nav-justified">
                  {calculatorTabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`nav-link ${activeCalculator === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveCalculator(tab.id)}
                    >
                      <i className={`${tab.icon} me-2`}></i>
                      {tab.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* BMI Calculator */}
            {activeCalculator === 'bmi' && (
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h4 className="mb-0">
                    <i className="bi bi-calculator me-2"></i>
                    {t('calculators.bmi.title')}
                  </h4>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-4">{t('calculators.bmi.description')}</p>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{t('calculators.bmi.height')}</label>
                        <input
                          type="number"
                          className="form-control"
                          value={bmiData.height}
                          onChange={(e) => setBmiData({ ...bmiData, height: e.target.value })}
                          placeholder="170"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{t('calculators.bmi.weight')}</label>
                        <input
                          type="number"
                          className="form-control"
                          value={bmiData.weight}
                          onChange={(e) => setBmiData({ ...bmiData, weight: e.target.value })}
                          placeholder="70"
                        />
                      </div>
                    </div>
                  </div>
                  <button onClick={calculateBMI} className="btn btn-primary mb-3">
                    {t('calculators.bmi.calculate')}
                  </button>
                  {bmiData.result && (
                    <div className="alert alert-info">
                      <h5>{t('calculators.bmi.result')}</h5>
                      <p className="mb-1"><strong>BMI: {bmiData.result.bmi}</strong></p>
                      <p className="mb-0">Category: {bmiData.result.category}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BMR Calculator */}
            {activeCalculator === 'bmr' && (
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  <h4 className="mb-0">
                    <i className="bi bi-speedometer2 me-2"></i>
                    {t('calculators.bmr.title')}
                  </h4>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-4">{t('calculators.bmr.description')}</p>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">{t('calculators.bmi.height')}</label>
                        <input
                          type="number"
                          className="form-control"
                          value={bmrData.height}
                          onChange={(e) => setBmrData({ ...bmrData, height: e.target.value })}
                          placeholder="170"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">{t('calculators.bmi.weight')}</label>
                        <input
                          type="number"
                          className="form-control"
                          value={bmrData.weight}
                          onChange={(e) => setBmrData({ ...bmrData, weight: e.target.value })}
                          placeholder="70"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">{t('calculators.bmr.age')}</label>
                        <input
                          type="number"
                          className="form-control"
                          value={bmrData.age}
                          onChange={(e) => setBmrData({ ...bmrData, age: e.target.value })}
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t('calculators.bmr.gender')}</label>
                    <select
                      className="form-select"
                      value={bmrData.gender}
                      onChange={(e) => setBmrData({ ...bmrData, gender: e.target.value })}
                    >
                      <option value="male">{t('calculators.bmr.male')}</option>
                      <option value="female">{t('calculators.bmr.female')}</option>
                    </select>
                  </div>
                  <button onClick={calculateBMR} className="btn btn-success mb-3">
                    {t('calculators.bmi.calculate')}
                  </button>
                  {bmrData.result && (
                    <div className="alert alert-success">
                      <h5>{t('calculators.bmi.result')}</h5>
                      <p className="mb-0"><strong>BMR: {bmrData.result} calories/day</strong></p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Calorie Calculator */}
            {activeCalculator === 'calorie' && (
              <div className="card shadow-sm">
                <div className="card-header bg-warning text-dark">
                  <h4 className="mb-0">
                    <i className="bi bi-fire me-2"></i>
                    {t('calculators.calorie.title')}
                  </h4>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-4">{t('calculators.calorie.description')}</p>
                  <div className="row">
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">{t('calculators.bmi.height')}</label>
                        <input
                          type="number"
                          className="form-control"
                          value={calorieData.height}
                          onChange={(e) => setCalorieData({ ...calorieData, height: e.target.value })}
                          placeholder="170"
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">{t('calculators.bmi.weight')}</label>
                        <input
                          type="number"
                          className="form-control"
                          value={calorieData.weight}
                          onChange={(e) => setCalorieData({ ...calorieData, weight: e.target.value })}
                          placeholder="70"
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">{t('calculators.bmr.age')}</label>
                        <input
                          type="number"
                          className="form-control"
                          value={calorieData.age}
                          onChange={(e) => setCalorieData({ ...calorieData, age: e.target.value })}
                          placeholder="30"
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">{t('calculators.bmr.gender')}</label>
                        <select
                          className="form-select"
                          value={calorieData.gender}
                          onChange={(e) => setCalorieData({ ...calorieData, gender: e.target.value })}
                        >
                          <option value="male">{t('calculators.bmr.male')}</option>
                          <option value="female">{t('calculators.bmr.female')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t('calculators.calorie.activity')}</label>
                    <select
                      className="form-select"
                      value={calorieData.activity}
                      onChange={(e) => setCalorieData({ ...calorieData, activity: e.target.value })}
                    >
                      <option value="sedentary">{t('calculators.calorie.sedentary')}</option>
                      <option value="light">{t('calculators.calorie.light')}</option>
                      <option value="moderate">{t('calculators.calorie.moderate')}</option>
                      <option value="active">{t('calculators.calorie.active')}</option>
                      <option value="veryActive">{t('calculators.calorie.veryActive')}</option>
                    </select>
                  </div>
                  <button onClick={calculateCalories} className="btn btn-warning mb-3">
                    {t('calculators.bmi.calculate')}
                  </button>
                  {calorieData.result && (
                    <div className="alert alert-warning">
                      <h5>{t('calculators.bmi.result')}</h5>
                      <p className="mb-0"><strong>Daily Calories: {calorieData.result} calories</strong></p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Water Calculator */}
            {activeCalculator === 'water' && (
              <div className="card shadow-sm">
                <div className="card-header bg-info text-white">
                  <h4 className="mb-0">
                    <i className="bi bi-droplet me-2"></i>
                    {t('calculators.water.title')}
                  </h4>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-4">{t('calculators.water.description')}</p>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{t('calculators.bmi.weight')}</label>
                        <input
                          type="number"
                          className="form-control"
                          value={waterData.weight}
                          onChange={(e) => setWaterData({ ...waterData, weight: e.target.value })}
                          placeholder="70"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{t('calculators.calorie.activity')}</label>
                        <select
                          className="form-select"
                          value={waterData.activity}
                          onChange={(e) => setWaterData({ ...waterData, activity: e.target.value })}
                        >
                          <option value="sedentary">{t('calculators.calorie.sedentary')}</option>
                          <option value="active">{t('calculators.calorie.active')}</option>
                          <option value="veryActive">{t('calculators.calorie.veryActive')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <button onClick={calculateWater} className="btn btn-info mb-3">
                    {t('calculators.bmi.calculate')}
                  </button>
                  {waterData.result && (
                    <div className="alert alert-info">
                      <h5>{t('calculators.bmi.result')}</h5>
                      <p className="mb-0"><strong>Daily Water: {waterData.result} ml ({(waterData.result / 1000).toFixed(1)} liters)</strong></p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="alert alert-warning mt-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Disclaimer:</strong> These calculators provide general estimates only. For personalized nutrition advice, please consult with a professional dietitian.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Calculators;
