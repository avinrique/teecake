import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Upload,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Check,
  Sparkles,
  Image as ImageIcon,
  Trash2,
  Link as LinkIcon,
  Clipboard,
  Layers,
  Camera,
  RefreshCw,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { BakeryItem, LibraryPhoto } from '../types';
import { DEFAULT_CATEGORIES } from '../data/initialData';
import {
  compressImageDataUrl,
  uploadImageToServer,
  saveDishImageBackup,
  getIndexedDBValue,
  setIndexedDBValue,
} from '../utils/persistentStorage';

// Curated high-resolution artisanal bakery photographs for instant selection
export const ARTISAN_PRESET_PHOTOS: LibraryPhoto[] = [
  {
    id: 'preset-charlotte',
    title: 'Strawberry Rose Charlotte',
    category: 'Cakes & TeaCakes',
    url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-chocolate',
    title: 'Triple Valrhona Ganache',
    category: 'Cakes & TeaCakes',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-pistachio-tart',
    title: 'Pistachio Raspberry Tart',
    category: 'Tarts & Pies',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-croissant',
    title: 'Flaky Golden Croissant',
    category: 'Artisan Breads',
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-macarons',
    title: 'Parisian Macarons Tower',
    category: 'Macarons & Petite Treats',
    url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-cupcake',
    title: 'Madagascar Vanilla Cupcake',
    category: 'Cakes & TeaCakes',
    url: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-sourdough',
    title: 'Rustic Sourdough Boule',
    category: 'Artisan Breads',
    url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-lemon-meringue',
    title: 'Meyer Lemon Meringue Tartlet',
    category: 'Tarts & Pies',
    url: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-rose-cake',
    title: 'Rosewater Lychee Tea Cake',
    category: 'Cakes & TeaCakes',
    url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-pecan-tart',
    title: 'Salted Caramel Pecan Tart',
    category: 'Tarts & Pies',
    url: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-danish',
    title: 'Wild Blueberry Cream Danish',
    category: 'Artisan Breads',
    url: 'https://images.unsplash.com/photo-1549520018-d7318ff02a9c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-opera',
    title: 'Matcha Espresso Opera Cake',
    category: 'Cakes & TeaCakes',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-redvelvet',
    title: 'Velvet Truffle Swirl Cake',
    category: 'Cakes & TeaCakes',
    url: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-galette',
    title: 'Almond Peach Rustic Galette',
    category: 'Tarts & Pies',
    url: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-hazelnut',
    title: 'Dark Chocolate Hazelnut Crunch',
    category: 'Cakes & TeaCakes',
    url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-focaccia',
    title: 'Artisan Herb & Olive Focaccia',
    category: 'Savory Creations',
    url: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=800&q=80',
  },
];

interface ImageUploadCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dishData: Omit<BakeryItem, 'id' | 'order'>, existingId?: string, forcedNewId?: string) => void;
  onDelete?: (id: string) => void;
  editItem?: BakeryItem | null;
  mode?: 'add' | 'replace-photo' | 'edit-full';
  categories?: string[];
  initialFile?: File | null;
}

export const ImageUploadCropModal: React.FC<ImageUploadCropModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editItem,
  mode = 'add',
  categories = DEFAULT_CATEGORIES,
  initialFile = null,
}) => {
  // Main photo state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [sourceTab, setSourceTab] = useState<'upload' | 'url' | 'library'>('upload');
  const [urlInput, setUrlInput] = useState<string>('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Cropper geometry
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | '16:9'>('1:1');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [useOriginalPhoto, setUseOriginalPhoto] = useState<boolean>(false);

  // Form details
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<BakeryItem['category']>('Cakes & TeaCakes');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  const [section, setSection] = useState<'signature' | 'gallery' | 'both'>('both');
  const [description, setDescription] = useState<string>('');
  const [ingredientsText, setIngredientsText] = useState<string>('');

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const previewImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const libraryFileInputRef = useRef<HTMLInputElement | null>(null);

  // Pastry Library dynamic state (supports user uploads, deletion, searching, categories)
  const [libraryPhotos, setLibraryPhotos] = useState<LibraryPhoto[]>(() => {
    try {
      const cached = localStorage.getItem('pastry_library_photos');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return ARTISAN_PRESET_PHOTOS;
  });
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [libraryFilterCategory, setLibraryFilterCategory] = useState<string>('All');
  const [isUploadingToLibrary, setIsUploadingToLibrary] = useState<boolean>(false);
  const [isLibraryDragOver, setIsLibraryDragOver] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAddUrlInput, setShowAddUrlInput] = useState<boolean>(false);
  const [newLibraryPhotoUrl, setNewLibraryPhotoUrl] = useState<string>('');
  const [newLibraryPhotoTitle, setNewLibraryPhotoTitle] = useState<string>('');

  // Flash a friendly helper toast instead of blocking errors
  const showNotice = useCallback((text: string) => {
    setStatusNotice(text);
    setTimeout(() => {
      setStatusNotice((curr) => (curr === text ? null : curr));
    }, 3500);
  }, []);

  // Fetch / sync dynamic library photos from server & IndexedDB
  const loadLibraryPhotos = useCallback(async () => {
    try {
      const res = await fetch('/api/library-photos');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.photos) && data.photos.length > 0) {
          setLibraryPhotos(data.photos);
          localStorage.setItem('pastry_library_photos', JSON.stringify(data.photos));
          setIndexedDBValue('pastry_library_photos', data.photos);
          return;
        }
      }
    } catch (e) {
      console.warn('Network error fetching library photos, falling back to storage:', e);
    }
    try {
      const idbPhotos = await getIndexedDBValue<LibraryPhoto[]>('pastry_library_photos');
      if (idbPhotos && Array.isArray(idbPhotos) && idbPhotos.length > 0) {
        setLibraryPhotos(idbPhotos);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadLibraryPhotos();
    }
  }, [isOpen, loadLibraryPhotos]);

  const nameRef = useRef(name);
  nameRef.current = name;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const processSelectedFile = useCallback((file: File) => {
    const fileNameLower = (file.name || '').toLowerCase();
    const isHeic = fileNameLower.endsWith('.heic') || fileNameLower.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';

    if (isHeic) {
      showNotice('Note: Apple HEIC format detected. For maximum web compatibility, JPG or PNG is recommended.');
    }

    // If name is currently empty in 'add' mode, auto-suggest name from the filename
    if (!nameRef.current && modeRef.current === 'add') {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
      if (cleanName) setName(cleanName);
    }

    setIsImageLoading(true);
    setImageLoadError(null);
    setUseOriginalPhoto(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageSrc(event.target.result);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setRotation(0);
        setIsImageLoading(false);
        showNotice('✓ Photo loaded! You can drag, zoom, and frame it below.');
      } else {
        setIsImageLoading(false);
      }
    };
    reader.onerror = () => {
      try {
        const objUrl = URL.createObjectURL(file);
        setImageSrc(objUrl);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setRotation(0);
        setIsImageLoading(false);
        showNotice('✓ Photo loaded into workspace.');
      } catch (err) {
        setIsImageLoading(false);
        setImageLoadError('Could not read image file. Try another photo or pick from the Pastry Library.');
        showNotice('Could not read image file. Try another photo or paste an image link.');
      }
    };
    reader.readAsDataURL(file);
  }, [showNotice]);

  // Handle URL image load into cropper
  const handleLoadUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      showNotice('Please enter or paste an image URL first.');
      return;
    }
    setImageSrc(trimmed);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    showNotice('✓ Image link loaded into cropper!');
  };

  // Direct selection of photo from the Pastry Library
  const handleSelectPreset = (preset: { url: string; title: string }) => {
    setImageSrc(preset.url);
    if (!name && mode === 'add') {
      setName(preset.title);
    }
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setUseOriginalPhoto(false);
    setSourceTab('upload');
    showNotice(`✓ "${preset.title}" selected! Preview updated below.`);
  };

  // Upload new photo(s) directly to the Pastry Library
  const handleUploadToLibraryFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingToLibrary(true);
    showNotice(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''} to Pastry Library...`);

    const addedList: LibraryPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const compressed = await compressImageDataUrl(dataUrl, 1600, 1600, 0.88);
        const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
        const formattedTitle = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : 'Artisan Pastry';

        const serverUrl = await uploadImageToServer(compressed, file.name);
        const finalUrl = serverUrl || compressed;

        const newPhoto: LibraryPhoto = {
          id: `lib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: formattedTitle,
          category: (category as string) || 'Custom Uploads',
          url: finalUrl,
          isCustom: true,
          addedAt: Date.now(),
        };
        addedList.push(newPhoto);
      } catch (err) {
        console.warn('Error reading or uploading image file for library:', err);
      }
    }

    if (addedList.length > 0) {
      setLibraryPhotos((prev) => {
        const next = [...addedList, ...prev];
        localStorage.setItem('pastry_library_photos', JSON.stringify(next));
        setIndexedDBValue('pastry_library_photos', next);
        return next;
      });

      try {
        await fetch('/api/library-photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photos: addedList }),
        });
      } catch (e) {
        console.warn('Server sync error for library additions:', e);
      }

      // Automatically select the first uploaded image into the cropper preview
      const first = addedList[0];
      setImageSrc(first.url);
      if (!name && mode === 'add') {
        setName(first.title);
      }
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
      showNotice(`✓ Added ${addedList.length} photo${addedList.length > 1 ? 's' : ''} to Pastry Library & selected!`);
    } else {
      showNotice('Please select valid image files (JPG, PNG, WebP).');
    }

    setIsUploadingToLibrary(false);
  };

  // Add photo via URL directly into Pastry Library
  const handleAddUrlToLibrary = async () => {
    const trimmed = newLibraryPhotoUrl.trim();
    if (!trimmed) {
      showNotice('Please enter an image URL.');
      return;
    }
    const title = newLibraryPhotoTitle.trim() || 'Online Pastry Inspiration';
    const newPhoto: LibraryPhoto = {
      id: `lib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      category: (category as string) || 'Custom Uploads',
      url: trimmed,
      isCustom: true,
      addedAt: Date.now(),
    };

    setLibraryPhotos((prev) => {
      const next = [newPhoto, ...prev];
      localStorage.setItem('pastry_library_photos', JSON.stringify(next));
      setIndexedDBValue('pastry_library_photos', next);
      return next;
    });

    try {
      await fetch('/api/library-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: [newPhoto] }),
      });
    } catch (e) {}

    setImageSrc(newPhoto.url);
    if (!name && mode === 'add') setName(newPhoto.title);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setNewLibraryPhotoUrl('');
    setNewLibraryPhotoTitle('');
    setShowAddUrlInput(false);
    showNotice(`✓ "${title}" added to Pastry Library & selected!`);
  };

  // Delete a photo from the Pastry Library
  const handleDeleteLibraryPhoto = async (photoId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const target = libraryPhotos.find((p) => p.id === photoId);
    setLibraryPhotos((prev) => {
      const next = prev.filter((p) => p.id !== photoId);
      localStorage.setItem('pastry_library_photos', JSON.stringify(next));
      setIndexedDBValue('pastry_library_photos', next);
      return next;
    });
    setDeleteConfirmId(null);

    try {
      await fetch(`/api/library-photos/${encodeURIComponent(photoId)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Server delete error for library photo:', e);
    }
    showNotice(`✓ Removed "${target?.title || 'Photo'}" from Pastry Library`);
  };

  // Reset library back to default artisan presets
  const handleResetLibrary = async () => {
    if (!window.confirm('Reset Pastry Library to original default artisan collection?')) return;
    setLibraryPhotos(ARTISAN_PRESET_PHOTOS);
    localStorage.setItem('pastry_library_photos', JSON.stringify(ARTISAN_PRESET_PHOTOS));
    setIndexedDBValue('pastry_library_photos', ARTISAN_PRESET_PHOTOS);
    try {
      await fetch('/api/library-photos/reset', { method: 'POST' });
    } catch (e) {}
    showNotice('✓ Pastry Library reset to default collection');
  };

  // Unique categories in the library for filtering
  const libraryCategories = useMemo(() => {
    const cats = new Set<string>();
    libraryPhotos.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['All', 'My Uploads', ...Array.from(cats).filter((c) => c !== 'Custom Uploads'), 'Custom Uploads'];
  }, [libraryPhotos]);

  // Filtered library photos based on search and category
  const filteredLibraryPhotos = useMemo(() => {
    const q = librarySearch.trim().toLowerCase();
    return libraryPhotos.filter((p) => {
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q));
      if (!matchesSearch) return false;
      if (libraryFilterCategory === 'All') return true;
      if (libraryFilterCategory === 'My Uploads') return Boolean(p.isCustom);
      return p.category?.toLowerCase() === libraryFilterCategory.toLowerCase();
    });
  }, [libraryPhotos, librarySearch, libraryFilterCategory]);

  const customUploadCount = useMemo(() => {
    return libraryPhotos.filter((p) => p.isCustom).length;
  }, [libraryPhotos]);

  // Clipboard Paste listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept paste inside text inputs unless it's an image file
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            processSelectedFile(blob);
            return;
          }
        }
      }

      // If user pasted a URL string
      const text = e.clipboardData?.getData('text');
      if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
        const activeTag = (document.activeElement?.tagName || '').toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          setImageSrc(text.trim());
          setZoom(1);
          setPan({ x: 0, y: 0 });
          setRotation(0);
          showNotice('✓ Pasted image loaded into cropper!');
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, processSelectedFile, showNotice]);

  // Modal open initialization tracking to prevent overwriting user input while modal is open
  const prevOpenRef = useRef(false);
  const prevItemIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      const isNewOpen = !prevOpenRef.current;
      const isDifferentItem = editItem?.id !== prevItemIdRef.current;

      if (isNewOpen || isDifferentItem) {
        prevItemIdRef.current = editItem?.id;
        setIsCustomCategory(false);
        setCustomCategoryName('');
        setUrlInput('');
        setStatusNotice(null);
        setSourceTab('upload');

        if (initialFile) {
          processSelectedFile(initialFile);
        }

        if (editItem) {
          setName(editItem.name || '');
          setCategory(editItem.category || 'Cakes & TeaCakes');
          setSection(
            editItem.dishType
              ? editItem.dishType
              : editItem.featured && editItem.inGallery
              ? 'both'
              : editItem.featured
              ? 'signature'
              : 'gallery'
          );
          setDescription(editItem.description || '');
          setIngredientsText(Array.isArray(editItem.ingredients) ? editItem.ingredients.join(', ') : '');
          if (!initialFile) {
            setImageSrc(editItem.image || null);
          }
        } else {
          setName('');
          setCategory('Cakes & TeaCakes');
          setSection('gallery');
          setDescription('');
          setIngredientsText('');
          if (!initialFile) {
            setImageSrc(null);
          }
        }
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
        setIsDragOver(false);
      }
    } else {
      prevItemIdRef.current = undefined;
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, editItem?.id, initialFile, processSelectedFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    processSelectedFile(file);
    setTimeout(() => {
      try {
        if (e.target) e.target.value = '';
      } catch (err) {}
    }, 400);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (useOriginalPhoto) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (useOriginalPhoto) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetCrop = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setAspectRatio('1:1');
    setUseOriginalPhoto(false);
  };

  const handleSave = async () => {
    if (isUploading) return;

    const resolvedName = name.trim() || editItem?.name?.trim() || (mode === 'add' ? 'Artisan Creation' : 'Bakery Creation');

    let finalImage = imageSrc || editItem?.image || ARTISAN_PRESET_PHOTOS[0].url;

    // If user framed or adjusted the photo in Crop mode, render high-res export canvas
    const hasAdjustments = zoom !== 1 || pan.x !== 0 || pan.y !== 0 || rotation !== 0 || aspectRatio !== '1:1';
    if (!useOriginalPhoto && previewImageRef.current && hasAdjustments) {
      try {
        const offCanvas = document.createElement('canvas');
        const targetW = 800;
        const targetH = aspectRatio === '1:1' ? 800 : aspectRatio === '4:3' ? 600 : 450;
        offCanvas.width = targetW;
        offCanvas.height = targetH;
        const oCtx = offCanvas.getContext('2d');

        if (oCtx) {
          oCtx.fillStyle = '#ffffff';
          oCtx.fillRect(0, 0, targetW, targetH);

          const vp = viewportRef.current;
          const vpW = vp?.clientWidth || 320;
          const scaleToCanvas = targetW / Math.max(1, vpW);

          oCtx.save();
          oCtx.translate(targetW / 2 + (pan.x * scaleToCanvas), targetH / 2 + (pan.y * scaleToCanvas));
          oCtx.rotate((rotation * Math.PI) / 180);
          oCtx.scale(zoom, zoom);

          const img = previewImageRef.current;
          const imgW = img.naturalWidth || img.width || targetW;
          const imgH = img.naturalHeight || img.height || targetH;
          const imgRatio = Math.max(0.01, imgW / Math.max(1, imgH));
          const targetRatio = targetW / targetH;

          let drawW: number;
          let drawH: number;
          if (imgRatio > targetRatio) {
            drawH = targetH;
            drawW = targetH * imgRatio;
          } else {
            drawW = targetW;
            drawH = targetW / imgRatio;
          }

          oCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          oCtx.restore();

          const exported = offCanvas.toDataURL('image/jpeg', 0.88);
          if (exported && exported.length > 4000 && exported.startsWith('data:image/jpeg')) {
            finalImage = exported;
          }
        }
      } catch (err) {
        console.warn('Canvas export fallback to imageSrc:', err);
        if (imageSrc) finalImage = imageSrc;
      }
    } else if (imageSrc) {
      finalImage = imageSrc;
    }

    // Compress to optimal web dimensions
    if (finalImage && finalImage.startsWith('data:image/')) {
      try {
        finalImage = await compressImageDataUrl(finalImage, 900, 900, 0.84);
      } catch (e) {
        console.warn('Image compression fallback:', e);
      }
    }

    const targetId = editItem?.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    setIsUploading(true);
    try {
      // Direct server upload: Persist to physical /uploads/ file immediately so it saves permanently
      if (finalImage && finalImage.startsWith('data:image/')) {
        try {
          await saveDishImageBackup(targetId, finalImage);
        } catch (e) {
          console.warn('Local image backup notice:', e);
        }

        try {
          const cleanPrefix = `dish_${targetId}`;
          const uploadedUrl = await uploadImageToServer(finalImage, cleanPrefix);
          if (uploadedUrl && uploadedUrl.startsWith('/uploads/')) {
            finalImage = uploadedUrl;
          }
        } catch (uploadErr) {
          console.warn('Direct upload notice:', uploadErr);
        }
      }

      // Always save final image path in IndexedDB backup as well
      try {
        if (finalImage.startsWith('data:image/')) await saveDishImageBackup(targetId, finalImage);
      } catch (e) {}

      const ingredientsList = ingredientsText
        .split(',')
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      const finalCategory = isCustomCategory
        ? (customCategoryName.trim() || 'Cakes & TeaCakes')
        : category;

      await onSave(
        {
          name: resolvedName,
          category: finalCategory,
          description: description.trim() || editItem?.description || 'A delightful handcrafted creation made with premium artisanal ingredients.',
          ingredients: ingredientsList.length > 0 ? ingredientsList : (editItem?.ingredients || ['Fine Flour', 'Pure Butter', 'Golden Sugar', 'Vanilla']),
          image: finalImage,
          featured: section === 'signature' || section === 'both',
          inGallery: section === 'gallery' || section === 'both',
          dishType: section,
        },
        editItem?.id,
        targetId
      );

      onClose();
    } catch (saveErr) {
      console.error('Save dish error:', saveErr);
      showNotice('Could not save dish changes. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 bg-[#fffaf6] border border-[#e8c0c8] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#fcedf0] border-b border-[#ebd0d6]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white rounded-full text-[#9e4c5b] shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-xl font-bold text-[#5e2632]">
                {mode === 'replace-photo'
                  ? 'Set & Crop Dish Photo'
                  : editItem
                  ? 'Edit Creation & Photo'
                  : 'Add New Creation & Upload Photo'}
              </h3>
              <p className="text-xs text-[#8f5d68]">
                Upload from device, paste web link, paste with Ctrl+V, or select from curated pastry library.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7e4f58] hover:text-[#5e2632] hover:bg-white/80 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Friendly Status Notification Toast */}
          {statusNotice && (
            <div className="p-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between animate-in fade-in">
              <span>{statusNotice}</span>
              <button
                type="button"
                onClick={() => setStatusNotice(null)}
                className="text-emerald-600 hover:text-emerald-900 ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Hidden File Input accessible via ref */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Photo Source Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#faeaee] rounded-xl border border-[#ebd0d6]">
            <button
              type="button"
              onClick={() => setSourceTab('upload')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                sourceTab === 'upload'
                  ? 'bg-white text-[#5e2632] shadow-xs'
                  : 'text-[#8b3d4d] hover:bg-white/60'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload / Device</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceTab('url')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                sourceTab === 'url'
                  ? 'bg-white text-[#5e2632] shadow-xs'
                  : 'text-[#8b3d4d] hover:bg-white/60'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Paste Image Link</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceTab('library')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                sourceTab === 'library'
                  ? 'bg-white text-[#5e2632] shadow-xs'
                  : 'text-[#8b3d4d] hover:bg-white/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pastry Library ({libraryPhotos.length})</span>
            </button>
          </div>

          {/* Tab 1: Upload Controls */}
          {sourceTab === 'upload' && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-[#ebd0d6] rounded-xl text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center gap-1.5 px-4 py-2 font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-lg transition-colors cursor-pointer shadow-xs overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <Upload className="w-4 h-4" />
                  <span>Browse Device Files</span>
                </label>
                <span className="text-[11px] text-stone-500">or drag & drop anywhere below</span>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] text-[#7a3b47] bg-[#fbf5f7] px-2.5 py-1 rounded-md border border-[#ebd0d6]">
                <Clipboard className="w-3 h-3 text-[#9e4c5b]" />
                <span>Tip: Copy any image & press <strong>Ctrl+V</strong> to paste</span>
              </div>
            </div>
          )}

          {/* Tab 2: URL Input Bar */}
          {sourceTab === 'url' && (
            <div className="p-3 bg-white border border-[#ebd0d6] rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-[#5e2632]">
                Paste any image URL or link (Unsplash, Pinterest, web link, etc.):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLoadUrl();
                    }
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-[#ebd0d6] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800"
                />
                <button
                  type="button"
                  onClick={handleLoadUrl}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  Load Image
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Dynamic Artisan Pastry Library (Upload, Delete, Filter, & Direct Selection) */}
          {sourceTab === 'library' && (
            <div
              className={`p-3.5 bg-white border rounded-xl space-y-3 transition-colors ${
                isLibraryDragOver ? 'border-[#9e4c5b] bg-[#fff5f7]' : 'border-[#ebd0d6]'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsLibraryDragOver(true);
              }}
              onDragLeave={(e) => {
                // Only reset if left the container
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsLibraryDragOver(false);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsLibraryDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleUploadToLibraryFiles(e.dataTransfer.files);
                }
              }}
            >
              {/* Hidden file input for Library upload */}
              <input
                ref={libraryFileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleUploadToLibraryFiles(e.target.files);
                  }
                  e.target.value = '';
                }}
                className="hidden"
              />

              {/* Library Header & Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-[#f2dbe0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#5e2632] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#9e4c5b]" />
                      Pastry Library
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#faeaee] text-[#8b3d4d] rounded-full border border-[#ebd0d6]">
                      {libraryPhotos.length} Photos{customUploadCount > 0 ? ` • ${customUploadCount} Uploaded` : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Select any photo to apply to your dish, or upload & manage your own pictures below.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] active:scale-95 rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50 overflow-hidden"
                    title="Upload photo files from your computer or device into Pastry Library"
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleUploadToLibraryFiles(e.target.files);
                        }
                        e.target.value = '';
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload to Library</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowAddUrlInput((prev) => !prev)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#8b3d4d] hover:text-[#5e2632] bg-[#faeaee] hover:bg-[#f5d7df] rounded-lg border border-[#ebd0d6] transition-colors cursor-pointer"
                    title="Add image by URL link"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{showAddUrlInput ? 'Hide URL' : '+ Add Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetLibrary}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                    title="Reset library to default artisan photos"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Collapsible Add Image by URL Bar */}
              {showAddUrlInput && (
                <div className="p-3 bg-[#fdf8f9] border border-[#ebd0d6] rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#5e2632]">Add Photo URL to Library:</span>
                    <button
                      type="button"
                      onClick={() => setShowAddUrlInput(false)}
                      className="text-[10px] text-stone-400 hover:text-stone-600"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newLibraryPhotoUrl}
                      onChange={(e) => setNewLibraryPhotoUrl(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="Paste image URL (https://...)"
                      className="sm:col-span-2 px-3 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#9e4c5b] text-stone-800"
                    />
                    <input
                      type="text"
                      value={newLibraryPhotoTitle}
                      onChange={(e) => setNewLibraryPhotoTitle(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="Photo title (optional)"
                      className="px-3 py-1.5 text-xs bg-white border border-[#ebd0d6] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#9e4c5b] text-stone-800"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddUrlToLibrary}
                      className="px-3 py-1 text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-lg shadow-xs cursor-pointer"
                    >
                      Save to Library & Select
                    </button>
                  </div>
                </div>
              )}

              {/* Uploading Status Banner */}
              {isUploadingToLibrary && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#9e4c5b]" />
                  <span>Uploading, optimizing and saving photos to your Pastry Library...</span>
                </div>
              )}

              {/* Search & Category Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Search pastries by name or tag..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-stone-50 border border-[#ebd0d6] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#9e4c5b] text-stone-800"
                  />
                  {librarySearch && (
                    <button
                      type="button"
                      onClick={() => setLibrarySearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {libraryCategories.map((cat) => {
                    const isActive = libraryFilterCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setLibraryFilterCategory(cat)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#9e4c5b] text-white shadow-2xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                        }`}
                      >
                        {cat}
                        {cat === 'My Uploads' && customUploadCount > 0 ? ` (${customUploadCount})` : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drag & Drop Visual Hint */}
              <div className="text-[10px] text-stone-400 text-center py-0.5 border-t border-dashed border-[#ebd0d6]/60">
                Tip: You can also drag & drop photos from your desktop directly here to upload
              </div>

              {/* Photo Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 scrollbar-thin">
                {filteredLibraryPhotos.map((photo) => {
                  const isSelected = imageSrc === photo.url;
                  const isConfirmingDelete = deleteConfirmId === photo.id;

                  return (
                    <div
                      key={photo.id}
                      onClick={() => handleSelectPreset(photo)}
                      className={`group relative rounded-lg overflow-hidden border transition-all text-left bg-stone-900 cursor-pointer select-none ${
                        isSelected
                          ? 'ring-2 ring-[#9e4c5b] border-[#9e4c5b] shadow-md scale-[1.01]'
                          : 'border-[#ebd0d6] hover:border-[#9e4c5b] hover:shadow-md'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-22 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-1.5 inset-x-1.5 flex items-start justify-between gap-1 z-10 pointer-events-none">
                        <div className="flex flex-col gap-1 items-start">
                          {photo.isCustom && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#9e4c5b] text-white rounded-md shadow-xs">
                              My Upload
                            </span>
                          )}
                          {isSelected && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-600 text-white rounded-md shadow-xs flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Selected
                            </span>
                          )}
                        </div>

                        {/* Delete Button (Always interactive) */}
                        <div className="pointer-events-auto">
                          {isConfirmingDelete ? (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="bg-stone-900/95 text-white p-1 rounded-md text-[9px] shadow-lg flex items-center gap-1 animate-in fade-in"
                            >
                              <span className="text-stone-300">Delete?</span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteLibraryPhoto(photo.id, e)}
                                className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(null);
                                }}
                                className="px-1 py-0.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(photo.id);
                              }}
                              className="p-1 rounded-md bg-black/60 hover:bg-red-600 text-stone-300 hover:text-white transition-colors cursor-pointer shadow-xs backdrop-blur-xs opacity-70 group-hover:opacity-100"
                              title="Delete photo from Pastry Library"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bottom Title Bar with One-Click Select */}
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                        <p className="text-[10px] font-semibold text-white truncate leading-tight">
                          {photo.title}
                        </p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[9px] text-stone-300 truncate max-w-[70%]">
                            {photo.category}
                          </span>
                          <span className="text-[9px] font-bold text-[#f5d7df] group-hover:underline">
                            Select →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty state when filtering or searching */}
              {filteredLibraryPhotos.length === 0 && (
                <div className="py-8 text-center space-y-2 bg-[#fbf5f7] rounded-xl border border-dashed border-[#ebd0d6]">
                  <p className="text-xs font-semibold text-[#5e2632]">
                    No photos found matching "{librarySearch || libraryFilterCategory}"
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Upload your own photo to add it to the Pastry Library, or reset your search.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <label
                      className="relative px-3 py-1.5 text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1 overflow-hidden"
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleUploadToLibraryFiles(e.target.files);
                          }
                          e.target.value = '';
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo Now</span>
                    </label>
                    {(librarySearch || libraryFilterCategory !== 'All') && (
                      <button
                        type="button"
                        onClick={() => {
                          setLibrarySearch('');
                          setLibraryFilterCategory('All');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Image & Interactive Cropper Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5e2632] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#9e4c5b]" /> Crop & Framing Workspace
              </label>
              {imageSrc && (
                <button
                  type="button"
                  onClick={handleResetCrop}
                  className="inline-flex items-center gap-1 text-[11px] text-[#8b3d4d] hover:text-[#5e2632] font-semibold cursor-pointer"
                  title="Reset zoom, pan, and rotation"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Crop
                </button>
              )}
            </div>

            {/* Drop / Canvas Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-2.5 flex flex-col items-center justify-center min-h-[280px] transition-all ${
                isDragOver
                  ? 'border-[#9e4c5b] bg-[#fce8ed]'
                  : 'border-[#e6bdc6] bg-[#fdf5f6]'
              }`}
            >
              {imageSrc ? (
                <div className="flex flex-col items-center w-full">
                  <div
                    ref={viewportRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`relative overflow-hidden rounded-2xl shadow-md border-2 border-[#9e4c5b]/40 bg-[#fff5f7] flex items-center justify-center select-none touch-none transition-all ${
                      useOriginalPhoto
                        ? 'w-full max-w-[380px] h-[280px] cursor-default'
                        : aspectRatio === '1:1'
                        ? 'w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] cursor-grab active:cursor-grabbing'
                        : aspectRatio === '4:3'
                        ? 'w-[320px] h-[240px] sm:w-[360px] sm:h-[270px] cursor-grab active:cursor-grabbing'
                        : 'w-[320px] h-[180px] sm:w-[380px] sm:h-[214px] cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    {/* Live hardware-accelerated Preview Image */}
                    <img
                      ref={previewImageRef}
                      src={imageSrc}
                      alt="Adjustable dish preview"
                      onLoad={() => {
                        setIsImageLoading(false);
                        setImageLoadError(null);
                      }}
                      onError={() => {
                        setIsImageLoading(false);
                        setImageLoadError('Could not render image. Please try another photo.');
                      }}
                      draggable={false}
                      className="pointer-events-none select-none max-w-none"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: useOriginalPhoto ? 'contain' : 'cover',
                        transform: useOriginalPhoto
                          ? 'none'
                          : `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                        willChange: 'transform',
                        transition: isDragging ? 'none' : 'transform 0.08s ease-out',
                      }}
                    />

                    {/* Rule-of-thirds grid overlay when in Crop & Frame mode */}
                    {!useOriginalPhoto && (
                      <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 opacity-30">
                        <div className="border-r border-b border-white/70"></div>
                        <div className="border-r border-b border-white/70"></div>
                        <div className="border-b border-white/70"></div>
                        <div className="border-r border-b border-white/70"></div>
                        <div className="border-r border-b border-white/70"></div>
                        <div className="border-b border-white/70"></div>
                        <div className="border-r border-b border-white/70"></div>
                        <div className="border-r border-b border-white/70"></div>
                        <div></div>
                      </div>
                    )}

                    {/* Loading Overlay */}
                    {isImageLoading && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/85 backdrop-blur-xs">
                        <RefreshCw className="w-6 h-6 text-[#9e4c5b] animate-spin mb-2" />
                        <span className="text-xs font-bold text-[#5e2632]">Loading photo...</span>
                      </div>
                    )}

                    {/* Error Overlay */}
                    {!isImageLoading && imageLoadError && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#fff8fa] p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-amber-600 mb-2" />
                        <p className="text-xs font-bold text-[#5e2632] mb-1">Image could not be rendered</p>
                        <p className="text-[11px] text-stone-500 max-w-xs mb-3">{imageLoadError}</p>
                        <label className="relative px-3.5 py-1.5 text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5 overflow-hidden">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Another Photo</span>
                        </label>
                      </div>
                    )}

                    {/* Status badge in bottom left */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-xs rounded text-[10px] text-white/95 pointer-events-none z-20 shadow-xs">
                      {useOriginalPhoto ? 'Full Photo (Original)' : 'Drag to position & frame image'}
                    </div>
                  </div>

                  {/* Mode & Crop Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 w-full mt-3 px-2">
                    {/* Crop vs Original Toggle */}
                    <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg border border-stone-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setUseOriginalPhoto(false)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                          !useOriginalPhoto
                            ? 'bg-[#9e4c5b] text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Crop & Frame
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseOriginalPhoto(true)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                          useOriginalPhoto
                            ? 'bg-[#9e4c5b] text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Use Full Photo
                      </button>
                    </div>

                    {!useOriginalPhoto && (
                      <>
                        {/* Aspect Ratios */}
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-stone-500 mr-1 text-[11px]">Ratio:</span>
                          {(['1:1', '4:3', '16:9'] as const).map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setAspectRatio(r)}
                              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                                aspectRatio === r
                                  ? 'bg-[#9e4c5b] text-white shadow-xs'
                                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>

                        {/* Zoom Slider */}
                        <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-[220px]">
                          <ZoomOut className="w-3.5 h-3.5 text-stone-500" />
                          <input
                            type="range"
                            min="0.8"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#9e4c5b]"
                          />
                          <ZoomIn className="w-3.5 h-3.5 text-stone-500" />
                          <span className="text-[11px] text-stone-600 font-mono w-8">{Math.round(zoom * 100)}%</span>
                        </div>

                        {/* Rotate Button */}
                        <button
                          type="button"
                          onClick={handleRotate}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-md hover:bg-stone-50 cursor-pointer shadow-xs"
                          title="Rotate 90 degrees"
                        >
                          <RotateCw className="w-3.5 h-3.5" /> Rotate
                        </button>
                      </>
                    )}
                  </div>

                  {/* Switch / Replace Bar */}
                  <div className="flex items-center justify-between w-full mt-2.5 pt-2 px-2 border-t border-[#f2dbe0]">
                    <span className="text-[11px] text-stone-500">
                      Want a different photo? Pick from the tabs above or:
                    </span>
                    <label className="relative inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#8b3d4d] hover:text-[#5e2632] bg-white hover:bg-[#faeaee] border border-[#ebd0d6] rounded-lg cursor-pointer transition-colors shadow-2xs overflow-hidden">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload className="w-3 h-3" />
                      <span>Select Different File</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col items-center justify-center p-8 text-center w-full rounded-xl">
                  <div className="p-4 bg-[#fae5e9] text-[#9e4c5b] rounded-full mb-3 shadow-xs">
                    <Camera className="w-8 h-8" />
                  </div>
                  <p className="font-serif-display font-semibold text-[#5e2632] text-base mb-1">
                    {isDragOver ? 'Drop your photo here!' : 'Click to choose photo or drag & drop image here'}
                  </p>
                  <p className="text-xs text-stone-500 max-w-sm mb-3">
                    Supports PNG, JPG, JPEG, WEBP from your phone or computer. Or choose from the tabs above!
                  </p>
                  <div className="flex items-center gap-2 relative z-20">
                    <label className="relative inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] rounded-xl shadow-xs transition-transform hover:scale-105 cursor-pointer overflow-hidden">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload className="w-4 h-4" />
                      <span>Browse Device Photos</span>
                    </label>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSourceTab('library');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#8b3d4d] bg-white border border-[#ebd0d6] hover:bg-[#faeaee] rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" /> Pick from Gallery
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dish Information Fields (Shown when adding or full editing) */}
          {mode !== 'replace-photo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#f0d8de]">
              {/* Dish Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  Dish / Creation Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="e.g. Signature Strawberry Rose Tea Cake"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
                />
              </div>

              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47]">
                    Category
                  </label>
                  {!isCustomCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(true);
                        setCustomCategoryName('');
                      }}
                      className="text-[11px] text-[#9e4c5b] hover:underline cursor-pointer font-semibold"
                    >
                      + New Category
                    </button>
                  )}
                </div>
                {!isCustomCategory ? (
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomCategory(true);
                        setCustomCategoryName('');
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {category && !categories.includes(category) && (
                      <option value={category}>{category}</option>
                    )}
                    <option value="__custom__">+ Create New Category...</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="Enter new category name..."
                        autoFocus
                        className="flex-1 px-3 py-2 text-sm bg-white border border-[#9e4c5b] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(false)}
                        className="px-2.5 py-2 text-xs text-stone-500 hover:text-stone-700 bg-stone-100 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-[10px] text-[#7a3b47]/80">
                      New category filter will automatically appear in filters & update dish counts.
                    </p>
                  </div>
                )}
              </div>

              {/* Section Assignment */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  Section Display
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value as 'signature' | 'gallery' | 'both')}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
                >
                  <option value="signature">🌟 Signature Dishes (Top Curated)</option>
                  <option value="gallery">🖼️ Dishes Gallery (Visual Showcase)</option>
                  <option value="both">🍰 Both (Signature & Gallery)</option>
                </select>
                <p className="mt-1 text-[11px] text-[#7a3b47]/80">
                  All creations appear in the All Dishes Section automatically.
                </p>
              </div>

              {/* Ingredients List */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  Ingredients (separated by commas)
                </label>
                <input
                  type="text"
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Madagascar Vanilla, Rosewater, Wild Strawberries, Almond Flour"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs"
                />
                <p className="mt-1 text-[11px] text-stone-500">
                  Appears as ingredients badges under the dish description.
                </p>
              </div>

              {/* Small Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a3b47] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  spellCheck={false}
                  placeholder="Tender artisanal sponge topped with delicate fresh berries and floral notes..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b] text-stone-800 shadow-xs resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-[#fcedf0] border-t border-[#ebd0d6]">
          <div>
            {editItem && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(editItem.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer shadow-xs"
                title="Delete this dish from your portfolio"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Dish
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isUploading || isImageLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#9e4c5b] hover:bg-[#853c49] disabled:opacity-60 rounded-lg transition-colors cursor-pointer shadow-md"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Dish & Photo...</span>
                </>
              ) : isImageLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading Photo...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Dish & Photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
