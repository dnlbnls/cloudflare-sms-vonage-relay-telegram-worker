const TELEGRAM_BOT_TOKEN = '';
const CHAT_ID = '';

export default {
  async fetch(request, env, ctx) {
    // For debugging purposes
    console.log("Request method is: " + request.method);

    try {
      const url = new URL(request.url);
      const params = url.searchParams;
      let queryParams = {};

      if (params && params.size > 0) {
        // Read parameters
        for (const [key, value] of params.entries()) {
          queryParams[key] = value;
        }
        
        // Transform UTC timestamp from Vonage message-timestamp to timezone and format it
        let formattedDate = "";
        if (queryParams['message-timestamp']) {
          const utcDate = new Date(queryParams['message-timestamp']);
          formattedDate = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Mazatlan',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).format(utcDate);
        }

        
        // Format message
        // Check https://developer.vonage.com/en/messaging/sms/guides/inbound-sms
        const from = queryParams['msisdn'] || "Unknown sender";
        const to = queryParams['to'] || "Unknown recipient";
        const time = formattedDate ? `${formattedDate}` : "Unknown time";
        const messageBody = queryParams['text'] || "No message content";
        
        const messageText = `type: sms\nfrom: ${from}\nto: ${to}\ntime: ${time}\n.\n${messageBody}`;

        const telegramURL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        // Send message to bot
        const telegramResponse = await fetch(telegramURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: messageText
          })
        });

        const telegramResult = await telegramResponse.json();
        // console.log('Message sent to Telegram', telegramResult);

      } else {
        // console.log("No URL params defined");
      }

      // Processing other parts of the request if necessary
      if (request.method === "POST") {
        const jsonPayload = await request.json();
        console.log(jsonPayload);
      }

      return new Response("Request processed successfully.", {
        status: 200,
      });

    } catch (error) {
      console.log(error);
      return new Response("Failed to process request.", {
        status: 500,
      });
    }
  },
};