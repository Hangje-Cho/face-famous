import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import * as tmImage from '@teachablemachine/image';

// RecognitionPage Component: This component encapsulates the logic for an image analysis page.
// It can be reused for different types of analysis by passing different model URLs and content.
function RecognitionPage({ modelURL, metadataURL, title, description, resultTitle, onBackToMain }) {
  const [status, setStatus] = useState('initial');
  const [predictions, setPredictions] = useState([]);
  const [imageURL, setImageURL] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const imageRef = useRef(null);
  const modelRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for the file input to clear its value

  // Effect hook to revoke the object URL when imageURL changes or component unmounts
  useEffect(() => {
    return () => {
      if (imageURL) {
        URL.revokeObjectURL(imageURL);
      }
    };
  }, [imageURL]);

  // Handles image file upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (imageURL) {
        URL.revokeObjectURL(imageURL); // Clean up previous image URL
      }
      const url = URL.createObjectURL(file);
      setImageURL(url);
      setStatus('initial');
      setPredictions([]);
      setErrorMessage('');
    }
  };

  // Resets the page to its initial state
  const handleReset = () => {
    setImageURL(null);
    setPredictions([]);
    setErrorMessage('');
    setStatus('initial');
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input value
    }
  };

  // Analyzes the uploaded image using the Teachable Machine model
  const analyzeImage = async () => {
    if (!imageURL) {
      alert('앗, 아직 사진이 없어요! 먼저 귀여운 얼굴 사진을 올려주세요.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Load the model only once
      if (!modelRef.current) {
        const model = await tmImage.load(modelURL, metadataURL);
        modelRef.current = model;
      }

      const model = modelRef.current;
      // Predict the image and sort predictions by probability
      const prediction = await model.predict(imageRef.current);
      setPredictions(prediction.sort((a, b) => b.probability - a.probability));
      setStatus('result');
    } catch (error) {
      console.error("사진 분석 실패:", error);
      setErrorMessage('사진 분석에 실패했어요. 다시 시도해주세요!');
      setStatus('error');
    }
  };

  return (
    <div className="recognition-page">
      <h1>{title}</h1>
      {/* Using dangerouslySetInnerHTML to render HTML from description prop */}
      <p dangerouslySetInnerHTML={{ __html: description }}></p>

      <div className="image-upload-container">
        {!imageURL && (
          <> {/* This block was removed, now restored */}
            <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3h-2zm-1-4L12 6.41 7 11h3v4h4v-4h3z"/>
            </svg>
            <p className="upload-text">클릭 또는 드래그해서 사진 올리기</p>
          </>
        )}
        <label htmlFor="file-upload" className="custom-file-upload"></label>
        <input id="file-upload" type="file" onChange={handleImageUpload} accept="image/*" ref={fileInputRef} className="file-input" />
        {imageURL && <img src={imageURL} alt="업로드된 사진" ref={imageRef} className="uploaded-image" />}
      </div>

      {status !== 'result' && (
          <>
            <button className="analyze-button" onClick={analyzeImage} disabled={status === 'loading' || !imageURL}>
              {status === 'loading' ? '분석 중...' : <>내 닮은 꼴 찾아줘! &rarr;</>}
            </button>
            {status === 'loading' && (
              <p className="loading-message">🔍 AI가 열심히 분석하고 있어요...</p>
            )}
          </>
        )}

        {errorMessage && <p className="error-message">🚨 {errorMessage}</p>}

      {status === 'result' && (
          <div className="result-container">
            <h2>{resultTitle}</h2>
            {predictions.slice(0, 5).map((p, i) => (
              <div className="result-item" key={i}>
                <span className="class-name">{p.className}</span>
                <span className="probability">{(p.probability * 100).toFixed(1)}%</span>
              </div>
            ))}
            <div className="recognition-button-group"> {/* New div to group buttons and apply centering */}
              <button className="analyze-button" onClick={handleReset}>
                다시 분석하기
              </button>
              <button className="analyze-button" onClick={onBackToMain}> 
                메인 페이지로
              </button>
            </div>
          </div>
        )}

        <p className="disclaimer-text">
          입력하신 정보는 본 퀴즈 이외의 용도로 사용하지 않습니다.<br />
          업로드된 사진은 저장되지 않으며, 테스트 완료 시 즉시 폐기됩니다.
        </p>
    </div>
  );
}

// Main App Component
function App() {
  // Model URLs for the animal face recognition page
  const animalFaceModelURL = 'https://teachablemachine.withgoogle.com/models/oNZQSWQ5f/model.json';
  const animalFaceMetadataURL = 'https://teachablemachine.withgoogle.com/models/oNZQSWQ5f/metadata.json';

  // Model URLs for the Italian Brainrot page
  const italianBrainrotModelURL = 'https://teachablemachine.withgoogle.com/models/a1kRVJ4EZ/model.json';
  const italianBrainrotMetadataURL = 'https://teachablemachine.withgoogle.com/models/a1kRVJ4EZ/metadata.json';

  const [currentPage, setCurrentPage] = useState('main');

  // Handlers to navigate to different pages
  const startAnimalFaceRecognition = () => {
    setCurrentPage('animalFaceRecognition');
  };

  const startItalianBrainrotRecognition = () => {
    setCurrentPage('italianBrainrotRecognition');
  };

  const backToMain = () => {
    setCurrentPage('main');
  };

  return (
    <div className="App">
      {/* Main Page: Allows selection of which recognition page to visit */}
      {currentPage === 'main' && (
        <div className="main-page">
          <h1>✨ 내 얼굴에서 AI 닮은꼴 찾기! ✨</h1>
          <p>궁금하시죠? 얼굴 사진을 올리면 AI가 당신과 닮은 매력적인 캐릭터를 찾아드려요!</p>
          <div className="button-group"> {/* Re-added div to group buttons */}
            <button className="analyze-button" onClick={startAnimalFaceRecognition}>
              동물상 찾기 시작하기
            </button>
            <button className="analyze-button" onClick={startItalianBrainrotRecognition}> 
              이탈리안 브레인롯 분석하기
            </button>
          </div>
        </div>
      )}

      {/* Animal Face Recognition Page */}
      {currentPage === 'animalFaceRecognition' && (
        <RecognitionPage
          modelURL={animalFaceModelURL}
          metadataURL={animalFaceMetadataURL}
          title="🐾 내 얼굴에서 동물상 찾기 🐾"
          description="잘 나온 셀카 한 장을 업로드 해주세요.<br />(정면 사진이면 분석이 더 잘된다는 소문이...)"
          resultTitle="💖 당신의 매력적인 동물상은요...! 💖"
          onBackToMain={backToMain}
        />
      )}

      {/* Italian Brainrot Recognition Page */}
      {currentPage === 'italianBrainrotRecognition' && (
        <RecognitionPage
          modelURL={italianBrainrotModelURL}
          metadataURL={italianBrainrotMetadataURL}
          title="🍝 이탈리안 브레인롯 분석 🍝"
          description="당신의 이탈리안 브레인롯 지수를 측정해보세요!<br />셀카를 업로드하면 AI가 분석해드립니다."
          resultTitle="🍝 당신의 이탈리안 브레인롯 지수는...! 🍝"
          onBackToMain={backToMain}
        />
      )}
    </div>
  );
}

export default App;