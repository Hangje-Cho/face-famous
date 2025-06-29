import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import * as tmImage from '@teachablemachine/image';

function App() {
  // 🚨 1단계에서 복사한 본인의 Teachable Machine 모델 URL을 여기에 붙여넣으세요!
  const modelURL = 'https://teachablemachine.withgoogle.com/models/oNZQSWQ5f/model.json';
  const metadataURL = 'https://teachablemachine.withgoogle.com/models/oNZQSWQ5f/metadata.json';

  const [status, setStatus] = useState('initial'); // 'initial', 'loading', 'result', 'error'
  const [predictions, setPredictions] = useState([]);
  const [imageURL, setImageURL] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const imageRef = useRef(null);
  const modelRef = useRef(null); // 모델을 ref로 관리하여 재로딩 방지

  // Cleanup function for object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imageURL) {
        URL.revokeObjectURL(imageURL);
      }
    };
  }, [imageURL]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Revoke previous object URL if exists
      if (imageURL) {
        URL.revokeObjectURL(imageURL);
      }
      const url = URL.createObjectURL(file);
      setImageURL(url);
      setStatus('initial');
      setPredictions([]);
      setErrorMessage('');
    }
  };

  const analyzeImage = async () => {
    if (!imageURL) {
      alert('먼저 이미지를 업로드해주세요.');
      return;
    }

    setStatus('loading');
    setErrorMessage(''); // Clear previous error messages

    try {
      // 모델이 로드되지 않았을 경우에만 로드
      if (!modelRef.current) {
        console.log('Loading Teachable Machine model...');
        modelRef.current = await tmImage.load(modelURL, metadataURL);
        console.log('Model loaded.');
      }
      
      const prediction = await modelRef.current.predict(imageRef.current);
      
      // 확률 높은 순으로 정렬
      prediction.sort((a, b) => b.probability - a.probability);

      setPredictions(prediction);
      setStatus('result');
    } catch (error) {
      console.error('Error analyzing image:', error);
      setErrorMessage('이미지 분석 중 오류가 발생했습니다. 모델 URL을 확인하거나 다시 시도해주세요.');
      setStatus('error');
    }
  };

  return (
    <div className="App">
      <h1>AI 동물상 테스트</h1>
      <p>얼굴 사진을 올리면 AI가 당신의 동물상을 알려줍니다.</p>

      <input type="file" accept="image/*" onChange={handleImageUpload} />
      
      {imageURL && <img src={imageURL} alt="업로드 이미지" className="image-preview" ref={imageRef} />}

      {imageURL && (
        <button className="analyze-button" onClick={analyzeImage} disabled={status === 'loading'}>
          {status === 'loading' ? '분석 중...' : '결과 보기'}
        </button>
      )}
      
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {status === 'result' && (
        <div className="result-container">
          <h2>분석 결과</h2>
          {predictions.map((p, i) => (
            <div className="result-item" key={i}>
              <span className="class-name">{p.className}</span>
              <span className="probability">{(p.probability * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;