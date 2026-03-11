// lib/rete/controls/ImageControlView.tsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
`;

const Label = styled.div`
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  background: white;
  color: #1e293b;
  cursor: pointer;
  &:focus { outline: none; border-color: #6366f1; }
`;

const Input = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  background: white;
  color: #1e293b;
  box-sizing: border-box;
  &:focus { outline: none; border-color: #6366f1; }
  &::placeholder { color: #94a3b8; }
`;

const UploadBtn = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: 2px dashed #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #6366f1;
  background: #fafafa;
  transition: all 0.15s;
  &:hover { border-color: #6366f1; background: #f0f0ff; }
  input { display: none; }
`;

const PreviewBox = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const PreviewImg = styled.img`
  width: 100%;
  height: 130px;
  object-fit: cover;
  display: block;
`;

const PreviewMeta = styled.div`
  font-size: 10px;
  color: #94a3b8;
  padding: 3px 8px;
`;

const ErrorBox = styled.div`
  font-size: 11px;
  color: #ef4444;
  padding: 6px 8px;
  background: #fff5f5;
  border-radius: 6px;
  border: 1px solid #fecaca;
`;


export function ImageControlView({ data }: { data: any }) {
  const [localData, setLocalData] = useState({ ...data.data });
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgMeta, setImgMeta] = useState<{ w: number; h: number } | null>(null);

  // ✅ Use localData, NOT data.data
  const sourceType = localData.sourceType;
  const url = localData.url;

  useEffect(() => {
    setImgError(false);
    setImgMeta(null);
  }, [url]);

  const handleChange = (patch: any) => {
    data.onChange(patch);
    setLocalData((prev: any) => ({ ...prev, ...patch })); // ✅ triggers re-render
    data.onResize?.();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const uploaded = await res.json();
      handleChange({
        sourceType: "upload",
        url: uploaded.url,
        fileName: file.name,
        publicId: uploaded.publicId,
      });
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Wrapper onPointerDown={(e) => e.stopPropagation()}>
      <div>
        <Label>Image Source</Label>
        <Select
          value={sourceType}              // ✅ localData.sourceType
          onChange={(e) => handleChange({ sourceType: e.target.value })}
        >
          <option value="url">URL</option>
          <option value="upload">Upload</option>
        </Select>
      </div>

      {sourceType === "url" && (
        <div>
          <Label>Image URL</Label>
          <Input
            placeholder="https://example.com/image.jpg"
            value={localData.url}         // ✅ localData.url
            onChange={(e) => handleChange({ url: e.target.value })}
          />
        </div>
      )}

      {sourceType === "upload" && (
        <UploadBtn style={{ opacity: uploading ? 0.6 : 1 }}>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          {uploading
            ? "⏳ Uploading..."
            : localData.fileName          // ✅ localData.fileName
              ? `📷 ${localData.fileName}`
              : "Click to upload image"}
        </UploadBtn>
      )}

      {(sourceType === "url" || sourceType === "upload") && url && !uploading && (
        <PreviewBox>
          {!imgError ? (
            <>
              <PreviewImg
                src={url}                 // ✅ localData.url via const url
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setImgMeta({ w: img.naturalWidth, h: img.naturalHeight });
                  data.onResize?.();
                }}
                onError={() => setImgError(true)}
              />
              {imgMeta && <PreviewMeta>{imgMeta.w} × {imgMeta.h}px</PreviewMeta>}
            </>
          ) : (
            <ErrorBox>Image load failed</ErrorBox>
          )}
        </PreviewBox>
      )}

      <div>
        <Label>Caption (optional)</Label>
        <Input
          placeholder="Image caption."
          value={localData.caption}       // ✅ localData.caption
          onChange={(e) => handleChange({ caption: e.target.value })}
        />
      </div>
    </Wrapper>
  );
}