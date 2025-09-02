import React, { useState, useEffect } from 'react';
import apiClient from '../lib/api';
const NutritionTestModal = ({ show, onHide, isEnglish = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showMotivation, setShowMotivation] = useState(false);
  const [currentMotivation, setCurrentMotivation] = useState('');
  const [testCompleted, setTestCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Sosyal Kanıt Mesajları
  const socialProof = [
    { tr: '✅ Bu ay 2.847 kişi planını aldı', en: '✅ 2,847 people got their plan this month' },
    { tr: '⭐ %96 kullanıcı ilk 2 haftada değişim hissetti', en: '⭐ 96% users felt changes in first 2 weeks' },
    { tr: '💚 Ortalama 4.9/5 memnuniyet puanı', en: '💚 Average 4.9/5 satisfaction rating' },
    { tr: '🏆 Türkiye\'nin en güvenilir beslenme analizi', en: '🏆 Turkey\'s most trusted nutrition analysis' }
  ];

  // Motivasyon mesajları
  const motivationMessages = {
    'basic_info.gender': {
      'female': { tr: '👩 Mükemmel! Kadınlar için özel metabolizma hesaplamamız var', en: '👩 Perfect! We have special metabolism calculations for women' },
      'male': { tr: '👨 Harika! Erkekler için optimize edilmiş planlarımız çok başarılı', en: '👨 Great! Our optimized plans for men are very successful' }
    },
    'lifestyle': {
      'office': { tr: '💼 Ofis çalışanları için özel programlarımız çok popüler', en: '💼 Our special programs for office workers are very popular' }
    }
  };

  // Sorular - Sağlamlaştırılmış
  const questions = [
    {
      id: 'welcome',
      question: { tr: 'Size nasıl yardım edebiliriz?', en: 'How can we help you?' },
      subtitle: { tr: 'Bu test sadece 3 dakika sürüyor', en: 'This test takes only 3 minutes' },
      type: 'choice',
      options: [
        { value: 'lose_weight', label: { tr: '🎯 Kilo vermek istiyorum', en: '🎯 I want to lose weight' }, icon: '🎯', popular: true },
        { value: 'gain_weight', label: { tr: '💪 Sağlıklı kilo almak istiyorum', en: '💪 I want to gain weight' }, icon: '💪' },
        { value: 'build_muscle', label: { tr: '🏋️ Kas geliştirmek istiyorum', en: '🏋️ I want to build muscle' }, icon: '🏋️' },
        { value: 'healthy_living', label: { tr: '🌱 Sağlıklı yaşam tarzı', en: '🌱 Healthy lifestyle' }, icon: '🌱' }
      ]
    },
    {
      id: 'basic_info',
      question: { tr: 'Temel bilgileriniz', en: 'Basic Information' },
      type: 'combined',
      fields: [
        {
          id: 'gender',
          label: { tr: 'Cinsiyet', en: 'Gender' },
          type: 'choice',
          options: [
            { value: 'female', label: { tr: 'Kadın', en: 'Female' }, icon: '👩' },
            { value: 'male', label: { tr: 'Erkek', en: 'Male' }, icon: '👨' }
          ]
        },
        {
          id: 'age',
          label: { tr: 'Yaş', en: 'Age' },
          type: 'number',
          placeholder: { tr: 'Yaşınız', en: 'Your age' },
          min: 16,
          max: 80
        }
      ]
    },
    {
      id: 'body_metrics',
      question: { tr: 'Vücut ölçüleriniz', en: 'Body Measurements' },
      type: 'combined',
      fields: [
        {
          id: 'height',
          label: { tr: 'Boy (cm)', en: 'Height (cm)' },
          type: 'number',
          placeholder: { tr: 'Örn: 170', en: 'e.g: 170' },
          min: 100,
          max: 210
        },
        {
          id: 'weight',
          label: { tr: 'Mevcut Kilo (kg)', en: 'Current Weight (kg)' },
          type: 'number',
          placeholder: { tr: 'Örn: 70', en: 'e.g: 70' },
          min: 30,
          max: 200
        },
        {
          id: 'target_weight',
          label: { tr: 'Hedef Kilo (kg)', en: 'Target Weight (kg)' },
          type: 'number',
          placeholder: { tr: 'Sağlıklı hedef kilo', en: 'Healthy target weight' },
          min: 30,
          max: 200,
          validation: 'healthy_bmi'
        }
      ]
    },
    {
      id: 'lifestyle',
      question: { tr: 'Günlük yaşantınız nasıl?', en: 'What\'s your daily life like?' },
      type: 'choice',
      options: [
        { value: 'student', label: { tr: '🎓 Öğrenci', en: '🎓 Student' }, icon: '🎓' },
        { value: 'office', label: { tr: '💼 Ofis çalışanı', en: '💼 Office worker' }, icon: '💼', popular: true },
        { value: 'active_job', label: { tr: '🚶 Aktif iş', en: '🚶 Active job' }, icon: '🚶' },
        { value: 'retired', label: { tr: '🏡 Emekli/Ev hanımı', en: '🏡 Retired/Homemaker' }, icon: '🏡' }
      ]
    },
    {
      id: 'activity_level',
      question: { tr: 'Spor yapıyor musunuz?', en: 'Do you exercise?' },
      type: 'choice',
      options: [
        { value: 'none', label: { tr: '😴 Hiç spor yapmıyorum', en: '😴 I don\'t exercise' }, icon: '😴' },
        { value: 'light', label: { tr: '🚶 Haftada 1-2 gün', en: '🚶 1-2 days/week' }, icon: '🚶', popular: true },
        { value: 'moderate', label: { tr: '🏃 Haftada 3-4 gün', en: '🏃 3-4 days/week' }, icon: '🏃' },
        { value: 'intense', label: { tr: '🏋️ Haftada 5+ gün', en: '🏋️ 5+ days/week' }, icon: '🏋️' }
      ]
    },
    {
      id: 'health_status',
      question: { tr: 'Sağlık durumunuz?', en: 'Health status?' },
      subtitle: { tr: 'Birden fazla seçebilirsiniz', en: 'Multiple selections allowed' },
      type: 'multiple',
      options: [
        { value: 'healthy', label: { tr: '✅ Sağlıklıyım', en: '✅ I\'m healthy' }, icon: '✅', popular: true },
        { value: 'diabetes', label: { tr: '🩺 Diyabet', en: '🩺 Diabetes' }, icon: '🩺' },
        { value: 'hypertension', label: { tr: '❤️ Yüksek tansiyon', en: '❤️ High blood pressure' }, icon: '❤️' },
        { value: 'cholesterol', label: { tr: '🧪 Kolesterol', en: '🧪 High cholesterol' }, icon: '🧪' },
        { value: 'thyroid', label: { tr: '🦋 Tiroid', en: '🦋 Thyroid' }, icon: '🦋' }
      ]
    }
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isLastQuestion = currentStep === questions.length - 1;
  const isContactForm = currentStep === questions.length;

  // VALİDASYON FONKSİYONLARI
  const validateContactInfo = () => {
    const errors = {};

    // İsim kontrolü
    const name = userInfo.name.trim();
    if (!name || name.length < 2) {
      errors.name = isEnglish ? 'Valid name required' : 'Geçerli isim gerekli';
    } else if (!/^[a-zA-ZığüşöçİĞÜŞÖÇ\s]+$/.test(name)) {
      errors.name = isEnglish ? 'Name can only contain letters' : 'İsim sadece harf içerebilir';
    } else if (name.split(' ').length < 2) {
      errors.name = isEnglish ? 'Enter first and last name' : 'Ad ve soyadınızı girin';
    }

    // Email kontrolü
    const email = userInfo.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = isEnglish ? 'Valid email required' : 'Geçerli email gerekli';
    } else if (email.includes('test') || email.includes('fake') || email.includes('asdf')) {
      errors.email = isEnglish ? 'Please enter a real email' : 'Gerçek email girin';
    }

    // Telefon kontrolü
    const phone = userInfo.phone.trim();
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!phone || !phoneRegex.test(phone.replace(/\s/g, ''))) {
      errors.phone = isEnglish ? 'Valid phone required' : 'Geçerli telefon gerekli';
    } else if (phone.includes('123') || phone.includes('000') || phone.includes('111')) {
      errors.phone = isEnglish ? 'Please enter a real phone' : 'Gerçek telefon girin';
    }

    return errors;
  };

  const validateHealthyWeight = (targetWeight, height) => {
    if (!height || !targetWeight) return true;
    
    const heightInM = height / 100;
    const minHealthy = 18.5 * heightInM * heightInM;
    const maxHealthy = 25 * heightInM * heightInM;
    
    return targetWeight >= minHealthy && targetWeight <= maxHealthy;
  };

  // Motivasyon mesajı gösterme
  useEffect(() => {
    if (currentMotivation) {
      setShowMotivation(true);
      const timer = setTimeout(() => {
        setShowMotivation(false);
        setCurrentMotivation('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentMotivation]);

  const handleAnswer = (questionId, value, fieldId = null) => {
    const key = fieldId ? `${questionId}.${fieldId}` : questionId;
    
    if (currentQuestion.type === 'multiple') {
      const currentAnswers = answers[key] || [];
      if (value === 'healthy') {
        setAnswers({ ...answers, [key]: ['healthy'] });
      } else {
        const newAnswers = currentAnswers.includes(value)
          ? currentAnswers.filter(a => a !== value)
          : [...currentAnswers.filter(a => a !== 'healthy'), value];
        setAnswers({ ...answers, [key]: newAnswers });
      }
    } else {
      setAnswers({ ...answers, [key]: value });
    }

    // Motivasyon mesajı
    const motKey = fieldId ? `${questionId}.${fieldId}` : questionId;
    if (motivationMessages[motKey] && motivationMessages[motKey][value]) {
      const message = motivationMessages[motKey][value];
      setCurrentMotivation(message[isEnglish ? 'en' : 'tr']);
    }
  };

  const handleNext = () => {
    // Hedef kilo validasyonu
    if (currentQuestion.id === 'body_metrics') {
      const height = parseFloat(answers['body_metrics.height']);
      const targetWeight = parseFloat(answers['body_metrics.target_weight']);
      
      if (!validateHealthyWeight(targetWeight, height)) {
        const heightInM = height / 100;
        const minHealthy = Math.ceil(18.5 * heightInM * heightInM);
        const maxHealthy = Math.floor(25 * heightInM * heightInM);
        
        alert(isEnglish 
          ? `Please enter a healthy target weight (${minHealthy}-${maxHealthy} kg for your height)`
          : `Lütfen sağlıklı bir hedef kilo girin (Boyunuz için: ${minHealthy}-${maxHealthy} kg)`
        );
        return;
      }
    }

    if (isLastQuestion) {
      setCurrentStep(questions.length);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setValidationErrors({});
    }
  };

  const handleSubmit = async () => {
    const contactErrors = validateContactInfo();
    if (Object.keys(contactErrors).length > 0) {
      setValidationErrors(contactErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const testData = {
        answers,
        user_name: userInfo.name,
        user_email: userInfo.email,
        user_phone: userInfo.phone,
        completed_at: new Date().toISOString(),
        bmi: calculateBMI(),
        risk_level: calculateRiskLevel(),
        urgency_level: calculateUrgencyLevel(),
        recommended_calories: calculateRecommendedCalories()
      };
      
      // Submit test data to backend
      const { error } = await apiClient.request('/api/contact', {
        method: 'POST',
        body: {
          firstName: userInfo.name.split(' ')[0] || userInfo.name,
          lastName: userInfo.name.split(' ').slice(1).join(' ') || 'Test',
          email: userInfo.email,
          phone: userInfo.phone,
          subject: isEnglish ? 'Nutrition Test Completed' : 'Beslenme Testi Tamamlandı',
          message: `Test Results:\n${JSON.stringify(testData, null, 2)}`,
          category: 'nutrition',
          language: isEnglish ? 'en' : 'tr'
        }
      });

      if (error) {
        throw new Error(error);
      }

      setTestCompleted(true);
    } catch (error) {
      console.error('Error:', error);
      alert(isEnglish ? 'Error occurred. Try again.' : 'Hata oluştu. Tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setUserInfo({ name: '', email: '', phone: '' });
    setTestCompleted(false);
    setShowMotivation(false);
    setCurrentMotivation('');
    setValidationErrors({});
  };

  // HESAPLAMA FONKSİYONLARI - Aciliyet hesaplama eklendi
  const calculateBMI = () => {
    const height = parseFloat(answers['body_metrics.height']);
    const weight = parseFloat(answers['body_metrics.weight']);
    
    if (!height || !weight || height < 100 || height > 210 || weight < 30 || weight > 200) {
      return null;
    }
    
    const bmi = weight / ((height / 100) ** 2);
    return bmi.toFixed(1);
  };

  const calculateRiskLevel = () => {
    const healthIssues = answers['health_status'] || [];
    const bmi = parseFloat(calculateBMI());
    const age = parseInt(answers['basic_info.age']);
    
    // Yüksek risk faktörleri
    if (healthIssues.includes('diabetes') || healthIssues.includes('hypertension')) return 'high';
    if (bmi && (bmi < 18.5 || bmi > 30)) return 'high';
    if (age && (age < 18 || age > 70)) return 'high';
    
    // Orta risk faktörleri
    if (healthIssues.includes('cholesterol') || healthIssues.includes('thyroid')) return 'medium';
    if (bmi && (bmi < 20 || bmi > 25)) return 'medium';
    if (age && (age < 20 || age > 60)) return 'medium';
    
    return 'low';
  };

  const calculateUrgencyLevel = () => {
    const bmi = parseFloat(calculateBMI());
    const healthIssues = answers['health_status'] || [];
    const age = parseInt(answers['basic_info.age']);
    const goal = answers['welcome'];
    
    // Yüksek aciliyet
    if (bmi && (bmi < 16 || bmi > 35)) return 'high';
    if (healthIssues.includes('diabetes') || healthIssues.includes('hypertension')) return 'high';
    if (age && (age < 18 || age > 75)) return 'high';
    
    // Orta aciliyet
    if (bmi && (bmi < 18.5 || bmi > 30)) return 'medium';
    if (healthIssues.length > 1 && !healthIssues.includes('healthy')) return 'medium';
    if (goal === 'medical_diet') return 'medium';
    
    return 'low';
  };

  const calculateRecommendedCalories = () => {
    const weight = parseFloat(answers['body_metrics.weight']);
    const height = parseFloat(answers['body_metrics.height']);
    const age = parseInt(answers['basic_info.age']);
    const gender = answers['basic_info.gender'];
    const activity = answers['activity_level'];
    
    if (!weight || !height || !age || !gender || !activity) return null;
    if (weight < 30 || weight > 200 || height < 100 || height > 210 || age < 16 || age > 80) return null;
    
    // BMR hesaplama (Mifflin-St Jeor)
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else if (gender === 'female') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    } else {
      return null;
    }
    
    // Aktivite faktörü
    const activityFactors = {
      'none': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'intense': 1.725
    };
    
    const factor = activityFactors[activity];
    if (!factor) return null;
    
    const tdee = bmr * factor;
    
    if (tdee < 1200 || tdee > 4000) return null;
    
    return Math.round(tdee);
  };

  const canProceed = () => {
    if (isContactForm) {
      const contactErrors = validateContactInfo();
      return Object.keys(contactErrors).length === 0;
    }
    
    if (currentQuestion.type === 'combined') {
      return currentQuestion.fields.every(field => {
        const key = `${currentQuestion.id}.${field.id}`;
        const answer = answers[key];
        
        if (!answer) return false;
        
        // Sayı alanları için min/max kontrolü
        if (field.type === 'number') {
          const num = parseFloat(answer);
          if (num < field.min || num > field.max) return false;
        }
        
        return true;
      });
    }
    
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'multiple') {
      return answer && answer.length > 0;
    }
    return !!answer;
  };

  const renderField = (field, questionId) => {
    const key = `${questionId}.${field.id}`;
    const answer = answers[key];
    const hasError = validationErrors[key];

    if (field.type === 'choice') {
      return (
        <div className="row g-2">
          {field.options.map((option, index) => (
            <div key={index} className="col-6">
              <div
                className={`card h-100 border-2 cursor-pointer position-relative ${
                  answer === option.value ? 'border-success bg-success bg-opacity-10' : 'border-light'
                } hover-lift`}
                style={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.2s ease',
                  transform: answer === option.value ? 'translateY(-2px)' : 'none'
                }}
                onClick={() => handleAnswer(questionId, option.value, field.id)}
              >
                {option.popular && (
                  <div className="position-absolute top-0 end-0">
                    <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>
                      {isEnglish ? 'Popular' : 'Popüler'}
                    </span>
                  </div>
                )}
                <div className="card-body text-center p-2">
                  <div style={{ fontSize: '1.5rem' }}>{option.icon}</div>
                  <small className="fw-medium">
                    {typeof option.label === 'object' 
                      ? option.label[isEnglish ? 'en' : 'tr']
                      : option.label
                    }
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (field.type === 'number') {
      // Hedef kilo için sağlıklı aralık hesaplama
      let healthyRange = '';
      if (field.id === 'target_weight' && answers['body_metrics.height']) {
        const height = parseFloat(answers['body_metrics.height']);
        if (height >= 100 && height <= 210) {
          const heightInM = height / 100;
          const minHealthy = Math.ceil(18.5 * heightInM * heightInM);
          const maxHealthy = Math.floor(25 * heightInM * heightInM);
          healthyRange = `${minHealthy}-${maxHealthy} kg`;
        }
      }

      return (
        <div className="position-relative">
          <input
            type="number"
            className={`form-control form-control-lg text-center border-2 ${
              hasError ? 'border-danger' : (answer ? 'border-success' : 'border-light')
            }`}
            placeholder={field.placeholder[isEnglish ? 'en' : 'tr']}
            value={answer || ''}
            onChange={(e) => handleAnswer(questionId, e.target.value, field.id)}
            min={field.min}
            max={field.max}
            style={{ 
              borderColor: hasError ? '#dc3545' : (answer ? '#28a745' : '#dee2e6'),
              backgroundColor: hasError ? '#f8d7da' : (answer ? '#f8fff9' : 'white')
            }}
          />
          
          {answer && !hasError && (
            <div className="position-absolute top-50 end-0 translate-middle-y me-3">
              <i className="bi bi-check-circle-fill text-success"></i>
            </div>
          )}
          
          {hasError && (
            <div className="position-absolute top-50 end-0 translate-middle-y me-3">
              <i className="bi bi-x-circle-fill text-danger"></i>
            </div>
          )}
          
          {healthyRange && (
            <small className="text-muted d-block mt-1">
              {isEnglish ? `Healthy range: ${healthyRange}` : `Sağlıklı aralık: ${healthyRange}`}
            </small>
          )}
          
          {hasError && (
            <small className="text-danger d-block mt-1">{hasError}</small>
          )}
        </div>
      );
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden' }}>
          
          {/* Header */}
          <div className="modal-header text-white position-relative" style={{ 
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            borderBottom: 'none'
          }}>
            <h5 className="modal-title d-flex align-items-center">
              <i className="bi bi-heart-pulse me-2"></i>
              {isEnglish ? 'Free Nutrition Analysis' : 'Ücretsiz Beslenme Analizi'}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onHide}
            ></button>
          </div>
          
          {/* Body */}
          <div className="modal-body p-4 position-relative" style={{ minHeight: '400px' }}>
            
            {/* Sosyal Kanıt */}
            {!isContactForm && !testCompleted && currentStep > 0 && currentStep % 2 === 0 && (
              <div className="alert border-0 mb-4 d-flex align-items-center" style={{ 
                backgroundColor: '#e8f5e9',
                borderLeft: '4px solid #28a745'
              }}>
                <i className="bi bi-shield-check text-success me-2"></i>
                <small className="text-success fw-medium">
                  {socialProof[currentStep % socialProof.length][isEnglish ? 'en' : 'tr']}
                </small>
              </div>
            )}

            {/* Motivasyon Mesajı */}
            {showMotivation && (
              <div className="alert alert-info border-0 mb-4">
                <div className="d-flex align-items-center">
                  <i className="bi bi-stars text-warning me-2"></i>
                  <small className="fw-medium">{currentMotivation}</small>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {!isContactForm && !testCompleted && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">
                    {isEnglish ? 'Progress' : 'İlerleme'}: {currentStep + 1}/{questions.length}
                  </small>
                  <small className="text-success fw-bold">{Math.round(progress)}%</small>
                </div>
                <div className="progress" style={{ height: '10px', borderRadius: '10px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ 
                      width: `${progress}%`, 
                      transition: 'width 0.6s ease',
                      borderRadius: '10px'
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Test Tamamlandı */}
            {testCompleted ? (
              <div className="text-center py-5">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                     style={{ width: '100px', height: '100px' }}>
                  <i className="bi bi-trophy-fill text-warning" style={{ fontSize: '3rem' }}></i>
                </div>
                
                <h2 className="fw-bold text-success mb-3">
                  {isEnglish ? 'Analysis Complete!' : 'Analiz Tamamlandı!'}
                </h2>
                
                <div className="row g-3 mb-4">
                  <div className="col-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body text-center p-3">
                        <i className="bi bi-speedometer2 text-info mb-2" style={{ fontSize: '1.5rem' }}></i>
                        <div className="fw-bold">{calculateBMI() || 'N/A'}</div>
                        <small className="text-muted">BMI</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body text-center p-3">
                        <i className="bi bi-fire text-danger mb-2" style={{ fontSize: '1.5rem' }}></i>
                        <div className="fw-bold">{calculateRecommendedCalories() || 'N/A'}</div>
                        <small className="text-muted">{isEnglish ? 'Calories' : 'Kalori'}</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body text-center p-3">
                        <i className="bi bi-heart-pulse text-success mb-2" style={{ fontSize: '1.5rem' }}></i>
                        <div className="fw-bold text-capitalize">{calculateRiskLevel() || 'N/A'}</div>
                        <small className="text-muted">{isEnglish ? 'Risk' : 'Risk'}</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-success border-0 mb-4">
                  <div className="fw-medium mb-1">
                    {isEnglish ? 'Your Analysis is Ready!' : 'Analiziniz Hazır!'}
                  </div>
                  <small>
                    {isEnglish
                      ? 'Our expert will contact you within 2-4 hours.'
                      : 'Uzmanımız 2-4 saat içinde sizinle iletişime geçecek.'}
                  </small>
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <button className="btn btn-outline-success px-4" onClick={handleRestart}>
                    <i className="bi bi-arrow-repeat me-2"></i>
                    {isEnglish ? 'New Test' : 'Yeni Test'}
                  </button>
                  <button className="btn btn-success px-4" onClick={onHide}>
                    <i className="bi bi-check-lg me-2"></i>
                    {isEnglish ? 'Done' : 'Tamam'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Sorular */}
                {!isContactForm ? (
                  <div className="text-center">
                    <div className="mb-4">
                      <h4 className="text-dark mb-2" style={{ fontSize: '1.4rem', fontWeight: '600' }}>
                        {currentQuestion.question[isEnglish ? 'en' : 'tr']}
                      </h4>
                      {currentQuestion.subtitle && (
                        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                          {currentQuestion.subtitle[isEnglish ? 'en' : 'tr']}
                        </p>
                      )}
                    </div>
                    
                    {currentQuestion.type === 'combined' ? (
                      <div className="row g-4">
                        {currentQuestion.fields.map((field, index) => (
                          <div key={index} className="col-12">
                            <label className="form-label fw-semibold mb-3 text-start d-block">
                              {field.label[isEnglish ? 'en' : 'tr']}
                            </label>
                            {renderField(field, currentQuestion.id)}
                          </div>
                        ))}
                      </div>
                    ) : currentQuestion.type === 'multiple' ? (
                      <div className="row g-3">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="col-md-6">
                            <div
                              className={`card h-100 border-2 cursor-pointer position-relative ${
                                (answers[currentQuestion.id] && answers[currentQuestion.id].includes(option.value))
                                  ? 'border-success bg-success bg-opacity-10 shadow-sm'
                                  : 'border-light'
                              } hover-lift`}
                              style={{ 
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transform: (answers[currentQuestion.id] && answers[currentQuestion.id].includes(option.value)) ? 'translateY(-3px)' : 'none'
                              }}
                              onClick={() => handleAnswer(currentQuestion.id, option.value)}
                            >
                              {option.popular && (
                                <div className="position-absolute top-0 end-0 me-2 mt-2">
                                  <span className="badge bg-warning text-dark" style={{ fontSize: '0.7rem' }}>
                                    {isEnglish ? 'Popular' : 'Popüler'}
                                  </span>
                                </div>
                              )}
                              <div className="card-body text-center p-3">
                                <div style={{ fontSize: '2.2rem' }} className="mb-2">
                                  {option.icon}
                                </div>
                                <p className="card-text mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>
                                  {typeof option.label === 'object' 
                                    ? option.label[isEnglish ? 'en' : 'tr']
                                    : option.label
                                  }
                                </p>
                              </div>
                              {(answers[currentQuestion.id] && answers[currentQuestion.id].includes(option.value)) && (
                                <div className="position-absolute top-0 start-0 m-2">
                                  <i className="bi bi-check-circle-fill text-success"></i>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="row g-3">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="col-md-6">
                            <div
                              className={`card h-100 border-2 cursor-pointer position-relative ${
                                answers[currentQuestion.id] === option.value
                                  ? 'border-success bg-success bg-opacity-10 shadow-sm'
                                  : 'border-light'
                              } hover-lift`}
                              style={{ 
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transform: answers[currentQuestion.id] === option.value ? 'translateY(-3px)' : 'none'
                              }}
                              onClick={() => handleAnswer(currentQuestion.id, option.value)}
                            >
                              {option.popular && (
                                <div className="position-absolute top-0 end-0 me-2 mt-2">
                                  <span className="badge bg-warning text-dark" style={{ fontSize: '0.7rem' }}>
                                    {isEnglish ? 'Popular' : 'Popüler'}
                                  </span>
                                </div>
                              )}
                              <div className="card-body text-center p-3">
                                <div style={{ fontSize: '2.2rem' }} className="mb-2">
                                  {option.icon}
                                </div>
                                <p className="card-text mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>
                                  {typeof option.label === 'object' 
                                    ? option.label[isEnglish ? 'en' : 'tr']
                                    : option.label
                                  }
                                </p>
                              </div>
                              {answers[currentQuestion.id] === option.value && (
                                <div className="position-absolute top-0 start-0 m-2">
                                  <i className="bi bi-check-circle-fill text-success"></i>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* İletişim Formu */
                  <div>
                    <div className="text-center mb-4">
                      <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{ width: '90px', height: '90px' }}>
                        <i className="bi bi-rocket-takeoff text-success" style={{ fontSize: '2.5rem' }}></i>
                      </div>
                      <h3 className="fw-bold text-success mb-2">
                        {isEnglish ? 'Almost There!' : 'Neredeyse Bitti!'}
                      </h3>
                      <p className="text-muted mb-3">
                        {isEnglish 
                          ? 'Get your personalized nutrition plan within 2-4 hours!'
                          : '2-4 saat içinde kişiselleştirilmiş beslenme planınızı alın!'}
                      </p>
                      
                      <div className="alert alert-warning border-0 mb-4">
                        <small className="fw-medium">
                          ⏰ {isEnglish 
                            ? 'Only 12 personalized plans left today!'
                            : 'Bugün sadece 12 kişiselleştirilmiş plan kaldı!'}
                        </small>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-medium">
                          {isEnglish ? 'Full Name' : 'Ad Soyad'} <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-lg border-2 ${
                            validationErrors.name ? 'border-danger' : (userInfo.name ? 'border-success' : 'border-light')
                          }`}
                          value={userInfo.name}
                          onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                          placeholder={isEnglish ? 'Enter your full name' : 'Ad soyadınızı girin'}
                          style={{ 
                            backgroundColor: validationErrors.name ? '#f8d7da' : (userInfo.name ? '#f8fff9' : 'white')
                          }}
                        />
                        {validationErrors.name && (
                          <small className="text-danger">{validationErrors.name}</small>
                        )}
                      </div>
                      
                      <div className="col-12">
                        <label className="form-label fw-medium">
                          {isEnglish ? 'Email Address' : 'E-posta Adresi'} <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className={`form-control form-control-lg border-2 ${
                            validationErrors.email ? 'border-danger' : (userInfo.email ? 'border-success' : 'border-light')
                          }`}
                          value={userInfo.email}
                          onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                          placeholder={isEnglish ? 'Enter your email' : 'E-posta adresinizi girin'}
                          style={{ 
                            backgroundColor: validationErrors.email ? '#f8d7da' : (userInfo.email ? '#f8fff9' : 'white')
                          }}
                        />
                        {validationErrors.email && (
                          <small className="text-danger">{validationErrors.email}</small>
                        )}
                      </div>
                      
                      <div className="col-12">
                        <label className="form-label fw-medium">
                          {isEnglish ? 'Phone Number' : 'Telefon Numarası'} <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className={`form-control form-control-lg border-2 ${
                            validationErrors.phone ? 'border-danger' : (userInfo.phone ? 'border-success' : 'border-light')
                          }`}
                          value={userInfo.phone}
                          onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                          placeholder={isEnglish ? 'Enter your phone number' : 'Telefon numaranızı girin'}
                          style={{ 
                            backgroundColor: validationErrors.phone ? '#f8d7da' : (userInfo.phone ? '#f8fff9' : 'white')
                          }}
                        />
                        {validationErrors.phone && (
                          <small className="text-danger">{validationErrors.phone}</small>
                        )}
                      </div>
                      
                      <div className="col-12">
                        <div className="alert alert-light border-0 d-flex align-items-start">
                          <i className="bi bi-shield-check text-success me-2 mt-1"></i>
                          <small className="text-muted">
                            {isEnglish
                              ? 'Your information is secure and will only be used for your nutrition plan.'
                              : 'Bilgileriniz güvende ve sadece beslenme planınız için kullanılacak.'}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!testCompleted && (
            <div className="modal-footer bg-light border-0">
              <div className="d-flex justify-content-between w-100">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  style={{ borderRadius: '25px' }}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  {isEnglish ? 'Back' : 'Geri'}
                </button>
                
                <button
                  type="button"
                  className="btn btn-success px-4"
                  onClick={isContactForm ? handleSubmit : handleNext}
                  disabled={!canProceed() || isSubmitting}
                  style={{ 
                    borderRadius: '25px',
                    minWidth: '120px'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {isEnglish ? 'Processing...' : 'İşleniyor...'}
                    </>
                  ) : isContactForm ? (
                    <>
                      <i className="bi bi-rocket-takeoff me-2"></i>
                      {isEnglish ? 'Get My Plan' : 'Planımı Al'}
                    </>
                  ) : (
                    <>
                      {isEnglish ? 'Next' : 'İleri'}
                      <i className="bi bi-arrow-right ms-2"></i>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionTestModal;