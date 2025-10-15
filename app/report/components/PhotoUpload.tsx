'use client';

import { useState, useRef } from 'react';
import { Camera, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface PhotoUploadProps {
  photos: File[];
  onChange: (photos: File[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ photos, onChange, maxPhotos = 3 }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 生成预览图片
  const generatePreviews = (files: File[]) => {
    const newPreviews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          if (newPreviews.length === files.length) {
            setPreviews(newPreviews);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 处理文件选择
  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach((file) => {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} 不是有效的图片文件`);
        return;
      }

      // 检查文件大小
      if (file.size > maxSize) {
        alert(`${file.name} 文件过大，请选择小于5MB的图片`);
        return;
      }

      validFiles.push(file);
    });

    // 检查总数量限制
    const totalFiles = photos.length + validFiles.length;
    if (totalFiles > maxPhotos) {
      const allowedCount = maxPhotos - photos.length;
      if (allowedCount > 0) {
        alert(`最多只能上传${maxPhotos}张照片，当前还可以上传${allowedCount}张`);
        validFiles.splice(allowedCount);
      } else {
        alert(`最多只能上传${maxPhotos}张照片`);
        return;
      }
    }

    if (validFiles.length > 0) {
      const newPhotos = [...photos, ...validFiles];
      onChange(newPhotos);
      generatePreviews(newPhotos);
    }
  };

  // 删除照片
  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
    generatePreviews(newPhotos);
  };

  // 拖拽处理
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      {/* 上传区域 */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : photos.length >= maxPhotos
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={photos.length >= maxPhotos}
        />
        
        <div className="text-center">
          {photos.length >= maxPhotos ? (
            <div className="flex flex-col items-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">已达到最大上传数量</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="p-3 bg-gray-100 rounded-full mb-3">
                <Camera className="h-6 w-6 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                点击上传或拖拽照片到此处
              </p>
              <p className="text-xs text-gray-500">
                支持 JPG、PNG 格式，单个文件不超过5MB
              </p>
              <p className="text-xs text-gray-400 mt-1">
                还可以上传 {maxPhotos - photos.length} 张照片
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 照片预览 */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt={`预览 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 删除按钮 */}
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              
              {/* 文件信息 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="truncate">{photos[index]?.name}</p>
                <p>{(photos[index]?.size / 1024 / 1024).toFixed(1)}MB</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <ImageIcon className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <div className="font-medium mb-1">照片上传提示</div>
            <ul className="space-y-0.5 text-xs">
              <li>• 清晰的照片能帮助其他用户更好地了解场所情况</li>
              <li>• 建议拍摄场所外观、排队情况或服务窗口</li>
              <li>• 请注意保护他人隐私，避免拍摄个人信息</li>
              <li>• 上传的照片将经过审核后公开展示</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}