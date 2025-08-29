import CryptoJS from 'crypto-js';
import { supabase } from './supabaseClient';

const PAYTR_MERCHANT_ID = import.meta.env.VITE_PAYTR_MERCHANT_ID;
const PAYTR_MERCHANT_KEY = import.meta.env.VITE_PAYTR_MERCHANT_KEY;
const PAYTR_MERCHANT_SALT = import.meta.env.VITE_PAYTR_MERCHANT_SALT;
const PAYTR_API_URL = 'https://www.paytr.com/odeme/api/get-token';

// PayTR token oluşturma
export const generatePayTRToken = async (orderData) => {
  try {
    const {
      merchant_oid,
      email,
      payment_amount,
      payment_type = 'card',
      installment_count = 0,
      currency = 'TL',
      test_mode = import.meta.env.VITE_PAYTR_TEST_MODE === 'true' ? 1 : 0
    } = orderData;

    // Mechanik sepet hazırlama
    const user_basket = JSON.stringify([
      orderData.items.map(item => [
        item.name,
        item.price.toString(),
        item.quantity
      ])
    ]);

    // Callback URL'leri
    const merchant_ok_url = `${window.location.origin}/payment-success`;
    const merchant_fail_url = `${window.location.origin}/payment-failed`;

    // Hash oluşturma
    const hashString = [
      PAYTR_MERCHANT_ID,
      orderData.user_ip,
      merchant_oid,
      email,
      payment_amount,
      payment_type,
      installment_count,
      currency,
      test_mode,
      PAYTR_MERCHANT_SALT
    ].join('|');

    const token = CryptoJS.HmacSHA256(hashString, PAYTR_MERCHANT_KEY).toString();

    // PayTR API'ye gönderilecek data
    const paymentData = {
      merchant_id: PAYTR_MERCHANT_ID,
      user_ip: orderData.user_ip,
      merchant_oid: merchant_oid,
      email: email,
      payment_amount: payment_amount,
      payment_type: payment_type,
      installment_count: installment_count,
      currency: currency,
      test_mode: test_mode,
      non_3d: 0,
      merchant_ok_url: merchant_ok_url,
      merchant_fail_url: merchant_fail_url,
      user_name: orderData.user_name,
      user_address: orderData.user_address,
      user_phone: orderData.user_phone,
      user_basket: user_basket,
      debug_on: test_mode,
      client_lang: orderData.lang || 'tr',
      paytr_token: token,
      timeout_limit: 30
    };

    console.log('PayTR Request Data:', paymentData);

    // PayTR API'ye istek gönder
    const response = await fetch(PAYTR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(paymentData).toString()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }

    try {
      const data = JSON.parse(text);
      if (data.status === 'success') {
        return {
          success: true,
          token: data.token,
          iframe_url: `https://www.paytr.com/odeme/guvenli/${data.token}`
        };
      } else {
        throw new Error(data.reason || 'PayTR token generation failed');
      }
    } catch (error) {
      console.error('Invalid JSON response:', text);
      throw new Error('Invalid JSON response from server');
    }

  } catch (error) {
    console.error('PayTR token generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// PayTR callback doğrulama
export const verifyPayTRCallback = async (callbackData) => {
  try {
    const {
      merchant_oid,
      status,
      total_amount,
      hash
    } = callbackData;

    // Hash doğrulama
    const hashString = [
      merchant_oid,
      PAYTR_MERCHANT_SALT,
      status,
      total_amount
    ].join('|');

    const calculatedHash = CryptoJS.HmacSHA256(hashString, PAYTR_MERCHANT_KEY).toString();

    if (hash !== calculatedHash) {
      throw new Error('Invalid hash - Security check failed');
    }

    // Sipariş durumunu güncelle
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: status === 'success' ? 'paid' : 'failed',
        payment_reference: callbackData.payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('order_number', merchant_oid);

    if (error) {
      throw new Error('Database update failed');
    }

    return {
      success: true,
      status: status,
      order_id: merchant_oid,
      verified: true
    };

  } catch (error) {
    console.error('PayTR callback verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Sipariş oluşturma ve PayTR token alma
export const createPayTRPayment = async (orderData, userData) => {
  try {
    // Önce siparişi Supabase'e kaydet
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          order_number: orderNumber,
          user_id: userData.id,
          customer_name: `${userData.firstName} ${userData.lastName}`,
          customer_email: userData.email,
          customer_phone: userData.phone,
          subtotal: orderData.subtotal,
          tax_amount: orderData.tax,
          discount_amount: orderData.discount || 0,
          total_amount: orderData.total,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'paytr',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (orderError) {
      throw new Error('Order creation failed');
    }

    // Sipariş öğelerini kaydet
    const orderItems = orderData.items.map(item => ({
      order_id: orderResult.id,
      package_id: item.id,
      package_title_tr: item.name,
      package_title_en: item.name,
      unit_price: item.price,
      quantity: item.quantity,
      total_price: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw new Error('Order items creation failed');
    }

    // PayTR token oluştur
    const paytrData = {
      merchant_oid: orderNumber,
      email: userData.email,
      payment_amount: Math.round(orderData.total * 100), // Kuruş cinsinden
      user_ip: await getUserIP(),
      user_name: `${userData.firstName} ${userData.lastName}`,
      user_address: userData.address || 'N/A',
      user_phone: userData.phone || 'N/A',
      items: orderData.items,
      lang: orderData.lang || 'tr'
    };

    const paytrResult = await generatePayTRToken(paytrData);

    if (!paytrResult.success) {
      throw new Error(paytrResult.error);
    }

    return {
      success: true,
      order_id: orderResult.id,
      order_number: orderNumber,
      payment_url: paytrResult.iframe_url,
      token: paytrResult.token
    };

  } catch (error) {
    console.error('PayTR payment creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// IP adresi alma
const getUserIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('IP fetch error:', error);
    return '127.0.0.1'; // Fallback
  }
};

// Taksit seçenekleri alma
export const getInstallmentOptions = async (binNumber, amount) => {
  try {
    const response = await fetch('https://www.paytr.com/odeme/api/get-installment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        merchant_id: PAYTR_MERCHANT_ID,
        bin_number: binNumber,
        amount: Math.round(amount * 100)
      }).toString()
    });

    const result = await response.json();

    if (result.status === 'success') {
      return {
        success: true,
        installments: result.installments
      };
    } else {
      throw new Error(result.reason || 'Installment options fetch failed');
    }

  } catch (error) {
    console.error('Installment options error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Ödeme durumu sorgulama
export const checkPaymentStatus = async (orderNumber) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('payment_status, status, total_amount')
      .eq('order_number', orderNumber)
      .single();

    if (error) {
      throw new Error('Payment status check failed');
    }

    return {
      success: true,
      payment_status: data.payment_status,
      order_status: data.status,
      amount: data.total_amount
    };

  } catch (error) {
    console.error('Payment status check error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// PayTR test kartları
export const getTestCards = () => {
  return [
    {
      name: 'Başarılı Test Kartı',
      number: '4355084355084358',
      expiry: '12/26',
      cvv: '000',
      type: 'success'
    },
    {
      name: 'Yetersiz Bakiye',
      number: '4355084355084325',
      expiry: '12/26',
      cvv: '000',
      type: 'insufficient_funds'
    },
    {
      name: 'Geçersiz Kart',
      number: '4355084355084333',
      expiry: '12/26',
      cvv: '000',
      type: 'invalid_card'
    }
  ];
};

export default {
  generatePayTRToken,
  verifyPayTRCallback,
  createPayTRPayment,
  getInstallmentOptions,
  checkPaymentStatus,
  getTestCards
};