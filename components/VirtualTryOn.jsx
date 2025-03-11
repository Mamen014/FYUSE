// Updated VirtualTryOn.jsx with error handling and preview support
import React, { useState } from 'react';
import axios from 'axios';

const VirtualTryOn = () => {
  const [userImage, setUserImage] = useState(null);
  const [apparelImage, setApparelImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(null);
  const [apparelImagePreview, setApparelImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleUserImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserImage(file);
      setUserImagePreview(URL.createObjectURL(file));
    }
  };

  const handleApparelImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setApparelImage(file);
      setApparelImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userImage || !apparelImage) {
      setError('Please upload both user and apparel images.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResultImageUrl(null);

      const formData = new FormData();
      formData.append('userImage', userImage);
      formData.append('apparelImage', apparelImage);

      const response = await axios.post(
        'https://ipgyftqcsg.execute-api.ap-southeast-2.amazonaws.com/dev/tryon-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.generated_image_url) {
        setResultImageUrl(response.data.generated_image_url);
      } else if (response.data?.error) {
        setError(`Server error: ${response.data.error}`);
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'An error occurred during virtual try-on.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Virtual Try-On</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Upload User Image</label>
          <input type="file" accept="image/*" onChange={handleUserImageChange} />
          {userImagePreview && (
            <img
              src={userImagePreview}
              alt="User Preview"
              className="mt-2 w-full max-h-48 object-contain rounded-lg border"
            />
          )}
        </div>

        <div>
          <label className="block font-medium">Upload Apparel Image</label>
          <input type="file" accept="image/*" onChange={handleApparelImageChange} />
          {apparelImagePreview && (
            <img
              src={apparelImagePreview}
              alt="Apparel Preview"
              className="mt-2 w-full max-h-48 object-contain rounded-lg border"
            />
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Try On'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {resultImageUrl && (
        <div className="mt-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Result</h2>
          <img
            src={resultImageUrl}
            alt="Try-On Result"
            className="w-full max-h-96 object-contain rounded-lg border"
          />
        </div>
      )}
    </div>
  );
};

export default VirtualTryOn;
