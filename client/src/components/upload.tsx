// components/upload.tsx
import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";

interface UploadProps {
  uploadFilter: (url: string) => void;
  buttonLabel?: string;
}

const Upload = ({ uploadFilter, buttonLabel = "Find My Face" }: UploadProps) => {
  const [loading, setLoading] = useState(false);

  const changeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=6f772e6424c923f56c1497d33cdf5aef`,
        formData
      );
      uploadFilter(res.data.data.url);
    } catch (err) {
      console.error("upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FloatingFindFace>
      <UploadButton>
        {!loading ? (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
              <path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
            {buttonLabel}
          </>
        ) : (
          "Processing..."
        )}
        <input type="file" accept="image/*" onChange={changeHandler} />
      </UploadButton>
    </FloatingFindFace>
  );
};

export default Upload;

// Styled Components for Upload
const FloatingFindFace = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;

  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
  }
`;

const UploadButton = styled.label`
  padding: 12px 24px;
  border-radius: 24px;
  background-color: #0d6efd;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #0b5ed7;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  input {
    display: none;
  }
`;
