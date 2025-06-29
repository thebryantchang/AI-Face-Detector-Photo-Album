import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import styled, { css } from "styled-components";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

const Overlay = styled.div<{ $isMobile: boolean }>`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ $isMobile }) => ($isMobile ? '8px' : '32px')};
  box-sizing: border-box;
  min-height: 100vh;
  min-width: 100vw;
`;

const Card = styled.div<{ $isMobile: boolean }>`
  background: rgba(255,255,255,0.04);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.45);
  padding: ${({ $isMobile }) => ($isMobile ? '8px' : '32px')};
  position: relative;
  max-width: ${({ $isMobile }) => ($isMobile ? '98vw' : '80vw')};
  max-height: ${({ $isMobile }) => ($isMobile ? '90vh' : '80vh')};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
`;

const Img = styled.img<{ $isMobile: boolean }>`
  max-width: ${({ $isMobile }) => ($isMobile ? '90vw' : '70vw')};
  max-height: ${({ $isMobile }) => ($isMobile ? '60vh' : '70vh')};
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.35);
  background: #fff;
  margin-bottom: ${({ $isMobile }) => ($isMobile ? '16px' : '32px')};
  border: 1.5px solid #e0e0e0;
  transition: box-shadow 0.2s;
`;

const buttonBase = css<{ $isMobile: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 24px;
  font-weight: 600;
  font-size: ${({ $isMobile }) => ($isMobile ? '16px' : '18px')};
  padding: ${({ $isMobile }) => ($isMobile ? '10px 18px' : '12px 28px')};
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  outline: none;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  margin: ${({ $isMobile }) => ($isMobile ? '0 0 8px 0' : '0 12px 0 0')};
`;

const BackButton = styled.button<{ $isMobile: boolean }>`
  ${buttonBase}
  position: fixed;
  top: ${({ $isMobile }) => ($isMobile ? '10px' : '32px')};
  left: ${({ $isMobile }) => ($isMobile ? '10px' : '32px')};
  background: rgba(255,255,255,0.92);
  color: #0d6efd;
  border: 1.5px solid #0d6efd;
  font-weight: 700;
  z-index: 1100;
  &:hover, &:active {
    background: #0d6efd;
    color: #fff;
    border-color: transparent;
  }
`;

const DownloadButton = styled.button<{ $isMobile: boolean }>`
  ${buttonBase}
  position: fixed;
  top: ${({ $isMobile }) => ($isMobile ? '10px' : '32px')};
  right: ${({ $isMobile }) => ($isMobile ? '10px' : '32px')};
  background: linear-gradient(90deg, #0d6efd 60%, #5eaefd 100%);
  color: #fff;
  border: none;
  z-index: 1100;
  &:hover, &:active {
    background: #fff;
    color: #0d6efd;
    box-shadow: 0 4px 16px #0d6efd33;
  }
`;

const ImageDisplay = () => {
    const id = useParams().id;
    const imageUrl = decodeURIComponent(id ?? '');
    const isMobile = useIsMobile();

    return (
      <Overlay $isMobile={isMobile}>
        <BackButton $isMobile={isMobile} onClick={() => window.history.back()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </BackButton>
        <DownloadButton
          $isMobile={isMobile}
          onClick={async () => {
            try {
              const link = document.createElement('a');
              link.href = imageUrl;
              link.download = `image-${Date.now()}.jpg`;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              document.body.appendChild(link);
              link.click();
              setTimeout(() => {
                document.body.removeChild(link);
              }, 1000);
            } catch (error) {
              console.log('Download initiated - browser handles the rest');
            }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download
        </DownloadButton>
        <Card $isMobile={isMobile}>
          <Img $isMobile={isMobile} src={imageUrl} alt="Display" />
        </Card>
      </Overlay>
    );
};

export default ImageDisplay;