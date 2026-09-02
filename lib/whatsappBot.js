/**
 * WhatsApp Bot Service
 * For QA purposes, this mock will simulate sending messages.
 * Once a provider is selected, this module can be updated to make HTTP requests
 * to Twilio, Meta Cloud API, Green API, etc.
 */

export async function sendWhatsAppMessage(to, message) {
  console.log('\n======================================================');
  console.log(`[WHATSAPP BOT - QA MOCK]`);
  console.log(`To: ${to}`);
  console.log(`Message: \n${message}`);
  console.log('======================================================\n');
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Return success
  return { success: true, messageId: `msg_${Date.now()}` };
}
