import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const API_KEY = 'AIzaSyC_9XRXb2UOTjFj1BZyxWYkaVFcIcfDgMg';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
  flow: {
    // This function will be called before each flow execution.
    // It can be used to perform any necessary setup or validation.
    async before(flow, input) {
      // The before hook is no longer necessary as the API key is hardcoded.
      return input;
    },
  },
});
