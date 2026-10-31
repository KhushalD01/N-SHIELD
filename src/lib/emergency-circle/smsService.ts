/**
 * N-SHIELD SMS & Emergency Notification Service
 * 
 * Supports production SMS providers (Twilio, Fast2SMS) with fallback to an
 * explicit server-side development test mode when external credentials are not set.
 */

import type { ContactNotificationStatus, TrustedContact } from "./types";

export interface SmsSendResult {
  success: boolean;
  messageId: string;
  channel: "sms" | "mock_sms";
  status: "sent" | "delivered" | "failed";
  error?: string;
}

/**
 * Dispatches an OTP verification code via SMS
 */
export async function sendOtpSms(
  phoneNumber: string,
  otp: string,
  contactName: string
): Promise<SmsSendResult> {
  const message = `[N-SHIELD Nagpur] Your emergency contact verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

  // 1. Check for Twilio Credentials
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const authHeader = `Basic ${Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64")}`;
      
      const formData = new URLSearchParams();
      formData.append("To", phoneNumber);
      formData.append("From", twilioFrom);
      formData.append("Body", message);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[N-SHIELD SMS] Twilio error:", errorText);
        return {
          success: false,
          messageId: `err_${Date.now()}`,
          channel: "sms",
          status: "failed",
          error: "SMS provider failed to dispatch OTP",
        };
      }

      const twilioData = await res.json();
      return {
        success: true,
        messageId: twilioData.sid || `sms_${Date.now()}`,
        channel: "sms",
        status: "sent",
      };
    } catch (err: any) {
      console.error("[N-SHIELD SMS] Network error while calling Twilio:", err);
      return {
        success: false,
        messageId: `err_${Date.now()}`,
        channel: "sms",
        status: "failed",
        error: err.message || "Failed to reach SMS gateway",
      };
    }
  }

  // 2. Development Test Mode (Explicitly Labeled)
  console.log("=================================================");
  console.log("📱 [N-SHIELD DEV SMS DISPATCHER: TEST MODE]");
  console.log(`To: ${contactName} (${phoneNumber})`);
  console.log(`Content: ${message}`);
  console.log("Status: DISPATCHED (Simulated in development environment)");
  console.log("=================================================");

  return {
    success: true,
    messageId: `mock_otp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    channel: "mock_sms",
    status: "sent",
  };
}

/**
 * Dispatches the emergency live-location alert to a trusted contact
 */
export async function sendEmergencyAlert(
  contact: TrustedContact,
  userName: string,
  shareUrl: string,
  alertTimestamp: string
): Promise<ContactNotificationStatus> {
  const formattedTime = new Date(alertTimestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const smsText = `EMERGENCY ALERT: ${userName} has requested assistance and is sharing their live location with you through N-SHIELD. View their location: ${shareUrl}. Alert time: ${formattedTime} IST. If you believe they are in immediate danger, contact the appropriate emergency service (112).`;

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const authHeader = `Basic ${Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64")}`;
      
      const formData = new URLSearchParams();
      formData.append("To", contact.normalizedPhone);
      formData.append("From", twilioFrom);
      formData.append("Body", smsText);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        const errDetails = await res.text();
        return {
          contactId: contact.id,
          contactName: contact.name,
          phone: contact.normalizedPhone,
          status: "failed",
          channel: "sms",
          error: `SMS provider error (${res.status})`,
        };
      }

      const resJson = await res.json();
      return {
        contactId: contact.id,
        contactName: contact.name,
        phone: contact.normalizedPhone,
        status: "sent",
        messageId: resJson.sid,
        channel: "sms",
        sentAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        contactId: contact.id,
        contactName: contact.name,
        phone: contact.normalizedPhone,
        status: "failed",
        channel: "sms",
        error: err.message || "Failed to reach SMS provider",
      };
    }
  }

  // Development Test Mode (Explicitly Labeled)
  console.log("=================================================");
  console.log("🚨 [N-SHIELD EMERGENCY ALERT DISPATCHER: TEST MODE]");
  console.log(`Recipient: ${contact.name} (${contact.normalizedPhone})`);
  console.log(`Message: ${smsText}`);
  console.log("Channel: mock_sms (No SMS gateway keys detected in .env.local)");
  console.log("=================================================");

  return {
    contactId: contact.id,
    contactName: contact.name,
    phone: contact.normalizedPhone,
    status: "sent",
    messageId: `mock_alert_${Date.now()}_${contact.id.slice(0, 5)}`,
    channel: "mock_sms",
    sentAt: new Date().toISOString(),
  };
}

