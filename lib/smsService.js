import axios from 'axios';
import { supabase } from './supabaseClient';

// SMS sağlayıcısı konfigürasyonu (Netgsm, İletimerkezi, vs.)
const SMS_API_KEY = import.meta.env.VITE_SMS_API_KEY;
const SMS_API_SECRET = import.meta.env.VITE_SMS_API_SECRET;
const SMS_API_URL = import.meta.env.VITE_SMS_API_URL;
const SMS_SENDER_NAME = import.meta.env.VITE_SMS_SENDER_NAME || 'OGUZ';

// SMS template'leri
const smsTemplates = {
  orderConfirmation: {
    tr: (data) => `Merhaba ${data.customerName}, siparişiniz (${data.orderNumber}) onaylandı. Toplam: ${data.total}TL. Takip: ${data.trackingUrl}`,
    en: (data) => `Hello ${data.customerName}, your order (${data.orderNumber}) is confirmed. Total: ${data.total}TL. Track: ${data.trackingUrl}`
  },
  
  appointmentConfirmation: {
    tr: (data) => `Merhaba ${data.clientName}, randevunuz onaylandı. Tarih: ${data.date} ${data.time}. Zoom linki 30 dk önce gönderilecek.`,
    en: (data) => `Hello ${data.clientName}, your appointment is confirmed. Date: ${data.date} ${data.time}. Zoom link will be sent 30 min before.`
  },
  
  appointmentReminder: {
    tr: (data) => `Merhaba ${data.clientName}, randevunuz 30 dk sonra başlayacak. Zoom linki: ${data.meetingLink}`,
    en: (data) => `Hello ${data.clientName}, your appointment starts in 30 min. Zoom link: ${data.meetingLink}`
  },
  
  paymentSuccess: {
    tr: (data) => `Ödemeniz başarıyla alındı. Sipariş: ${data.orderNumber}. Toplam: ${data.total}TL. Teşekkür ederiz!`,
    en: (data) => `Payment received successfully. Order: ${data.orderNumber}. Total: ${data.total}TL. Thank you!`
  },
  
  paymentFailed: {
    tr: (data) => `Ödeme başarısız. Sipariş: ${data.orderNumber}. Lütfen tekrar deneyin veya bizimle iletişime geçin.`,
    en: (data) => `Payment failed. Order: ${data.orderNumber}. Please try again or contact us.`
  },
  
  couponCode: {
    tr: (data) => `Özel indirim kodunuz: ${data.couponCode}. %${data.discount} indirim! Son kullanma: ${data.expiryDate}`,
    en: (data) => `Your special discount code: ${data.couponCode}. ${data.discount}% off! Valid until: ${data.expiryDate}`
  },
  
  passwordReset: {
    tr: (data) => `Şifre sıfırlama kodunuz: ${data.resetCode}. Bu kod 10 dakika geçerlidir.`,
    en: (data) => `Your password reset code: ${data.resetCode}. This code is valid for 10 minutes.`
  },
  
  welcomeMessage: {
    tr: (data) => `Hoş geldiniz ${data.firstName}! Oğuz Yolyapan ailesine katıldığınız için teşekkür ederiz. Sağlıklı günler!`,
    en: (data) => `Welcome ${data.firstName}! Thank you for joining the Oğuz Yolyapan family. Stay healthy!`
  }
};

// Ana SMS gönderme fonksiyonu
export const sendSMS = async (phone, templateType, data, isEnglish = false) => {
  try {
    if (!SMS_API_KEY || !SMS_API_SECRET) {
      throw new Error('SMS API configuration is missing');
    }

    // Telefon numarasını temizle ve formatla
    const cleanPhone = formatPhoneNumber(phone);
    
    // Template'i al ve data ile doldur
    const template = smsTemplates[templateType];
    if (!template) {
      throw new Error(`SMS template '${templateType}' not found`);
    }

    const lang = isEnglish ? 'en' : 'tr';
    const message = template[lang](data);

    // SMS API'ye gönder (NetGSM örneği)
    const smsData = {
      usercode: SMS_API_KEY,
      password: SMS_API_SECRET,
      gsmno: cleanPhone,
      message: message,
      msgheader: SMS_SENDER_NAME,
      filter: 0,
      startdate: '',
      stopdate: ''
    };

    const response = await axios.post(SMS_API_URL, smsData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Sonucu kontrol et
    if (response.data.includes('00')) {
      console.log('SMS sent successfully');
      
      // SMS logunu kaydet
      await logSMSActivity({
        phone: cleanPhone,
        message: message,
        templateType: templateType,
        status: 'sent',
        provider_response: response.data
      });

      return {
        success: true,
        messageId: response.data,
        phone: cleanPhone
      };
    } else {
      throw new Error(`SMS API Error: ${response.data}`);
    }

  } catch (error) {
    console.error('SMS sending failed:', error);
    
    // Hata logunu kaydet
    await logSMSActivity({
      phone: phone,
      message: 'Failed to send',
      templateType: templateType,
      status: 'failed',
      error: error.message
    });

    return {
      success: false,
      error: error.message
    };
  }
};

// Telefon numarası formatlama
const formatPhoneNumber = (phone) => {
  // Türkiye formatında telefon numarası formatla
  let cleaned = phone.replace(/\D/g, '');
  
  // Başında 0 varsa kaldır
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Başında +90 varsa kaldır
  if (cleaned.startsWith('90')) {
    cleaned = cleaned.substring(2);
  }
  
  // Başına 90 ekle (Türkiye kodu)
  return '90' + cleaned;
};

// Toplu SMS gönderme
export const sendBulkSMS = async (phoneNumbers, templateType, data, isEnglish = false) => {
  try {
    const promises = phoneNumbers.map(phone => 
      sendSMS(phone, templateType, data, isEnglish)
    );
    
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Bulk SMS sending failed:', error);
    throw error;
  }
};

// Sipariş onay SMS'i
export const sendOrderConfirmationSMS = async (orderData, isEnglish = false) => {
  const smsData = {
    customerName: orderData.customer_name,
    orderNumber: orderData.order_number,
    total: orderData.total_amount,
    trackingUrl: isEnglish ? 
      `${window.location.origin}/en/order-tracking/${orderData.order_number}` :
      `${window.location.origin}/siparis-takip/${orderData.order_number}`
  };

  return await sendSMS(
    orderData.customer_phone,
    'orderConfirmation',
    smsData,
    isEnglish
  );
};

// Randevu onay SMS'i
export const sendAppointmentConfirmationSMS = async (appointmentData, isEnglish = false) => {
  const smsData = {
    clientName: appointmentData.client_name,
    date: new Date(appointmentData.appointment_date).toLocaleDateString(),
    time: appointmentData.appointment_time
  };

  return await sendSMS(
    appointmentData.client_phone,
    'appointmentConfirmation',
    smsData,
    isEnglish
  );
};

// Randevu hatırlatma SMS'i
export const sendAppointmentReminderSMS = async (appointmentData, meetingLink, isEnglish = false) => {
  const smsData = {
    clientName: appointmentData.client_name,
    date: new Date(appointmentData.appointment_date).toLocaleDateString(),
    time: appointmentData.appointment_time,
    meetingLink: meetingLink
  };

  return await sendSMS(
    appointmentData.client_phone,
    'appointmentReminder',
    smsData,
    isEnglish
  );
};

// Ödeme başarılı SMS'i
export const sendPaymentSuccessSMS = async (orderData, isEnglish = false) => {
  const smsData = {
    orderNumber: orderData.order_number,
    total: orderData.total_amount
  };

  return await sendSMS(
    orderData.customer_phone,
    'paymentSuccess',
    smsData,
    isEnglish
  );
};

// Ödeme başarısız SMS'i
export const sendPaymentFailedSMS = async (orderData, isEnglish = false) => {
  const smsData = {
    orderNumber: orderData.order_number
  };

  return await sendSMS(
    orderData.customer_phone,
    'paymentFailed',
    smsData,
    isEnglish
  );
};

// Kupon kodu SMS'i
export const sendCouponCodeSMS = async (phone, couponData, isEnglish = false) => {
  const smsData = {
    couponCode: couponData.code,
    discount: couponData.discount_value,
    expiryDate: new Date(couponData.valid_until).toLocaleDateString()
  };

  return await sendSMS(
    phone,
    'couponCode',
    smsData,
    isEnglish
  );
};

// Şifre sıfırlama SMS'i
export const sendPasswordResetSMS = async (phone, resetCode, isEnglish = false) => {
  const smsData = {
    resetCode: resetCode
  };

  return await sendSMS(
    phone,
    'passwordReset',
    smsData,
    isEnglish
  );
};

// Hoş geldin SMS'i
export const sendWelcomeSMS = async (userData, isEnglish = false) => {
  const smsData = {
    firstName: userData.first_name || userData.firstName
  };

  return await sendSMS(
    userData.phone,
    'welcomeMessage',
    smsData,
    isEnglish
  );
};

// SMS aktivite logunu kaydet
const logSMSActivity = async (smsData) => {
  try {
    const { error } = await supabase
      .from('sms_logs')
      .insert([
        {
          phone: smsData.phone,
          message: smsData.message,
          template_type: smsData.templateType,
          status: smsData.status,
          provider_response: smsData.provider_response,
          error_message: smsData.error,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('SMS log error:', error);
    }
  } catch (error) {
    console.error('SMS logging failed:', error);
  }
};

// SMS kredi bakiyesi sorgulama
export const checkSMSBalance = async () => {
  try {
    const response = await axios.post(SMS_API_URL + '/balance', {
      usercode: SMS_API_KEY,
      password: SMS_API_SECRET
    });

    return {
      success: true,
      balance: response.data
    };
  } catch (error) {
    console.error('SMS balance check failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Zamanlanmış SMS gönderme
export const scheduleSMS = async (phone, templateType, data, scheduleTime, isEnglish = false) => {
  try {
    // Zamanlanmış SMS'i veritabanına kaydet
    const { error } = await supabase
      .from('scheduled_sms')
      .insert([
        {
          phone: formatPhoneNumber(phone),
          template_type: templateType,
          data: JSON.stringify(data),
          scheduled_time: scheduleTime,
          is_english: isEnglish,
          status: 'scheduled',
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      throw new Error('Scheduled SMS save failed');
    }

    return {
      success: true,
      message: 'SMS scheduled successfully'
    };
  } catch (error) {
    console.error('SMS scheduling failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  sendSMS,
  sendBulkSMS,
  sendOrderConfirmationSMS,
  sendAppointmentConfirmationSMS,
  sendAppointmentReminderSMS,
  sendPaymentSuccessSMS,
  sendPaymentFailedSMS,
  sendCouponCodeSMS,
  sendPasswordResetSMS,
  sendWelcomeSMS,
  checkSMSBalance,
  scheduleSMS
};
