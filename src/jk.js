// src/Translate.js
import React, { useState } from 'react';
import axios from 'axios';
import './Translate.css';
const Translate = () => {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    // Add more languages as needed
  ];

  const handleTranslate = async () => {
    try {
      const response = await axios.post('https://api.mymemory.translated.net/get', null, {
        params: {
          q: text,
          langpair: `${sourceLanguage}|${targetLanguage}`,
        },
      });
      setTranslation(response.data.responseData.translatedText);
    } catch (error) {
      console.error('Error translating text:', error);
      setTranslation('Error translating text');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2 style={{color:'white'}}>Text Translator</h2>
      <textarea
        rows="4"
        placeholder="Enter text to translate"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <div>
        <label>
          Source Language:
          <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
            {languages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Target Language:
          <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
            {languages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button onClick={handleTranslate} style={{ marginTop: '10px' }}>
        Translate
      </button>
      <h3>Translation:</h3>
      <p>{translation}</p>
    </div>
  );
};

export default Translate;
