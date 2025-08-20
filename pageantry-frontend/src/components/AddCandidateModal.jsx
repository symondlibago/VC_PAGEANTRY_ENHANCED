import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, User, Hash, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { candidatesAPI } from '../lib/api';

// Validation schema
const candidateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  candidate_number: z.string().min(1, 'Candidate number is required'),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }),
  image: z.any().optional(),
});

const AddCandidateModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editCandidate = null, // New prop for edit mode
  showSuccessAlert = null // New prop for success notification callback
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const isEditMode = !!editCandidate;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(candidateSchema),
  });

  const watchedImage = watch('image');

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (isEditMode && editCandidate) {
      setValue('name', editCandidate.name);
      setValue('candidate_number', editCandidate.candidate_number);
      setValue('gender', editCandidate.gender);
      if (editCandidate.image_url) {
        setImagePreview(editCandidate.image_url);
      }
    } else {
      // Reset form when switching to add mode
      reset();
      setImagePreview(null);
    }
  }, [isEditMode, editCandidate, setValue, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
  
    try {
      let response;
      if (isEditMode) {
        response = await candidatesAPI.update(editCandidate.id, data); // Just pass data
        if (showSuccessAlert) {
          showSuccessAlert('Candidate updated successfully!');
        }
      } else {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('candidate_number', data.candidate_number);
        formData.append('gender', data.gender);
        if (data.image) {
          formData.append('image', data.image);
        }
  
        response = await candidatesAPI.create(formData);
        if (showSuccessAlert) {
          showSuccessAlert('Candidate added successfully!');
        }
      }
  
      reset();
      setImagePreview(null);
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error saving candidate:', error);
      setError(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} candidate`);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const handleClose = () => {
    reset();
    setImagePreview(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 animate-modal-backdrop">
      <Card className="w-full max-w-md bg-card shadow-2xl animate-modal-slide-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">
              {isEditMode ? 'Edit Candidate' : 'Add New Candidate'}
            </CardTitle>
            <CardDescription>
              {isEditMode ? 'Update candidate details and photo' : 'Enter candidate details and upload photo'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-medium">
                Candidate Photo
              </Label>
              <div className="flex flex-col items-center space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setImagePreview(null);
                        setValue('image', null);
                      }}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image').click()}
                    className="cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isEditMode ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Candidate Number */}
            <div className="space-y-2">
              <Label htmlFor="candidate_number" className="text-sm font-medium">
                Candidate Number
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="candidate_number"
                  type="text"
                  placeholder="e.g., 001"
                  className="pl-10"
                  {...register('candidate_number')}
                />
              </div>
              {errors.candidate_number && (
                <p className="text-sm text-destructive">{errors.candidate_number.message}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium">
                Gender
              </Label>
              <Select onValueChange={(value) => setValue('gender', value)} value={watch('gender')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-destructive">{errors.gender.message}</p>
              )}
            </div>

            {/* Candidate Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Candidate Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  className="pl-10"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  isEditMode ? 'Update Candidate' : 'Add Candidate'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCandidateModal;

