class TranslationAPI {
  constructor() {
      this.baseUrl = 'http://127.0.0.1:8000';
  }

  async translate(text, fromLang = 'en', toLang = 'zh') {
      try {
          const response = await fetch(`${this.baseUrl}/translate`, {
              method: 'POST',
              mode: 'cors',  // 明确指定 CORS 模式
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
              },
              body: JSON.stringify({
                  text,
                  from_lang: fromLang,
                  to_lang: toLang
              })
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
          }

          const data = await response.json();
          if (!data.translated_text) {
              throw new Error('No translation in response');
          }
          return data.translated_text;
      } catch (error) {
          console.error('Translation request failed:', error);
          if (error.message.includes('CORS')) {
              console.error('CORS error - make sure the backend allows cross-origin requests');
          }
          throw error;
      }
  }
}

window.translationAPI = new TranslationAPI();