import { useState, useEffect } from 'react';
import Images from './images';
import Upload from './upload';
import '../App.css';
import './home.css';
import axios from 'axios';
import styled from 'styled-components';
import bgImage from '../assets/hero.png';



const CategoryNavbar = styled.div`
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  width: 100%;
  min-width: 0;
  max-width: 100vw;
  gap: 0.75rem;
  padding: 0.5rem 0;
  margin-bottom: 1.5rem;
  border-bottom: 1.5px solid #eee;
  box-sizing: border-box;
  scrollbar-width: thin; /* Firefox */
  -ms-overflow-style: auto; /* IE 10+ */
  &::-webkit-scrollbar {
    height: 6px;
    background: #eee;
  }
  &::-webkit-scrollbar-thumb {
    background: #bbb;
    border-radius: 3px;
  }
`;

const CategoryButton = styled.button<{ active: boolean }>`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1.5px solid black;
  border-radius: 20px;
  background: ${({ active }) => (active ? '#222' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#222')};
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
  font-size: 1rem;
  &:hover {
    background: #eee;
    color: #222;
  }
`;

function App() {
  const categories = ['all', 'day-one', 'awards', 'networking', 'royalty', 'last Day', 'penultimate Day', 'VIP Tour', 'Conference', 'test', 'tryout', 'scrollable'];
  const [links, setLinks] = useState<string[]>([]);
  const [selected, setSelected] = useState('all');
  const [referenceurl, setReferenceurl] = useState("");

  const onSelect = (category: string) => setSelected(category);

  useEffect(() => {
    axios.get('/api/loadimages').then(res => setLinks(res.data));
  }, []);

  return (
    <div className="app-container">

      <img 
        src={bgImage} 
        style={{width: '100vw', height: '100vh', objectFit: 'cover', marginLeft: 'calc(-50vw + 50%)'}} 
        alt="Background"
      />

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-2 mt-4">
        <div className="total-count-display">
          <span className="total-count-label">Total Photos</span>
          <span className="total-count-number">{links.length}</span>
        </div>
      </div>

      {/* Category NavBar */}
      <CategoryNavbar>
        {categories.map((cat) => {
          const label = cat
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          return (
            <CategoryButton
              key={cat}
              active={selected === cat}
              onClick={() => {
                onSelect(cat);
                axios.get(`/api/categories/${cat}`).then((res) => {
                  setLinks(res.data);
                });
              }}
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
              </svg>
              {label}
            </CategoryButton>
          );
        })}
      </CategoryNavbar>

      {/* Image Grid */}
      <Images links={links} />

      {/* Floating Upload Button */}
      {/* Floating Find My Face Button */}
      <div className="floating-find-face">
        <Upload 
          uploadFilter={async (urls: string[]) => {

            try {
              
              setLinks(urls);
            } catch (err) {
              console.error("Face filter failed:", err);
            }
          }}
        />
      </div>
    </div>
  );
}

export default App;