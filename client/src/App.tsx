import { useState, useEffect } from 'react';
import Images from './components/images';
import Upload from './components/upload';
import './App.css';
import axios from 'axios';

function App() {
  const categories = ['all', 'day-one', 'awards', 'networking', 'royalty', 'last Day', 'penultimate Day', 'VIP Tour', 'Conference', ];
  const [links, setLinks] = useState<string[]>([]);
  const [selected, setSelected] = useState('all');
  const [referenceurl, setReferenceurl] = useState("");

  const onSelect = (category: string) => setSelected(category);

  useEffect(() => {
    axios.get('/api/loadimages').then(res => setLinks(res.data));
  }, []);

  return (
    <div className="app-container">

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-2 mt-4">
        <div className="total-count-display">
          <span className="total-count-label">Total Photos</span>
          <span className="total-count-number">{links.length}</span>
        </div>
      </div>

      {/* Category NavBar */}

          {/* Category NavBar */}
<div className="category-navbar d-flex flex-nowrap overflow-auto py-2 gap-3">
  {categories.map((cat) => {
    const label = cat
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    return (
      <button
        key={cat}
        onClick={() => {
          onSelect(cat);
          axios.get(`/api/categories/${cat}`).then((res) => {
            setLinks(res.data);
          });
        }}
        className={`category-btn ${
          selected === cat ? 'active' : ''
        }`}
        style={{ border: '1.5px solid black' }}  // Add this line
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
      </button>
    );
  })}
</div>

      {/* Image Grid */}
      <Images links={links} />

      {/* Floating Upload Button */}
{/* Floating Find My Face Button */}
<div className="floating-find-face">
  <Upload 
    uploadFilter={async (url: string) => {
      setReferenceurl(url);
      try {
        const res = await axios.post('/api/facefilter', {
          reference: url,
          candidates: links
        });
        setLinks(res.data);
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