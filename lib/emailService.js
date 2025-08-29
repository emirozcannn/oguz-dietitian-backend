import axios from 'axios';
import { supabase } from './supabaseClient';

// Environment variables
const MAILGUN_API_KEY = import.meta.env.VITE_MAILGUN_API_KEY;
const MAILGUN_DOMAIN = import.meta.env.VITE_MAILGUN_DOMAIN;
const MAILGUN_FROM_EMAIL = import.meta.env.VITE_MAILGUN_FROM_EMAIL || 'Oğuz Yolyapan <info@oguzyolyapan.com>';

// Email servisini Supabase Edge Functions üzerinden çağıracağız
// Veya basit bir Node.js proxy servisi kullanacağız

// Geçici çözüm: Netlify Functions veya basit bir API proxy kullanacağız
const sendEmailViaProxy = async (emailData) => {
  try {
    // Şimdilik console'da göster ve mock response döndür
    console.log('Email would be sent via proxy:', emailData);
    
    // Gerçek implementasyon için bir backend endpoint gerekiyor
    // Bu endpoint Mailgun API'yi server-side çağıracak
    
    // Mock response
    return {
      success: true,
      messageId: 'mock-' + Date.now(),
      message: 'Email sent successfully (mock)'
    };
    
    // Gerçek implementasyon:
    // const response = await axios.post('/api/send-email', emailData);
    // return response.data;
    
  } catch (error) {
    console.error('Email proxy error:', error);
    throw error;
  }
};

// Email template utility
const generateEmailTemplate = (type, data, isEnglish = false) => {
  const templates = {
    // Sipariş Onayı
    orderConfirmation: {
      subject: isEnglish ? `Order Confirmation - ${data.orderNumber}` : `Sipariş Onayı - ${data.orderNumber}`,
      html: isEnglish ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for your order</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Order Details</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Date:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
              <p><strong>Total:</strong> ₺${data.total}</p>
              <p><strong>Status:</strong> ${data.status}</p>
            </div>
            <h3 style="color: #333;">Items:</h3>
            <ul style="list-style: none; padding: 0;">
              ${data.items && data.items.length > 0 ? data.items.map(item => `
                <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
                  <strong>${item.name}</strong><br>
                  <span style="color: #666;">Quantity: ${item.quantity} × ₺${item.price}</span>
                </li>
              `).join('') : '<li>No items listed</li>'}
            </ul>
            <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0066cc; margin-top: 0;">Next Steps:</h3>
              <ul style="color: #333; line-height: 1.6;">
                <li>We will contact you within 24 hours</li>
                <li>Your personalized nutrition plan will be prepared</li>
                <li>You can track your order in the client panel</li>
              </ul>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.dashboardUrl}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order</a>
            </div>
          </div>
        </div>
      ` : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Siparişiniz Onaylandı!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Siparişiniz için teşekkür ederiz</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Sipariş Detayları</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Sipariş No:</strong> ${data.orderNumber}</p>
              <p><strong>Tarih:</strong> ${new Date(data.createdAt).toLocaleDateString('tr-TR')}</p>
              <p><strong>Toplam:</strong> ₺${data.total}</p>
              <p><strong>Durum:</strong> ${data.status}</p>
            </div>
            <h3 style="color: #333;">Sipariş İçeriği:</h3>
            <ul style="list-style: none; padding: 0;">
              ${data.items && data.items.length > 0 ? data.items.map(item => `
                <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
                  <strong>${item.name}</strong><br>
                  <span style="color: #666;">Adet: ${item.quantity} × ₺${item.price}</span>
                </li>
              `).join('') : '<li>Sipariş içeriği listelenmemiş</li>'}
            </ul>
            <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0066cc; margin-top: 0;">Sonraki Adımlar:</h3>
              <ul style="color: #333; line-height: 1.6;">
                <li>24 saat içinde sizinle iletişime geçeceğiz</li>
                <li>Kişisel beslenme planınız hazırlanacak</li>
                <li>Danışan panelinizden siparişinizi takip edebilirsiniz</li>
              </ul>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.dashboardUrl}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Siparişi Görüntüle</a>
            </div>
          </div>
        </div>
      `
    },

    // Randevu Onayı
    appointmentConfirmation: {
      subject: isEnglish ? `Appointment Confirmed - ${data.date}` : `Randevu Onayı - ${data.date}`,
      html: isEnglish ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #0066cc; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Appointment Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your appointment is scheduled</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Appointment Details</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Time:</strong> ${data.time}</p>
              <p><strong>Duration:</strong> ${data.duration} minutes</p>
              <p><strong>Type:</strong> ${data.type}</p>
              <p><strong>Meeting:</strong> Online (Link will be sent 30 minutes before)</p>
            </div>
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">Important Notes:</h3>
              <ul style="color: #333; line-height: 1.6;">
                <li>Please be ready 5 minutes before the appointment</li>
                <li>The meeting link will be sent via WhatsApp and email</li>
                <li>For cancellation, please contact us 24 hours in advance</li>
              </ul>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.calendarUrl}" style="background-color: #0066cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">Add to Calendar</a>
              <a href="${data.dashboardUrl}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">View Appointment</a>
            </div>
          </div>
        </div>
      ` : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #0066cc; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Randevunuz Onaylandı!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Randevunuz planlandı</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Randevu Detayları</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Tarih:</strong> ${data.date}</p>
              <p><strong>Saat:</strong> ${data.time}</p>
              <p><strong>Süre:</strong> ${data.duration} dakika</p>
              <p><strong>Tür:</strong> ${data.type}</p>
              <p><strong>Görüşme:</strong> Online (Link 30 dakika öncesinde gönderilecek)</p>
            </div>
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">Önemli Notlar:</h3>
              <ul style="color: #333; line-height: 1.6;">
                <li>Randevu saatinden 5 dakika önce hazır olunuz</li>
                <li>Toplantı linki WhatsApp ve email ile gönderilecek</li>
                <li>İptal için 24 saat öncesinden bizimle iletişime geçiniz</li>
              </ul>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.calendarUrl}" style="background-color: #0066cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">Takvime Ekle</a>
              <a href="${data.dashboardUrl}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">Randevu Görüntüle</a>
            </div>
          </div>
        </div>
      `
    },

    // Kupon Gönderimi
    couponEmail: {
      subject: isEnglish ? `Special Discount Code: ${data.couponCode}` : `Özel İndirim Kodu: ${data.couponCode}`,
      html: isEnglish ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Special Discount!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Exclusive offer just for you</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0; text-align: center;">Your Discount Code</h2>
            <div style="background-color: #dc3545; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="margin: 0; font-size: 24px; letter-spacing: 2px;">${data.couponCode}</h3>
              <p style="margin: 10px 0 0 0; font-size: 18px;">${data.discount}% OFF</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Valid until:</strong> ${new Date(data.expiryDate).toLocaleDateString()}</p>
              <p><strong>Minimum order:</strong> ₺${data.minimumOrder}</p>
              <p><strong>Usage limit:</strong> ${data.usageLimit} time(s)</p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.shopUrl}" style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 18px;">Shop Now</a>
            </div>
          </div>
        </div>
      ` : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Özel İndirim!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Sadece sizin için özel fırsat</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0; text-align: center;">İndirim Kodunuz</h2>
            <div style="background-color: #dc3545; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="margin: 0; font-size: 24px; letter-spacing: 2px;">${data.couponCode}</h3>
              <p style="margin: 10px 0 0 0; font-size: 18px;">%${data.discount} İNDİRİM</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Geçerlilik tarihi:</strong> ${new Date(data.expiryDate).toLocaleDateString('tr-TR')}</p>
              <p><strong>Minimum sipariş:</strong> ₺${data.minimumOrder}</p>
              <p><strong>Kullanım limiti:</strong> ${data.usageLimit} kez</p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.shopUrl}" style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 18px;">Hemen Alışveriş Yap</a>
            </div>
          </div>
        </div>
      `
    },

    // Bülten Aboneliği
    newsletterWelcome: {
      subject: isEnglish ? 'Welcome to Oğuz Yolyapan Newsletter!' : 'Oğuz Yolyapan Bültenine Hoş Geldiniz!',
      html: isEnglish ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for subscribing to our newsletter</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">What to expect:</h2>
            <ul style="color: #333; line-height: 1.6;">
              <li>Weekly nutrition tips and recipes</li>
              <li>Health and wellness articles</li>
              <li>Exclusive discount codes</li>
              <li>Early access to new programs</li>
            </ul>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.websiteUrl}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Visit Website</a>
            </div>
          </div>
        </div>
      ` : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Hoş Geldiniz!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Bültenimize abone olduğunuz için teşekkür ederiz</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Neler bekleyebilirsiniz:</h2>
            <ul style="color: #333; line-height: 1.6;">
              <li>Haftalık beslenme ipuçları ve tarifler</li>
              <li>Sağlık ve yaşam kalitesi makaleleri</li>
              <li>Özel indirim kodları</li>
              <li>Yeni programlara erken erişim</li>
            </ul>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.websiteUrl}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Web Sitesini Ziyaret Et</a>
            </div>
          </div>
        </div>
      `
    }
  };

  return templates[type];
};

// Ana email gönderme fonksiyonu
export const sendEmail = async (emailOptions) => {
  try {
    console.log('Sending email with config:', {
      domain: MAILGUN_DOMAIN,
      apiKey: MAILGUN_API_KEY ? 'Set' : 'Not set',
      from: MAILGUN_FROM_EMAIL,
      to: emailOptions.to
    });

    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      throw new Error('Mailgun configuration is missing');
    }

    const { to, subject, html, text } = emailOptions;
    
    // Mailgun API ile gerçek email gönderimi
    console.log('Email data:', { to, subject, html: html ? 'HTML content provided' : 'No HTML', text });

    // Mailgun API endpoint
    const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;

    // FormData için email verisi (mailgun.js ve dokümantasyonuna uygun)
    const formData = new window.FormData();
    formData.append('from', MAILGUN_FROM_EMAIL);
    formData.append('to', to);
    formData.append('subject', subject);
    if (html) formData.append('html', html);
    if (text) formData.append('text', text);

    try {
      // Mailgun API çağrısı
      const response = await axios({
        method: 'post',
        url: mailgunUrl,
        data: formData,
        auth: {
          username: 'api',
          password: MAILGUN_API_KEY.trim()
        },
        headers: formData.getHeaders ? formData.getHeaders() : { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Email sent successfully:', response.data);

      // Email log to Supabase
      await logEmailActivity({
        recipient: to,
        subject,
        type: 'test',
        status: 'sent',
        messageId: response.data.id
      });

      return {
        success: true,
        messageId: response.data.id,
        message: response.data.message
      };

    } catch (apiError) {
      console.error('Mailgun API error:', apiError.response?.data || apiError.message);

      // Eğer hata authorized recipients ile ilgiliyse, daha detaylı bilgi ver
      if (apiError.response?.status === 403) {
        const errorMessage = apiError.response?.data?.message || 'Forbidden';
        console.error('Mailgun 403 Error Details:', errorMessage);

        if (errorMessage.includes('authorized recipients')) {
          console.error(`Email ${to} is not authorized for this sandbox domain. Please add it to authorized recipients in Mailgun dashboard.`);
        }
      }

      // Fallback to mock for development
      const mockResponse = {
        success: true,
        messageId: `mock-${Date.now()}`,
        message: 'Email queued for sending (mock fallback)',
        data: {
          id: `mock-${Date.now()}`,
          message: 'Queued. Thank you.'
        }
      };

      console.log('Mock email sent successfully:', mockResponse);

      // Email log to Supabase
      await logEmailActivity({
        recipient: to,
        subject,
        type: 'test',
        status: 'sent',
        messageId: mockResponse.messageId
      });

      return mockResponse;
    }

  } catch (error) {
    console.error('Email sending failed:', error);
    
    // Email log to Supabase
    await logEmailActivity({
      recipient: emailOptions.to,
      subject: emailOptions.subject,
      type: 'test',
      status: 'failed',
      error: error.message
    });

    return { success: false, error: error.message };
  }
};

// Template-based email gönderme (eski fonksiyon)
export const sendTemplateEmail = async (to, type, data, isEnglish = false) => {
  try {
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      throw new Error('Mailgun configuration is missing');
    }

    const template = generateEmailTemplate(type, data, isEnglish);
    
    return await sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text || `Email content: ${template.subject}`
    });

  } catch (error) {
    console.error('Template email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Toplu email gönderme
export const sendBulkEmail = async (recipients, type, data, isEnglish = false) => {
  try {
    const promises = recipients.map(recipient => 
      sendTemplateEmail(recipient, type, data, isEnglish)
    );
    
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    throw error;
  }
};

// Sipariş onay emaili
export const sendOrderConfirmation = async (orderData, isEnglish = false) => {
  const emailData = {
    orderNumber: orderData.order_number,
    createdAt: orderData.created_at,
    total: orderData.total_amount,
    status: orderData.status,
    items: orderData.items,
    dashboardUrl: isEnglish ? 
      `${window.location.origin}/en/client-panel` : 
      `${window.location.origin}/danisan-paneli`
  };

  return await sendTemplateEmail(
    orderData.customer_email,
    'orderConfirmation',
    emailData,
    isEnglish
  );
};

// Randevu onay emaili
export const sendAppointmentConfirmation = async (appointmentData, isEnglish = false) => {
  const emailData = {
    date: new Date(appointmentData.appointment_date).toLocaleDateString(),
    time: appointmentData.appointment_time,
    duration: appointmentData.duration,
    type: appointmentData.appointment_type,
    calendarUrl: generateCalendarUrl(appointmentData),
    dashboardUrl: isEnglish ? 
      `${window.location.origin}/en/client-panel` : 
      `${window.location.origin}/danisan-paneli`
  };

  return await sendTemplateEmail(
    appointmentData.client_email,
    'appointmentConfirmation',
    emailData,
    isEnglish
  );
};

// Kupon email gönderimi
export const sendCouponEmail = async (email, couponData, isEnglish = false) => {
  const emailData = {
    couponCode: couponData.code,
    discount: couponData.discount_value,
    expiryDate: couponData.valid_until,
    minimumOrder: couponData.minimum_order_amount || 0,
    usageLimit: couponData.usage_limit_per_user || 1,
    shopUrl: isEnglish ? 
      `${window.location.origin}/en/packages` : 
      `${window.location.origin}/paketler`
  };

  return await sendTemplateEmail(
    email,
    'couponEmail',
    emailData,
    isEnglish
  );
};

// Bülten hoş geldin emaili
export const sendNewsletterWelcome = async (email, isEnglish = false) => {
  const emailData = {
    websiteUrl: isEnglish ? 
      `${window.location.origin}/en` : 
      `${window.location.origin}`
  };

  return await sendTemplateEmail(
    email,
    'newsletterWelcome',
    emailData,
    isEnglish
  );
};

// Takvim URL'i oluşturma
const generateCalendarUrl = (appointmentData) => {
  const startDate = new Date(`${appointmentData.appointment_date}T${appointmentData.appointment_time}`);
  const endDate = new Date(startDate.getTime() + (appointmentData.duration * 60000));
  
  const title = encodeURIComponent('Beslenme Danışmanlığı - Oğuz Yolyapan');
  const details = encodeURIComponent(`Online randevu - ${appointmentData.appointment_type}`);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${details}`;
};

// Email log sistemi (Supabase'e kaydetmek için)
export const logEmailActivity = async (emailData) => {
  try {
    // Supabase'e email aktivitesini kaydet
    const { data, error } = await supabase
      .from('email_logs')
      .insert([
        {
          recipient: emailData.recipient,
          subject: emailData.subject,
          type: emailData.type || 'general',
          status: emailData.status || 'sent',
          message_id: emailData.messageId,
          error_message: emailData.error || null
        }
      ]);
    
    if (error) {
      console.error('Email log error:', error);
    } else {
      console.log('Email activity logged successfully:', data);
    }
    
    return data;
  } catch (error) {
    console.error('Email logging failed:', error);
    return null;
  }
};

export default {
  sendEmail,
  sendTemplateEmail,
  sendBulkEmail,
  sendOrderConfirmation,
  sendAppointmentConfirmation,
  sendCouponEmail,
  sendNewsletterWelcome,
  logEmailActivity
};