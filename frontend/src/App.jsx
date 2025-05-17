import React, { useState, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function App() {
  const [page, setPage] = useState('login');
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [budget, setBudget] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [editingPart, setEditingPart] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [savedList, setSavedList] = useState([]);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (page === 'budget') loadSaved();
  }, [page]);

  const base = 'https://kimaeong-backend.onrender.com'; // 백엔드 주소

  const handleLogin = async () => {
    const res = await axios.post(`${base}/login`, { nickname, pin });
    if (res.data.success) setPage('budget');
    else alert('로그인 실패: ' + res.data.message);
  };

  const handleRegister = async () => {
    const res = await axios.post(`${base}/register`, { nickname, pin });
    alert(res.data.message);
  };

  const handleRecommend = async () => {
    const res = await axios.post(`${base}/recommend`, { budget });
    setRecommendation(res.data);
  };

  const handleSearch = async (part) => {
    const cpu = recommendation['CPU']?.name;
    const res = await axios.post(`${base}/search/${part}`, { cpu });
    setEditingPart(part);
    setSearchResults(res.data);
  };

  const applyPart = (newPart) => {
    setRecommendation({ ...recommendation, [editingPart]: newPart });
    setEditingPart(null);
    setSearchResults([]);
  };

  const showDetail = (item) => {
    setDetail(item);
  };

  const saveCurrent = async () => {
    await axios.post(`${base}/save`, { nickname, pin, data: recommendation });
    loadSaved();
  };

  const loadSaved = async () => {
    const res = await axios.post(`${base}/load`, { nickname, pin });
    setSavedList(res.data || []);
  };

  const applySaved = (data) => {
    setRecommendation(data);
  };

  const exportPDF = async () => {
    const element = document.getElementById('quote-box');
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save('견적서.pdf');
  };

  if (page === 'login') {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-xl font-bold mb-4">용산 김애옹 본거지 - 로그인</h1>
        <input className="border p-2 w-full mb-2" placeholder="닉네임 (예: Erika)" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <input className="border p-2 w-full mb-4" type="password" maxLength={4} placeholder="PIN (4자리)" value={pin} onChange={(e) => setPin(e.target.value)} />
        <button className="bg-blue-500 text-white px-4 py-2 mr-2" onClick={handleLogin}>로그인</button>
        <button className="bg-gray-500 text-white px-4 py-2" onClick={handleRegister}>회원가입</button>
      </div>
    );
  }

  const totalPrice = recommendation ? Object.values(recommendation).reduce((acc, item) => acc + item.price, 0) : 0;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">용산 김애옹 본거지</h1>
      <input className="border p-2 w-full mb-4" type="number" placeholder="예산 입력 (예: 2000000)" value={budget} onChange={(e) => setBudget(e.target.value)} />
      <button onClick={handleRecommend} className="bg-blue-500 text-white px-4 py-2 mr-2">견적 추천</button>
      <button onClick={saveCurrent} className="bg-green-600 text-white px-4 py-2 mr-2">견적 저장</button>
      <button onClick={exportPDF} className="bg-gray-800 text-white px-4 py-2">PDF 저장</button>

      {recommendation && (
        <div id="quote-box" className="mt-6 border p-4">
          <h2 className="font-semibold">추천 견적:</h2>
          <ul className="list-disc list-inside">
            {Object.entries(recommendation).map(([part, item]) => (
              <li key={part} className="cursor-pointer hover:underline" onClick={() => showDetail(item)}>
                <strong>{part}</strong>: {item.name} ({item.price}원) <button onClick={() => handleSearch(part)} className="ml-2 text-sm text-blue-600">교체</button>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-bold">총 합계: {totalPrice.toLocaleString()} 원</p>
        </div>
      )}

      {editingPart && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">{editingPart} 교체하기:</h3>
          <ul className="border p-4">
            {searchResults.map((item, index) => (
              <li key={index} className="mb-2">
                <span>{item.name} ({item.price}원)</span>
                <button className="ml-2 bg-green-500 text-white px-2 py-1" onClick={() => applyPart(item)}>선택</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {detail && (
        <div className="mt-4 p-4 border bg-gray-50">
          <h3 className="font-bold">{detail.name} 상세 정보</h3>
          <p>가격: {detail.price.toLocaleString()} 원</p>
          <p>설명: {detail.desc || '상세 설명 없음'}</p>
          <button className="mt-2 bg-gray-300 px-2 py-1" onClick={() => setDetail(null)}>닫기</button>
        </div>
      )}

      {savedList.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold mb-2">저장된 견적:</h3>
          {savedList.map((item, idx) => (
            <button key={idx} className="block border px-4 py-2 mb-2 w-full text-left hover:bg-gray-100" onClick={() => applySaved(item)}>
              견적 #{idx + 1} 불러오기
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
