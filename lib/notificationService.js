import { sendEmail, sendOrderConfirmation, sendAppointmentConfirmation, sendCouponEmail } from './emailService';
import { sendSMS, sendOrderConfirmationSMS, sendAppointmentConfirmationSMS, sendPaymentSuccessSMS, sendCouponCodeSMS } from './smsService';
import { supabase } from './supabaseClient';

// Bildirim türleri
export const NOTIFICATION_TYPES = {
  ORDER_CONFIRMATION: 'order_confirmation',
  APPOINTMENT_CONFIRMATION: 'appointment_confirmation',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  COUPON_SENT: 'coupon_sent',
  NEWSLETTER_WELCOME: 'newsletter_welcome',
  PASSWORD_RESET: 'password_reset',
  WELCOME_MESSAGE: 'welcome_message'
};

// Bildirim kanalları
export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  BOTH: 'both'
};

// Ana bildirim gönderme fonksiyonu
export const sendNotification = async (type, data, channels = NOTIFICATION_CHANNELS.BOTH, isEnglish = false) => {
  const results = {
    email: null,
    sms: null,
    success: false
  };

  try {
    // Email gönderimi
    if (channels === NOTIFICATION_CHANNELS.EMAIL || channels === NOTIFICATION_CHANNELS.BOTH) {
      results.email = await sendEmailNotification(type, data, isEnglish);
    }

    // SMS gönderimi
    if (channels === NOTIFICATION_CHANNELS.SMS || channels === NOTIFICATION_CHANNELS.BOTH) {
      results.sms = await sendSMSNotification(type, data, isEnglish);
    }

    // En az bir kanal başarılı ise genel başarı true
    results.success = (results.email?.success || results.sms?.success) || false;

    // Bildirim logunu kaydet
    await logNotification({
      type: type,
      recipient_email: data.email || data.customer_email || data.client_email,
      recipient_phone: data.phone || data.customer_phone || data.client_phone,
      channels: channels,
      email_result: results.email,
      sms_result: results.sms,
      success: results.success,
      data: data
    });

    return results;

  } catch (error) {
    console.error('Notification sending failed:', error);
    return {
      email: null,
      sms: null,
      success: false,
      error: error.message
    };
  }
};

// Email bildirim gönderimi
const sendEmailNotification = async (type, data, isEnglish) => {
  try {
    switch (type) {
      case NOTIFICATION_TYPES.ORDER_CONFIRMATION:
        return await sendOrderConfirmation(data, isEnglish);
      
      case NOTIFICATION_TYPES.APPOINTMENT_CONFIRMATION:
        return await sendAppointmentConfirmation(data, isEnglish);
      
      case NOTIFICATION_TYPES.COUPON_SENT:
        return await sendCouponEmail(data.email || data.customer_email, data.coupon, isEnglish);
      
      case NOTIFICATION_TYPES.NEWSLETTER_WELCOME:
        return await sendEmail(
          data.email,
          'newsletterWelcome',
          { websiteUrl: isEnglish ? `${window.location.origin}/en` : window.location.origin },
          isEnglish
        );
      
      case NOTIFICATION_TYPES.PASSWORD_RESET:
        return await sendEmail(
          data.email,
          'passwordReset',
          { resetLink: data.resetLink, resetCode: data.resetCode },
          isEnglish
        );
      
      case NOTIFICATION_TYPES.WELCOME_MESSAGE:
        return await sendEmail(
          data.email,
          'welcomeMessage',
          { firstName: data.firstName, websiteUrl: window.location.origin },
          isEnglish
        );
      
      default:
        throw new Error(`Unsupported email notification type: ${type}`);
    }
  } catch (error) {
    console.error('Email notification failed:', error);
    return { success: false, error: error.message };
  }
};

// SMS bildirim gönderimi
const sendSMSNotification = async (type, data, isEnglish) => {
  try {
    switch (type) {
      case NOTIFICATION_TYPES.ORDER_CONFIRMATION:
        return await sendOrderConfirmationSMS(data, isEnglish);
      
      case NOTIFICATION_TYPES.APPOINTMENT_CONFIRMATION:
        return await sendAppointmentConfirmationSMS(data, isEnglish);
      
      case NOTIFICATION_TYPES.PAYMENT_SUCCESS:
        return await sendPaymentSuccessSMS(data, isEnglish);
      
      case NOTIFICATION_TYPES.COUPON_SENT:
        return await sendCouponCodeSMS(data.phone || data.customer_phone, data.coupon, isEnglish);
      
      case NOTIFICATION_TYPES.APPOINTMENT_REMINDER:
        return await sendSMS(
          data.phone || data.client_phone,
          'appointmentReminder',
          data,
          isEnglish
        );
      
      case NOTIFICATION_TYPES.PASSWORD_RESET:
        return await sendSMS(
          data.phone,
          'passwordReset',
          { resetCode: data.resetCode },
          isEnglish
        );
      
      case NOTIFICATION_TYPES.WELCOME_MESSAGE:
        return await sendSMS(
          data.phone,
          'welcomeMessage',
          { firstName: data.firstName },
          isEnglish
        );
      
      default:
        throw new Error(`Unsupported SMS notification type: ${type}`);
    }
  } catch (error) {
    console.error('SMS notification failed:', error);
    return { success: false, error: error.message };
  }
};

// Sipariş onay bildirimi
export const sendOrderNotification = async (orderData, isEnglish = false) => {
  return await sendNotification(
    NOTIFICATION_TYPES.ORDER_CONFIRMATION,
    orderData,
    NOTIFICATION_CHANNELS.BOTH,
    isEnglish
  );
};

// Randevu onay bildirimi
export const sendAppointmentNotification = async (appointmentData, isEnglish = false) => {
  return await sendNotification(
    NOTIFICATION_TYPES.APPOINTMENT_CONFIRMATION,
    appointmentData,
    NOTIFICATION_CHANNELS.BOTH,
    isEnglish
  );
};

// Randevu hatırlatma bildirimi
export const sendAppointmentReminder = async (appointmentData, meetingLink, isEnglish = false) => {
  const reminderData = {
    ...appointmentData,
    meetingLink: meetingLink
  };

  return await sendNotification(
    NOTIFICATION_TYPES.APPOINTMENT_REMINDER,
    reminderData,
    NOTIFICATION_CHANNELS.BOTH,
    isEnglish
  );
};

// Ödeme başarılı bildirimi
export const sendPaymentSuccessNotification = async (orderData, isEnglish = false) => {
  return await sendNotification(
    NOTIFICATION_TYPES.PAYMENT_SUCCESS,
    orderData,
    NOTIFICATION_CHANNELS.SMS, // Sadece SMS
    isEnglish
  );
};

// Kupon gönderimi
export const sendCouponNotification = async (userData, couponData, isEnglish = false) => {
  const notificationData = {
    email: userData.email,
    phone: userData.phone,
    coupon: couponData
  };

  return await sendNotification(
    NOTIFICATION_TYPES.COUPON_SENT,
    notificationData,
    NOTIFICATION_CHANNELS.BOTH,
    isEnglish
  );
};

// Hoş geldin bildirimi
export const sendWelcomeNotification = async (userData, isEnglish = false) => {
  return await sendNotification(
    NOTIFICATION_TYPES.WELCOME_MESSAGE,
    userData,
    NOTIFICATION_CHANNELS.EMAIL, // Sadece Email
    isEnglish
  );
};

// Şifre sıfırlama bildirimi
export const sendPasswordResetNotification = async (userData, resetData, isEnglish = false) => {
  const notificationData = {
    email: userData.email,
    phone: userData.phone,
    resetLink: resetData.resetLink,
    resetCode: resetData.resetCode
  };

  return await sendNotification(
    NOTIFICATION_TYPES.PASSWORD_RESET,
    notificationData,
    NOTIFICATION_CHANNELS.EMAIL, // Sadece Email
    isEnglish
  );
};

// Toplu bildirim gönderimi
export const sendBulkNotification = async (type, recipients, data, channels = NOTIFICATION_CHANNELS.BOTH, isEnglish = false) => {
  try {
    const promises = recipients.map(recipient => {
      const recipientData = {
        ...data,
        email: recipient.email,
        phone: recipient.phone,
        firstName: recipient.firstName || recipient.first_name
      };

      return sendNotification(type, recipientData, channels, isEnglish);
    });

    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Bulk notification failed:', error);
    throw error;
  }
};

// Zamanlanmış bildirim
export const scheduleNotification = async (type, data, scheduleTime, channels = NOTIFICATION_CHANNELS.BOTH, isEnglish = false) => {
  try {
    const { error } = await supabase
      .from('scheduled_notifications')
      .insert([
        {
          type: type,
          data: JSON.stringify(data),
          scheduled_time: scheduleTime,
          channels: channels,
          is_english: isEnglish,
          status: 'scheduled',
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      throw new Error('Scheduled notification save failed');
    }

    return {
      success: true,
      message: 'Notification scheduled successfully'
    };
  } catch (error) {
    console.error('Notification scheduling failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Bildirim logunu kaydet
const logNotification = async (notificationData) => {
  try {
    const { error } = await supabase
      .from('notification_logs')
      .insert([
        {
          type: notificationData.type,
          recipient_email: notificationData.recipient_email,
          recipient_phone: notificationData.recipient_phone,
          channels: notificationData.channels,
          email_success: notificationData.email_result?.success || false,
          sms_success: notificationData.sms_result?.success || false,
          success: notificationData.success,
          email_error: notificationData.email_result?.error,
          sms_error: notificationData.sms_result?.error,
          data: JSON.stringify(notificationData.data),
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Notification log error:', error);
    }
  } catch (error) {
    console.error('Notification logging failed:', error);
  }
};

// Bildirim tercihlerini al
export const getNotificationPreferences = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Varsayılan tercihler
    return data || {
      email_notifications: true,
      sms_notifications: true,
      marketing_emails: true,
      appointment_reminders: true,
      order_updates: true
    };
  } catch (error) {
    console.error('Get notification preferences failed:', error);
    return {
      email_notifications: true,
      sms_notifications: true,
      marketing_emails: true,
      appointment_reminders: true,
      order_updates: true
    };
  }
};

// Bildirim tercihlerini güncelle
export const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert([
        {
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        }
      ]);

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Update notification preferences failed:', error);
    return { success: false, error: error.message };
  }
};

// Bildirim istatistiklerini al
export const getNotificationStats = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('notification_logs')
      .select('type, channels, success, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      throw error;
    }

    // İstatistikleri hesapla
    const stats = {
      total: data.length,
      successful: data.filter(n => n.success).length,
      failed: data.filter(n => !n.success).length,
      byType: {},
      byChannel: {}
    };

    data.forEach(notification => {
      // Türe göre grupla
      if (!stats.byType[notification.type]) {
        stats.byType[notification.type] = { total: 0, successful: 0, failed: 0 };
      }
      stats.byType[notification.type].total++;
      if (notification.success) {
        stats.byType[notification.type].successful++;
      } else {
        stats.byType[notification.type].failed++;
      }

      // Kanala göre grupla
      if (!stats.byChannel[notification.channels]) {
        stats.byChannel[notification.channels] = { total: 0, successful: 0, failed: 0 };
      }
      stats.byChannel[notification.channels].total++;
      if (notification.success) {
        stats.byChannel[notification.channels].successful++;
      } else {
        stats.byChannel[notification.channels].failed++;
      }
    });

    return { success: true, stats };
  } catch (error) {
    console.error('Get notification stats failed:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendNotification,
  sendOrderNotification,
  sendAppointmentNotification,
  sendAppointmentReminder,
  sendPaymentSuccessNotification,
  sendCouponNotification,
  sendWelcomeNotification,
  sendPasswordResetNotification,
  sendBulkNotification,
  scheduleNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationStats,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS
};
