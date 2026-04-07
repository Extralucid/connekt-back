import axios from 'axios';
import redis from '../config/redis.js';
import crypto from 'crypto';

const client = axios.create({
  baseURL: process.env.SMS_API_URL, // Replace with your API's base URL
  timeout: 5000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Add any other default headers, e.g., for authorization
    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
});

class SMSService {
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOTP(phoneNumber, otp) {
    try {
      // Format phone number (ensure it has country code)
      let formattedNumber = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedNumber = `+${phoneNumber}`;
      }

      const message = await client.messages.create({
        body: `Your verification code for Youth Platform is: ${otp}. This code will expire in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber,
      });

      // Store OTP in Redis with 10 minute expiry
      const key = `otp:${phoneNumber}`;
      await redis.setex(key, 600, otp);

      // Store attempt count
      const attemptsKey = `otp_attempts:${phoneNumber}`;
      await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, 600);

      return {
        success: true,
        sid: message.sid,
      };
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw new Error('Failed to send OTP. Please try again.');
    }
  }

  static async verifyOTP(phoneNumber, userOTP) {
    try {
      const key = `otp:${phoneNumber}`;
      const storedOTP = await redis.get(key);

      if (!storedOTP) {
        throw new Error('OTP expired or not found');
      }

      if (storedOTP !== userOTP) {
        const attemptsKey = `otp_attempts:${phoneNumber}`;
        const attempts = await redis.get(attemptsKey);

        if (attempts && parseInt(attempts) >= 3) {
          await redis.del(key);
          throw new Error('Too many failed attempts. Please request a new OTP.');
        }

        throw new Error('Invalid OTP');
      }

      // Clear OTP after successful verification
      await redis.del(key);
      await redis.del(`otp_attempts:${phoneNumber}`);

      return true;
    } catch (error) {
      throw error;
    }
  }


  static async sendVerificationCode(phoneNumber, code) {
    try {
      const key = `otp_resend:${phoneNumber}`;
      const lastResend = await redis.get(key);

      if (lastResend) {
        throw new Error('Please wait 60 seconds before requesting another OTP');
      }

      const message = await this.client.post('/SendSMS', {
        senderId: "SANLAM",
        is_Unicode: true,
        is_Flash: false,
        isRegisteredForDelivery: true,
        dataCoding: 0,
        message: `Votre code de vérification est: ${code}. Ce code expirera dans 10 minutes.`,
        mobileNumbers: phoneNumber,
        clientId: process.env.SMS_ClIENT_ID,
        apiKey: process.env.SMS_API_KEY

      });

      console.log(`SMS sent to ${phoneNumber}, SID: ${message.sid}`);
      // Set cooldown for resend
      await redis.setex(key, 60, Date.now());

      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw new Error('Failed to send SMS verification code');
    }
  }

  static async send2FACode(phoneNumber, code) {
    try {
      const message = await this.client.post('/SendSMS', {
        senderId: "SANLAM",
        is_Unicode: true,
        is_Flash: false,
        isRegisteredForDelivery: true,
        dataCoding: 0,
        message: `Votre code de vérification est: ${code}. Ce code expirera dans 10 minutes.`,
        mobileNumbers: phoneNumber,
        clientId: process.env.SMS_ClIENT_ID,
        apiKey: process.env.SMS_API_KEY
      });

      console.log(`2FA SMS sent to ${phoneNumber}, SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('2FA SMS sending failed:', error);
      throw new Error('Failed to send 2FA code');
    }
  }

  // Verify phone number via SMS (optional)
  static async sendPhoneVerification(phoneNumber) {
    try {
      const verification = await this.client.post('/SendSMS', {
        to: phoneNumber, channel: 'sms',
        senderId: process.env.SMS_SENDER_ID,
        clientId: process.env.SMS_ClIENT_ID,
        apiKey: process.env.SMS_API_KEY
      });

      return verification.sid;
    } catch (error) {
      console.error('Phone verification failed:', error);
      throw new Error('Failed to send phone verification');
    }
  }

  static async verifyPhoneNumber(phoneNumber, code) {
    try {
      const verificationCheck = await this.client.post('/SendSMS', {
        senderId: "SANLAM",
        is_Unicode: true,
        is_Flash: false,
        isRegisteredForDelivery: true,
        dataCoding: 0,
        message: `Votre code de vérification est: ${code}. Ce code expirera dans 10 minutes.`,
        mobileNumbers: phoneNumber,
        clientId: process.env.SMS_ClIENT_ID,
        apiKey: process.env.SMS_API_KEY
      });

      return verificationCheck.status === 'approved';
    } catch (error) {
      console.error('Phone verification check failed:', error);
      return false;
    }
  }

  static async sendPasswordResetCode(phoneNumber, token) {
    try {
      const message = await this.client.post('/SendSMS', {
        senderId: "SANLAM",
        is_Unicode: true,
        is_Flash: false,
        isRegisteredForDelivery: true,
        dataCoding: 0,
        message: `Votre code de réinitialisation de mot de passe est: ${token}. Ce code expirera dans 1 heure.`,
        mobileNumbers: phoneNumber,
        clientId: process.env.SMS_ClIENT_ID,
        apiKey: process.env.SMS_API_KEY
      });

      console.log(`Password reset SMS sent to ${phoneNumber}, SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('Password reset SMS sending failed:', error);
      throw new Error('Failed to send password reset code');
    }
  }
}

export default SMSService;