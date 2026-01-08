import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

if (!accountSid || !authToken || !apiKey || !apiSecret) {
  throw new Error('Twilio credentials are missing. Check your .env file');
}

// Twilio Client for server-side operations
const twilioClient = twilio(accountSid, authToken);

// Generate access token for client-side (NEW Twilio Voice SDK)
export const generateAccessToken = (identity) => {
  try {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    // Create a voice grant
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    });

    // Create an access token
    const token = new AccessToken(
      accountSid,
      apiKey,
      apiSecret,
      { identity: identity, ttl: 3600 } // 1 hour expiration
    );

    token.addGrant(voiceGrant);
    return token.toJwt();
  } catch (error) {
    console.error('Error generating access token:', error);
    throw new Error('Failed to generate Twilio access token');
  }
};

// Create TwiML for calls
export const generateTwiML = (to) => {
  try {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

   const dial = response.dial({
  timeout: 30
});

dial.client(to);


    return response.toString();
  } catch (error) {
    console.error('Error generating TwiML:', error);
    return '<Response><Say>Error in call configuration</Say></Response>';
  }
};

// Generate TwiML endpoint (for Twilio webhook)
export const generateTwiMLEndpoint = (req, res) => {
  try {
    const { To } = req.body;
    
    if (!To) {
      return res.status(400).type('text/xml').send(
        '<Response><Say>Missing recipient information</Say></Response>'
      );
    }

    const twiml = generateTwiML(To);
    res.type('text/xml').send(twiml);
  } catch (error) {
    console.error('Error in TwiML endpoint:', error);
    res.type('text/xml').send(
      '<Response><Say>Internal server error</Say></Response>'
    );
  }
};

export { twilioClient };