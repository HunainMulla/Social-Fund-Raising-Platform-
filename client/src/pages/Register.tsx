import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Eye, EyeOff, Mail, Lock, User, Heart, MapPin, Camera, Phone, X, Upload } from "lucide-react";
import { API_BASE_URL } from "../lib/api";

const RegisterPage = () => {
  const [cloudinary, setCloudinary] = useState<String>("https://api.cloudinary.com/v1_1/dgbzv4qbb/image/upload");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState('');

  const navigate = useNavigate();


  const uploadImage = async () => {
    if (!image) return alert("Please select an image");


    const data = new FormData();
    data.append('file', image);
    data.append('upload_preset', 'unsigned_upload'); // replace with your preset
    data.append('cloud_name', 'dgbzv4qbb');    // replace with your cloud name

    try {
      const res = await fetch(
        'https://api.cloudinary.com/v1_1/dgbzv4qbb/image/upload',
        {
          method: 'POST',
          body: data,
        }
      );

      const json = await res.json();
      setUrl(json.secure_url);
    } catch (err) {
      console.error('Upload error:', err);
      alert("Upload failed!");
    } 
  };



  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\+?[\d\s-()]{10,15}$/.test(mobile.trim())) {
      newErrors.mobile = "Please enter a valid mobile number";
    }

    if (!location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!bio.trim()) {
      newErrors.bio = "Bio is required";
    } else if (bio.length < 10) {
      newErrors.bio = "Bio must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
     uploadImage();
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          mobile,
          location,
          bio,
          avatar: url || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Registration successful!");
        // Store user data if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify({
            id: data.user?.id,
            name: data.user?.name || name,
            email: data.user?.email || email,
            mobile: data.user?.mobile || mobile,
            isLoggedIn: true
          }));
        }
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }

    // Update the corresponding state
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'mobile':
        setMobile(value);
        break;
      case 'location':
        setLocation(value);
        break;
      case 'bio':
        setBio(value);
        break;
      case 'avatar':
        setAvatar(value);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3662/3662580.png" 
              alt="LocalFund Logo"
              className="h-12 w-12"
            />
            <span className="text-3xl font-bold text-yellow-600">
              LocalFund
            </span>
          </Link>
          <p className="text-gray-600 mt-2">Join your community today</p>
        </div>

        {/* Register Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <p className="text-gray-600 text-center">
              Start making a difference in your community
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Mobile Field */}
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className={`pl-10 ${errors.mobile ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-red-500 text-sm">{errors.mobile}</p>
                )}
              </div>

              {/* Location Field */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter your location (e.g., City, State)"
                    value={location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.location && (
                  <p className="text-red-500 text-sm">{errors.location}</p>
                )}
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself and your community involvement..."
                  value={bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className={`${errors.bio ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  rows={3}
                />
                {errors.bio && (
                  <p className="text-red-500 text-sm">{errors.bio}</p>
                )}
              </div>

              {/* Profile Picture Upload */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture <span className="text-gray-500">(Optional)</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload a clear photo of yourself (JPG, PNG, or GIF)
                  </p>
                </div>
                
                {url ? (
                  <div className="mt-2">
                    <div className="relative group">
                      <img 
                        src={url} 
                        alt="Profile preview" 
                        className="w-32 h-32 mx-auto rounded-full object-cover border-2 border-dashed border-gray-300"
                      />
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={uploadImage}
                          className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="Change photo"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setImage(null); setUrl('') }}
                          className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Remove photo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-full w-32 h-32 mx-auto">
                    <div className="space-y-1 text-center">
                      <div className="flex justify-center">
                        <Camera className="mx-auto h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 mx-auto text-xs"
                        >
                          <span>Upload</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={(e) => e.target.files && e.target.files[0] && setImage(e.target.files[0])}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">or drag & drop</p>
                    </div>
                  </div>
                )}
                
                {image && !url && (
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={uploadImage}
                      className="flex items-center space-x-1"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Photo</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setImage(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500 text-center mt-2">PNG, JPG, GIF up to 2MB</p>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <Label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-700">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;