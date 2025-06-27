import { useParams } from "react-router-dom";

const ImageDisplay = () => {
    const id = useParams().id;
    const imageUrl = decodeURIComponent(id ?? '');

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
        <button 
        onClick={() => window.history.back()}
        style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255, 255, 255, 0.9)', // Solid light gray
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '24px',
            padding: '8px 16px 8px 12px',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease-out',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            color: '#333', // Dark text for contrast
            fontWeight: '500'
        }}
        onMouseOver={e => {
            e.currentTarget.style.background = '#0d6efd';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = 'transparent';
        }}
        onMouseOut={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.color = '#333';
            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
        }}
        >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
        </button>

            {/* Image */}
            <img
                src={imageUrl}
                alt="Display"
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                }}
            />

            {/* Download Button */}
<button
  onClick={async () => {
    try {
      // 1. Create temporary link
      const link = document.createElement('a');
      
      // 2. Set up download attributes
      link.href = imageUrl;
      link.download = `image-${Date.now()}.jpg`;
      link.target = '_blank'; // Open in new tab if download fails
      link.rel = 'noopener noreferrer';
      
      // 3. Trigger download
      document.body.appendChild(link);
      link.click();
      
      // 4. Clean up after 1 second
      setTimeout(() => {
        document.body.removeChild(link);
      }, 1000);
      
    } catch (error) {
      console.log('Download initiated - browser handles the rest');
    }
  }}
  style={{
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#333',
    padding: '8px 16px 8px 12px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease-out',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '15px'
  }}
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
  Download
</button>
        </div>
    );
};

export default ImageDisplay;