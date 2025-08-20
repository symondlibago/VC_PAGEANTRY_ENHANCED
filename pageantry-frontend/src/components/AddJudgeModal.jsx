import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Mail, User, Lock, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { judgesAPI } from '../lib/api';

// Validation schema for add mode
const judgeSchemaAdd = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Validation schema for edit mode (password optional)
const judgeSchemaEdit = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
});

const AddJudgeModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editJudge = null, // New prop for edit mode
  showSuccessAlert = null // New prop for success notification callback
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditMode = !!editJudge;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(isEditMode ? judgeSchemaEdit : judgeSchemaAdd),
  });

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (isEditMode && editJudge) {
      setValue('name', editJudge.name);
      setValue('email', editJudge.email);
      setValue('password', ''); // Don't pre-fill password for security
    } else {
      // Reset form when switching to add mode
      reset();
    }
  }, [isEditMode, editJudge, setValue, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const submitData = {
        name: data.name,
        email: data.email,
      };

      // Only include password if it's provided
      if (data.password && data.password.trim() !== '') {
        submitData.password = data.password;
      }

      let response;
      if (isEditMode) {
        // Update existing judge
        response = await judgesAPI.update(editJudge.id, submitData);
        if (showSuccessAlert) {
          showSuccessAlert('Judge updated successfully!');
        }
      } else {
        // Create new judge (password is required for new judges)
        submitData.password = data.password;
        response = await judgesAPI.create(submitData);
        if (showSuccessAlert) {
          showSuccessAlert('Judge added successfully!');
        }
      }
      
      // Reset form and close modal
      reset();
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error saving judge:', error);
      setError(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} judge`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
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
              {isEditMode ? 'Edit Judge' : 'Add New Judge'}
            </CardTitle>
            <CardDescription>
              {isEditMode 
                ? 'Update judge information and credentials' 
                : 'Create a new judge account with login credentials'
              }
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
            {/* Judge Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Judge Name
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

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password {isEditMode && <span className="text-muted-foreground">(leave blank to keep current)</span>}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"}
                  className="pl-10"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
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
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Judge' : 'Create Judge'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddJudgeModal;

