import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { processBillImage } from '../utils/ocrService';

function ScanBill() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    amount: '',
    fuelVolume: '',
    odometerReading: '',
    fuelType: 'Petrol',
    // Additional extracted fields
    stationName: '',
    stationAddress: '',
    pumpNumber: '',
    attendantName: '',
    invoiceNumber: '',
    paymentMethod: '',
    vehicleNumber: '',
    pricePerLiter: '',
    taxAmount: '',
    discountAmount: '',
    rawText: ''
  });

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image) return;

    setProcessing(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(image);
      
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result.split(',')[1];
          
          // Call the OCR service
          const data = await processBillImage(base64Image);
          
          if (data) {
            setExtractedData(data);
            
            // Update form with ALL extracted data
            const updatedFormData = {
              date: data.date || '',
              time: data.time || '',
              amount: data.amount || '',
              fuelVolume: data.fuelVolume || '',
              odometerReading: data.odometerReading || '',
              fuelType: data.fuelType || 'Petrol',
              stationName: data.stationName || '',
              stationAddress: data.stationAddress || '',
              pumpNumber: data.pumpNumber || '',
              attendantName: data.attendantName || '',
              invoiceNumber: data.invoiceNumber || '',
              paymentMethod: data.paymentMethod || '',
              vehicleNumber: data.vehicleNumber || '',
              pricePerLiter: data.pricePerLiter || '',
              taxAmount: data.taxAmount || '',
              discountAmount: data.discountAmount || '',
              rawText: data.rawText || ''
            };
            
            setFormData(updatedFormData);
            
            // Check for missing critical fields
            const missing = [];
            if (!data.date) missing.push('date');
            if (!data.amount) missing.push('amount');
            if (!data.fuelVolume) missing.push('fuelVolume');
            if (!data.odometerReading) missing.push('odometerReading');
            
            setMissingFields(missing);
            
            // If all critical fields are present, auto-save
            if (missing.length === 0) {
              await autoSaveRecord(updatedFormData);
            } else {
              // Show form to fill missing critical fields
              setShowForm(true);
            }
          } else {
            console.error('No data returned from OCR');
            setShowForm(true);
          }
        } catch (error) {
          console.error('Error calling OCR service:', error);
          alert('OCR processing failed. Please enter data manually or try again.');
          setShowForm(true);
        }
      };
    } catch (error) {
      console.error('Error reading image:', error);
      alert('Error reading image. Please try again.');
      setShowForm(true);
    } finally {
      setProcessing(false);
    }
  };

  const autoSaveRecord = async (data) => {
    setSaving(true);
    try {
      await saveRecord(data);
      alert('✅ Fuel record saved automatically!');
      resetForm();
      navigate('/');
    } catch (error) {
      console.error('Error auto-saving:', error);
      alert('Failed to save automatically. Please review and save manually.');
      setShowForm(true);
    } finally {
      setSaving(false);
    }
  };

  const saveRecord = async (data) => {
    // Combine date and time for timestamp
    const dateTime = data.date + (data.time ? `T${data.time}` : 'T00:00');
    
    // Prepare the record with all available data
    const record = {
      userId: currentUser.uid,
      date: dateTime,
      amount: parseFloat(data.amount),
      fuelVolume: parseFloat(data.fuelVolume),
      odometerReading: parseFloat(data.odometerReading),
      fuelType: data.fuelType,
      createdAt: new Date().toISOString(),
      // Additional fields (only add if they exist)
      ...(data.stationName && { stationName: data.stationName }),
      ...(data.stationAddress && { stationAddress: data.stationAddress }),
      ...(data.pumpNumber && { pumpNumber: data.pumpNumber }),
      ...(data.attendantName && { attendantName: data.attendantName }),
      ...(data.invoiceNumber && { invoiceNumber: data.invoiceNumber }),
      ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
      ...(data.vehicleNumber && { vehicleNumber: data.vehicleNumber }),
      ...(data.pricePerLiter && { pricePerLiter: parseFloat(data.pricePerLiter) }),
      ...(data.taxAmount && { taxAmount: parseFloat(data.taxAmount) }),
      ...(data.discountAmount && { discountAmount: parseFloat(data.discountAmount) }),
      ...(data.rawText && { rawText: data.rawText })
    };
    
    await addDoc(collection(db, 'fuelRecords'), record);
    
    // Save fuel station info for future reference
    if (data.stationName) {
      await saveFuelStation({
        userId: currentUser.uid,
        stationName: data.stationName,
        stationAddress: data.stationAddress || '',
        lastVisited: dateTime,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const saveFuelStation = async (stationData) => {
    try {
      // Check if station already exists, if not create it
      await addDoc(collection(db, 'fuelStations'), stationData);
    } catch (error) {
      console.error('Error saving fuel station:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await saveRecord(formData);
      alert('✅ Fuel record saved successfully!');
      resetForm();
      navigate('/');
    } catch (error) {
      console.error('Error saving fuel record:', error);
      alert('Failed to save fuel record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      amount: '',
      fuelVolume: '',
      odometerReading: '',
      fuelType: 'Petrol',
      stationName: '',
      stationAddress: '',
      pumpNumber: '',
      attendantName: '',
      invoiceNumber: '',
      paymentMethod: '',
      vehicleNumber: '',
      pricePerLiter: '',
      taxAmount: '',
      discountAmount: '',
      rawText: ''
    });
    setImage(null);
    setPreview(null);
    setShowForm(false);
    setMissingFields([]);
    setExtractedData(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Scan Fuel Bill</h1>

      {/* Extraction Status */}
      {extractedData && missingFields.length === 0 && !saving && (
        <div className="card bg-green-50 border border-green-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">All Data Extracted Successfully!</h3>
              <p className="text-green-700">Saving automatically...</p>
            </div>
          </div>
        </div>
      )}

      {missingFields.length > 0 && (
        <div className="card bg-yellow-50 border border-yellow-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900">Additional Information Needed</h3>
              <p className="text-yellow-700">
                Please fill in the following required fields: {missingFields.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Capture Bill</h2>
          
          {!preview ? (
            <div className="space-y-4">
              {/* Camera Capture */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Camera className="w-6 h-6" />
                <span>Take Photo</span>
              </button>

              {/* File Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-800 px-6 py-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Upload className="w-6 h-6" />
                <span>Upload from Gallery</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className="hidden"
              />

              <p className="text-sm text-gray-500 text-center">
                Capture or upload a clear photo of your fuel bill
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Bill preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={processImage}
                  disabled={processing}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Extract Data</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setImage(null);
                    setPreview(null);
                  }}
                  className="btn-secondary"
                >
                  Retake
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Form Section - Only show if there are missing fields or manual entry */}
        {(showForm || preview) && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              {missingFields.length > 0 ? 'Complete Missing Information' : 'Fuel Details'}
            </h2>
            
            {extractedData && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  ✓ Extracted {Object.keys(extractedData).filter(k => extractedData[k] && k !== 'rawText').length} fields from bill
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {extractedData.date && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Date</span>
                    </div>
                  )}
                  {extractedData.time && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Time</span>
                    </div>
                  )}
                  {extractedData.amount && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Amount</span>
                    </div>
                  )}
                  {extractedData.fuelVolume && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Fuel Volume</span>
                    </div>
                  )}
                  {extractedData.fuelType && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Fuel Type</span>
                    </div>
                  )}
                  {extractedData.pricePerLiter && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Price/Liter</span>
                    </div>
                  )}
                  {extractedData.stationName && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Station Name</span>
                    </div>
                  )}
                  {extractedData.stationAddress && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Station Address</span>
                    </div>
                  )}
                  {extractedData.pumpNumber && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Pump Number</span>
                    </div>
                  )}
                  {extractedData.invoiceNumber && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Invoice Number</span>
                    </div>
                  )}
                  {extractedData.paymentMethod && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Payment Method</span>
                    </div>
                  )}
                  {extractedData.attendantName && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Attendant Name</span>
                    </div>
                  )}
                  {extractedData.vehicleNumber && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Vehicle Number</span>
                    </div>
                  )}
                  {extractedData.taxAmount && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Tax Amount</span>
                    </div>
                  )}
                  {extractedData.discountAmount && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>Discount</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Only show fields that are missing or need verification */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date {!missingFields.includes('date') && <span className="text-green-600">✓</span>}
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`input-field ${missingFields.includes('date') ? 'border-yellow-400' : ''}`}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time {formData.time && <span className="text-green-600">✓</span>}
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type {formData.fuelType && <span className="text-green-600">✓</span>}
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Volume (Liters) {!missingFields.includes('fuelVolume') && formData.fuelVolume && <span className="text-green-600">✓</span>}
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="fuelVolume"
                  value={formData.fuelVolume}
                  onChange={handleInputChange}
                  className={`input-field ${missingFields.includes('fuelVolume') ? 'border-yellow-400' : ''}`}
                  placeholder="10.50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount (₹) {!missingFields.includes('amount') && formData.amount && <span className="text-green-600">✓</span>}
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className={`input-field ${missingFields.includes('amount') ? 'border-yellow-400' : ''}`}
                  placeholder="1050.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Odometer Reading (km) {!missingFields.includes('odometerReading') && formData.odometerReading && <span className="text-green-600">✓</span>}
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="odometerReading"
                  value={formData.odometerReading}
                  onChange={handleInputChange}
                  className={`input-field ${missingFields.includes('odometerReading') ? 'border-yellow-400' : ''}`}
                  placeholder="15000"
                  required
                />
              </div>

              {/* Optional Station Information */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span>🏪 Fuel Station (Optional)</span>
                  {formData.stationName && <span className="ml-2 text-green-600 text-xs">✓ Auto-extracted</span>}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Station Name {formData.stationName && <span className="text-green-600">✓</span>}
                    </label>
                    <input
                      type="text"
                      name="stationName"
                      value={formData.stationName}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g., Indian Oil, BPCL, HP"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank if not applicable</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Station Address {formData.stationAddress && <span className="text-green-600">✓</span>}
                    </label>
                    <textarea
                      name="stationAddress"
                      value={formData.stationAddress}
                      onChange={handleInputChange}
                      className="input-field"
                      rows="2"
                      placeholder="e.g., Main Road, City, PIN Code"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional: Add station location details</p>
                  </div>
                </div>
              </div>
              
              {/* Show other extracted additional information */}
              {(formData.invoiceNumber || formData.pumpNumber || formData.paymentMethod || formData.pricePerLiter) && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">📋 Other Details Extracted</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                    {formData.pricePerLiter && (
                      <div>
                        <span className="font-medium text-gray-700">Price/Liter:</span>
                        <p className="text-gray-900">₹{formData.pricePerLiter}</p>
                      </div>
                    )}
                    {formData.invoiceNumber && (
                      <div>
                        <span className="font-medium text-gray-700">Invoice #:</span>
                        <p className="text-gray-900">{formData.invoiceNumber}</p>
                      </div>
                    )}
                    {formData.pumpNumber && (
                      <div>
                        <span className="font-medium text-gray-700">Pump #:</span>
                        <p className="text-gray-900">{formData.pumpNumber}</p>
                      </div>
                    )}
                    {formData.paymentMethod && (
                      <div>
                        <span className="font-medium text-gray-700">Payment:</span>
                        <p className="text-gray-900">{formData.paymentMethod}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full btn-primary py-3"
              >
                {saving ? 'Saving...' : 'Save Fuel Record'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanBill;

