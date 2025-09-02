import { useState, useEffect } from 'react';
import apiClient from '../lib/api';
import { X, Star, Upload, Globe, MapPin, Briefcase, User, Phone, Mail, Link, Hash } from 'lucide-react';

const TestimonialFormModal = ({ isOpen, onClose, testimonial, onSave, isEnglish = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    content_tr: '',
    content_en: '',
    rating: 5,
    city: '',
    country: 'Türkiye',
    highlight: false,
    status: 'pending',
    program_type: 'Kilo Verme Programı',
    linkedin_url: '',
    twitter_url: '',
    website_url: '',
    image_url: '',
    image_alt: '',
    video_url: '',
    tags: [],
    meta_description: ''
  });
  
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const texts = {
    tr: {
      title: testimonial ? 'Yorumu Düzenle' : 'Yeni Yorum Ekle',
      title_field: 'Unvan/Meslek',
      personalInfo: 'Kişisel Bilgiler',
      name: 'İsim Soyisim',
      nameRequired: 'İsim gerekli',
      // ...
      company: 'Şirket/Kurum',
      city: 'Şehir',
      country: 'Ülke',
      
      content: 'İçerik',
      contentTr: 'Türkçe İçerik',
      contentEn: 'İngilizce İçerik',
      contentRequired: 'En az bir dilde içerik gerekli',
      
      settings: 'Ayarlar',
      rating: 'Puan',
      program: 'Program Türü',
      status: 'Durum',
      highlight: 'Öne çıkan yorum',
      
      media: 'Medya',
      imageUrl: 'Profil Fotoğrafı URL',
      imageAlt: 'Fotoğraf Alt Metni',
      videoUrl: 'Video URL',
      
      social: 'Sosyal Medya',
      linkedinUrl: 'LinkedIn URL',
      twitterUrl: 'Twitter URL',
      websiteUrl: 'Website URL',
      
      seo: 'SEO',
      tags: 'Etiketler',
      addTag: 'Etiket Ekle',
      metaDescription: 'Meta Açıklama',
      
      save: 'Kaydet',
      cancel: 'İptal',
      
      programs: {
        'Kilo Verme Programı': 'Kilo Verme Programı',
        'Sporcu Beslenmesi': 'Sporcu Beslenmesi',
        'Hamilelik Beslenmesi': 'Hamilelik Beslenmesi',
        'Hastalıklarda Beslenme': 'Hastalıklarda Beslenme'
      },
      
      statuses: {
        pending: 'Beklemede',
        approved: 'Onaylandı',
        rejected: 'Reddedildi'
      }
    },
    en: {
      title: testimonial ? 'Edit Testimonial' : 'Add New Testimonial',
      title_field: 'Title/Profession',
      personalInfo: 'Personal Information',
      name: 'Full Name',
      nameRequired: 'Name is required',
      // ...
      company: 'Company/Organization',
      city: 'City',
      country: 'Country',
      
      content: 'Content',
      contentTr: 'Turkish Content',
      contentEn: 'English Content',
      contentRequired: 'Content in at least one language is required',
      
      settings: 'Settings',
      rating: 'Rating',
      program: 'Program Type',
      status: 'Status',
      highlight: 'Highlighted testimonial',
      
      media: 'Media',
      imageUrl: 'Profile Image URL',
      imageAlt: 'Image Alt Text',
      videoUrl: 'Video URL',
      
      social: 'Social Media',
      linkedinUrl: 'LinkedIn URL',
      twitterUrl: 'Twitter URL',
      websiteUrl: 'Website URL',
      
      seo: 'SEO',
      tags: 'Tags',
      addTag: 'Add Tag',
      metaDescription: 'Meta Description',
      
      save: 'Save',
      cancel: 'Cancel',
      
      programs: {
        'Kilo Verme Programı': 'Weight Loss Program',
        'Sporcu Beslenmesi': 'Sports Nutrition',
        'Hamilelik Beslenmesi': 'Pregnancy Nutrition',
        'Hastalıklarda Beslenme': 'Medical Nutrition'
      },
      
      statuses: {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected'
      }
    }
  };

  const t = texts[isEnglish ? 'en' : 'tr'];

  useEffect(() => {
    if (testimonial && Object.keys(testimonial).length > 0) {
      let tagsArr = [];
      if (Array.isArray(testimonial.tags)) {
        tagsArr = testimonial.tags;
      } else if (typeof testimonial.tags === 'string') {
        try {
          tagsArr = JSON.parse(testimonial.tags.replace(/'/g, '"'));
        } catch {
          tagsArr = [];
        }
      }
      setFormData({
        name: testimonial.name || '',
        title: testimonial.title || '',
        company: testimonial.company || '',
        content_tr: testimonial.content_tr || '',
        content_en: testimonial.content_en || '',
        rating: typeof testimonial.rating === 'number' ? testimonial.rating : (parseInt(testimonial.rating) || 5),
        city: testimonial.city || '',
        country: testimonial.country || 'Türkiye',
        highlight: typeof testimonial.highlight === 'boolean' ? testimonial.highlight : testimonial.highlight === 'true' || testimonial.highlight === 1 || testimonial.highlight === '1',
        status: testimonial.status || 'pending',
        program_type: testimonial.program_type || 'Kilo Verme Programı',
        linkedin_url: testimonial.linkedin_url || '',
        twitter_url: testimonial.twitter_url || '',
        website_url: testimonial.website_url || '',
        image_url: testimonial.image_url || '',
        image_alt: testimonial.image_alt || '',
        video_url: testimonial.video_url || '',
        tags: tagsArr,
        meta_description: testimonial.meta_description || ''
      });
    } else {
      setFormData({
        name: '',
        title: '',
        company: '',
        content_tr: '',
        content_en: '',
        rating: 5,
        city: '',
        country: 'Türkiye',
        highlight: false,
        status: 'pending',
        program_type: 'Kilo Verme Programı',
        linkedin_url: '',
        twitter_url: '',
        website_url: '',
        image_url: '',
        image_alt: '',
        video_url: '',
        tags: [],
        meta_description: ''
      });
    }
  }, [testimonial]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t.nameRequired;
    }

    if (!formData.content_tr.trim() && !formData.content_en.trim()) {
      newErrors.content = t.contentRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Always send tags as array, highlight as boolean, rating as number
      const cleanData = {
        ...formData,
        rating: Number(formData.rating) || 5,
        highlight: !!formData.highlight,
        tags: Array.isArray(formData.tags) ? formData.tags : [],
      };
      onSave(cleanData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      let v = value;
      // Ensure correct types for controlled fields
      if (field === 'rating') v = Number(value) || 5;
      if (field === 'highlight') v = !!value;
      if (field === 'tags' && !Array.isArray(value)) v = [];
      return {
        ...prev,
        [field]: v
      };
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => handleInputChange('rating', i + 1)}
        className={`w-6 h-6 ${i < formData.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
      >
        <Star className="w-full h-full fill-current" />
      </button>
    ));
  };

  // Always reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        title: '',
        company: '',
        content_tr: '',
        content_en: '',
        rating: 5,
        city: '',
        country: 'Türkiye',
        highlight: false,
        status: 'pending',
        program_type: 'Kilo Verme Programı',
        linkedin_url: '',
        twitter_url: '',
        website_url: '',
        image_url: '',
        image_alt: '',
        video_url: '',
        tags: [],
        meta_description: ''
      });
      setNewTag('');
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{t.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              {t.personalInfo}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.name} *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ahmet Yılmaz"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.title_field}
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Yazılım Geliştirici"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.company}
                </label>
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="ABC Teknoloji"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t.city}
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="İstanbul"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="w-4 h-4 inline mr-1" />
                  {t.country}
                </label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Türkiye"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t.content}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.contentTr}
                </label>
                <textarea
                  value={formData.content_tr || ''}
                  onChange={(e) => handleInputChange('content_tr', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Müşteri yorumu buraya yazılacak..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.contentEn}
                </label>
                <textarea
                  value={formData.content_en || ''}
                  onChange={(e) => handleInputChange('content_en', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Customer testimonial will be written here..."
                />
              </div>
              {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
            </div>
          </div>

          {/* Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t.settings}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.rating}
                </label>
                <div className="flex items-center gap-1">
                  {renderStars()}
                  <span className="ml-2 text-sm text-gray-600">({formData.rating}/5)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  {t.program}
                </label>
                <select
                  value={formData.program_type}
                  onChange={(e) => handleInputChange('program_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Object.entries(t.programs).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.status}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Object.entries(t.statuses).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.highlight}
                    onChange={(e) => handleInputChange('highlight', e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    <Star className="w-4 h-4 inline mr-1 text-yellow-400" />
                    {t.highlight}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Media */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {t.media}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.imageUrl}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    setUploading(true);
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2,8)}.${fileExt}`;
                    const { data, error } = await supabase.storage.from('testimonials-photos').upload(fileName, file, { upsert: true });
                    if (error) {
                      alert('Fotoğraf yüklenemedi: ' + error.message);
                    } else {
                      // Public URL oluştur
                      const { data: publicUrlData } = supabase.storage.from('testimonials-photos').getPublicUrl(fileName);
                      // Çift slash'ı tek slash'a indir
                      let publicUrl = publicUrlData.publicUrl.replace(/([^:])\/{2,}/g, '$1/');
                      handleInputChange('image_url', publicUrl);
                    }
                    setUploading(false);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {uploading && <div className="text-sm text-gray-500 mt-1">Yükleniyor...</div>}
                {formData.image_url && (
                  <img src={formData.image_url} alt="Profil" className="mt-2 rounded shadow max-h-32" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.imageAlt}
                </label>
                <input
                  type="text"
                  value={formData.image_alt || ''}
                  onChange={(e) => handleInputChange('image_alt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Müşteri fotoğrafı"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.videoUrl}
                </label>
                <input
                  type="url"
                  value={formData.video_url || ''}
                  onChange={(e) => handleInputChange('video_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Link className="w-5 h-5" />
              {t.social}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.linkedinUrl}
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url || ''}
                  onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.twitterUrl}
                </label>
                <input
                  type="url"
                  value={formData.twitter_url || ''}
                  onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.websiteUrl}
                </label>
                <input
                  type="url"
                  value={formData.website_url || ''}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://website.com"
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5" />
              {t.seo}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.tags}
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                  value={newTag || ''}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Etiket adı"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t.addTag}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.metaDescription}
                </label>
                <textarea
                  value={formData.meta_description || ''}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="SEO meta açıklaması..."
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.meta_description ? formData.meta_description.length : 0)}/160 karakter
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestimonialFormModal;