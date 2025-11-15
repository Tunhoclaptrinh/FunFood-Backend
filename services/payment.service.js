const crypto = require('crypto');
const db = require('../config/database');

/**
 * Payment Service
 * Tích hợp thanh toán: Cash, MoMo, ZaloPay
 */
class PaymentService {
  /**
   * Process payment cho order
   */
  async processPayment(orderId, paymentMethod, paymentData = {}) {
    const order = db.findById('orders', orderId);

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        statusCode: 404
      };
    }

    if (order.paymentStatus === 'completed') {
      return {
        success: false,
        message: 'Order already paid',
        statusCode: 400
      };
    }

    let paymentResult;

    switch (paymentMethod) {
      case 'cash':
        paymentResult = await this.processCashPayment(order);
        break;
      case 'momo':
        paymentResult = await this.processMoMoPayment(order, paymentData);
        break;
      case 'zalopay':
        paymentResult = await this.processZaloPayPayment(order, paymentData);
        break;
      case 'card':
        paymentResult = await this.processCardPayment(order, paymentData);
        break;
      default:
        return {
          success: false,
          message: 'Invalid payment method',
          statusCode: 400
        };
    }

    // Update order payment status
    if (paymentResult.success) {
      db.update('orders', orderId, {
        paymentStatus: 'completed',
        paymentMethod: paymentMethod,
        paymentData: {
          ...paymentResult.data,
          paidAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });

      // Create notification
      db.create('notifications', {
        userId: order.userId,
        title: 'Payment Successful',
        message: `Payment for order #${orderId} completed successfully`,
        type: 'payment',
        refId: orderId,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    return paymentResult;
  }

  /**
   * Cash payment (COD)
   */
  async processCashPayment(order) {
    // Cash payment sẽ được xác nhận khi delivered
    return {
      success: true,
      message: 'Cash payment will be collected on delivery',
      data: {
        method: 'cash',
        amount: order.total,
        status: 'pending'
      }
    };
  }

  /**
   * MoMo payment
   */
  async processMoMoPayment(order, paymentData) {
    try {
      // MoMo API configuration
      const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO_TEST';
      const accessKey = process.env.MOMO_ACCESS_KEY || 'test_access_key';
      const secretKey = process.env.MOMO_SECRET_KEY || 'test_secret_key';

      const orderId = `FUNFOOD_${order.id}_${Date.now()}`;
      const amount = order.total.toString();
      const orderInfo = `Payment for FunFood Order #${order.id}`;
      const returnUrl = process.env.MOMO_RETURN_URL || 'http://localhost:3000/payment/callback';
      const notifyUrl = process.env.MOMO_NOTIFY_URL || 'http://localhost:3000/api/payment/momo/callback';
      const requestId = `${orderId}_${Date.now()}`;
      const requestType = 'captureWallet';
      const extraData = '';

      // Create signature
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;

      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

      // In production, gọi MoMo API
      // const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', {
      //   partnerCode,
      //   accessKey,
      //   requestId,
      //   amount,
      //   orderId,
      //   orderInfo,
      //   returnUrl,
      //   notifyUrl,
      //   requestType,
      //   signature,
      //   extraData
      // });

      // For development, return mock data
      return {
        success: true,
        message: 'MoMo payment initiated',
        data: {
          method: 'momo',
          amount: order.total,
          transactionId: orderId,
          // payUrl: response.data.payUrl, // Real API
          payUrl: `https://test-payment.momo.vn/pay?orderId=${orderId}`, // Mock
          deeplink: `momo://app?action=pay&orderId=${orderId}`, // Mock
          qrCodeUrl: `https://test-payment.momo.vn/qr/${orderId}`, // Mock
          status: 'pending'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'MoMo payment failed',
        error: error.message
      };
    }
  }

  /**
   * ZaloPay payment
   */
  async processZaloPayPayment(order, paymentData) {
    try {
      // ZaloPay API configuration
      const appId = process.env.ZALOPAY_APP_ID || '2553';
      const key1 = process.env.ZALOPAY_KEY1 || 'test_key1';
      const key2 = process.env.ZALOPAY_KEY2 || 'test_key2';

      const transId = `${Date.now()}`;
      const appTransId = `${new Date().format('yyMMdd')}_${transId}`;
      const amount = order.total;
      const embedData = JSON.stringify({
        orderId: order.id,
        promotioninfo: order.promotionCode || ''
      });
      const items = JSON.stringify(order.items);
      const description = `FunFood - Order #${order.id}`;
      const bankCode = '';

      // Create MAC
      const data = `${appId}|${appTransId}|${order.userId}|${amount}|${Date.now()}|${embedData}|${items}`;
      const mac = crypto
        .createHmac('sha256', key1)
        .update(data)
        .digest('hex');

      // In production, gọi ZaloPay API
      // const response = await axios.post('https://sb-openapi.zalopay.vn/v2/create', {
      //   app_id: appId,
      //   app_trans_id: appTransId,
      //   app_user: order.userId.toString(),
      //   app_time: Date.now(),
      //   amount,
      //   item: items,
      //   embed_data: embedData,
      //   description,
      //   bank_code: bankCode,
      //   mac
      // });

      // For development, return mock data
      return {
        success: true,
        message: 'ZaloPay payment initiated',
        data: {
          method: 'zalopay',
          amount: order.total,
          transactionId: appTransId,
          // orderUrl: response.data.order_url, // Real API
          orderUrl: `https://sb-openapi.zalopay.vn/pay?appTransId=${appTransId}`, // Mock
          deeplink: `zalopay://app?action=pay&transId=${appTransId}`, // Mock
          qrCodeUrl: `https://sb-openapi.zalopay.vn/qr/${appTransId}`, // Mock
          status: 'pending'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'ZaloPay payment failed',
        error: error.message
      };
    }
  }

  /**
   * Card payment (Credit/Debit)
   */
  async processCardPayment(order, paymentData) {
    try {
      // Validate card data
      const { cardNumber, cardHolder, expiryDate, cvv } = paymentData;

      if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
        return {
          success: false,
          message: 'Invalid card information'
        };
      }

      // In production, integrate with payment gateway (Stripe, PayPal, etc.)
      // For now, validate card number format
      const isValidCard = /^[0-9]{13,19}$/.test(cardNumber.replace(/\s/g, ''));

      if (!isValidCard) {
        return {
          success: false,
          message: 'Invalid card number'
        };
      }

      // Mock successful payment
      const transactionId = `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        message: 'Card payment successful',
        data: {
          method: 'card',
          amount: order.total,
          transactionId,
          cardLast4: cardNumber.slice(-4),
          status: 'completed'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Card payment failed',
        error: error.message
      };
    }
  }

  /**
   * Verify payment callback (MoMo/ZaloPay)
   */
  async verifyPaymentCallback(provider, callbackData) {
    try {
      let isValid = false;
      let orderId = null;
      let status = 'failed';

      if (provider === 'momo') {
        // Verify MoMo signature
        const { partnerCode, orderId: momoOrderId, requestId, amount, orderInfo,
          orderType, transId, resultCode, message, payType, responseTime,
          extraData, signature } = callbackData;

        const secretKey = process.env.MOMO_SECRET_KEY || 'test_secret_key';

        const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${momoOrderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

        const expectedSignature = crypto
          .createHmac('sha256', secretKey)
          .update(rawSignature)
          .digest('hex');

        isValid = signature === expectedSignature;
        orderId = momoOrderId.split('_')[1]; // Extract order ID from FUNFOOD_123_timestamp
        status = resultCode === 0 ? 'completed' : 'failed';

      } else if (provider === 'zalopay') {
        // Verify ZaloPay signature
        const { data: zpData, mac } = callbackData;
        const key2 = process.env.ZALOPAY_KEY2 || 'test_key2';

        const expectedMac = crypto
          .createHmac('sha256', key2)
          .update(zpData)
          .digest('hex');

        isValid = mac === expectedMac;

        const parsedData = JSON.parse(zpData);
        const embedData = JSON.parse(parsedData.embed_data);
        orderId = embedData.orderId;
        status = parsedData.status === 1 ? 'completed' : 'failed';
      }

      if (!isValid) {
        return {
          success: false,
          message: 'Invalid signature'
        };
      }

      // Update order payment status
      const order = db.findById('orders', orderId);

      if (order) {
        db.update('orders', orderId, {
          paymentStatus: status,
          paymentData: {
            ...order.paymentData,
            callbackData,
            verifiedAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        });

        // Notify user
        db.create('notifications', {
          userId: order.userId,
          title: status === 'completed' ? 'Payment Successful' : 'Payment Failed',
          message: status === 'completed'
            ? `Payment for order #${orderId} completed successfully`
            : `Payment for order #${orderId} failed. Please try again.`,
          type: 'payment',
          refId: orderId,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      return {
        success: true,
        status,
        orderId
      };
    } catch (error) {
      return {
        success: false,
        message: 'Verification failed',
        error: error.message
      };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderId) {
    const order = db.findById('orders', orderId);

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        statusCode: 404
      };
    }

    return {
      success: true,
      data: {
        orderId: order.id,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        amount: order.total,
        paymentData: order.paymentData
      }
    };
  }

  /**
   * Refund payment
   */
  async refundPayment(orderId, reason = '') {
    const order = db.findById('orders', orderId);

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        statusCode: 404
      };
    }

    if (order.paymentStatus !== 'completed') {
      return {
        success: false,
        message: 'Order payment not completed',
        statusCode: 400
      };
    }

    // In production, call payment gateway API for refund
    // For now, just update status

    db.update('orders', orderId, {
      paymentStatus: 'refunded',
      refundData: {
        reason,
        refundedAt: new Date().toISOString(),
        amount: order.total
      },
      updatedAt: new Date().toISOString()
    });

    // Notify user
    db.create('notifications', {
      userId: order.userId,
      title: 'Payment Refunded',
      message: `Payment for order #${orderId} has been refunded: ${order.total.toLocaleString()}đ`,
      type: 'payment',
      refId: orderId,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Refund processed successfully',
      data: {
        orderId,
        amount: order.total,
        refundedAt: new Date().toISOString()
      }
    };
  }
}

// Helper: Date format for ZaloPay
Date.prototype.format = function (fmt) {
  const o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    'S': this.getMilliseconds()
  };

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }

  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }

  return fmt;
};

module.exports = new PaymentService();