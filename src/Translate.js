import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import './Translate.css';

const Translate = () => {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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
  ];

  const handleTranslate = async () => {
    setLoading(true);
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
      setTranslation('Error translating text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setLoading(true);
      try {
        const { data: { text: ocrText } } = await Tesseract.recognize(
          file,
          'eng',
          { logger: (m) => console.log(m) }
        );
        setText(ocrText);
      } catch (error) {
        console.error('Error processing image:', error);
        setText('Error processing image.');
      } finally {
        setLoading(false);
      }
    }
  };

  const startCameraAndCapture = async () => {
    setLoading(true);
    if (!isCameraActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
        setIsCameraActive(true);
      } catch (error) {
        console.error('Error accessing the camera:', error);
        setLoading(false);
      }
    } else {
      captureImage();
    }
  };

  const captureImage = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setImage(dataUrl);

    Tesseract.recognize(dataUrl, 'eng', { logger: (m) => console.log(m) })
      .then(({ data: { text: ocrText } }) => {
        setText(ocrText);
        setLoading(false);
        setIsCameraActive(false);
        stopCamera();
      })
      .catch((error) => {
        console.error('OCR Error:', error);
        setLoading(false);
        setIsCameraActive(false);
        stopCamera();
      });
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="container">
      <h1>Text Translator</h1>

      <input type="file" accept="image/*" onChange={handleImageUpload} />

      {image && <img src={image} alt="Uploaded" style={{ width: '100%', margin: '10px 0' }} />}

      <button onClick={startCameraAndCapture}>
        {isCameraActive ? 'Capture & OCR' : 'Scan via Camera'}
      </button>

      <div style={{ marginTop: '10px' }}>
        <video ref={videoRef} className={isCameraActive ? 'video-active' : ''}></video>
        <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
      </div>

      {loading && <p>Processing...</p>}

      <textarea
        rows="4"
        placeholder="Enter text to translate"
        value={text}
        onChange={(e) => setText(e.target.value)}
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

      <button onClick={handleTranslate}>Translate</button>

      <h3>Translation:</h3>
      <p>{translation}</p>
    </div>
  );
};

export default Translate;
