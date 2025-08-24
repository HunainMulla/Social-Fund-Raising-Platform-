import { useState } from "react";
import { Plus, Image, X, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { API_BASE_URL } from "../lib/api";

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = [
    "General",
    "Campaign Update",
    "Community",
    "Education", 
    "Healthcare",
    "Environment",
    "Animal Welfare",
    "Arts & Culture",
    "Technology",
    "Sports"
  ];

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToCloudinary = async () => {
    if (!image) return "";

    try {
      const data = new FormData();
      data.append('file', image);
      data.append('upload_preset', 'unsigned_upload');
      data.append('cloud_name', 'dgbzv4qbb');

      const res = await fetch(
        'https://api.cloudinary.com/v1_1/dgbzv4qbb/image/upload',
        {
          method: 'POST',
          body: data,
        }
      );

      const json = await res.json();
      return json.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error("Failed to upload image");
    }
  };

  const clearImage = () => {
    setImage(null);
    setImageUrl("");
  };

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to create a post");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      let uploadedImageUrl = "";

      // Upload image if selected
      if (image) {
        uploadedImageUrl = await uploadImageToCloudinary();
      }

      // Create post
      const response = await fetch(`${API_BASE_URL}/posts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          image: uploadedImageUrl,
          category,
          tags: tags.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Post created successfully!");
        
        // Reset form
        setTitle("");
        setContent("");
        setCategory("General");
        setTags("");
        setImage(null);
        setImageUrl("");
        
        // Close the form after a short delay
        setTimeout(() => {
          setIsCreating(false);
          setSuccess("");
          if (onPostCreated) {
            onPostCreated(); // Callback to refresh posts list
          }
        }, 1500);
      } else {
        setError(data.message || "Failed to create post");
      }
    } catch (error: any) {
      console.error("Create post error:", error);
      setError("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("General");
    setTags("");
    setImage(null);
    setImageUrl("");
    setError("");
    setSuccess("");
    setIsCreating(false);
  };

  if (!isCreating) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <Button 
            onClick={() => setIsCreating(true)}
            className="w-full bg-yellow-500 hover:bg-yellow-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Post
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Create New Post</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetForm}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success/Error Messages */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-sm font-medium">
            Post Title *
          </Label>
          <Input
            id="title"
            placeholder="Enter a title for your post"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2"
            disabled={isLoading}
          />
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content" className="text-sm font-medium">
            Content *
          </Label>
          <Textarea
            id="content"
            placeholder="Share your thoughts, updates, or news..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-2 min-h-[120px]"
            disabled={isLoading}
          />
        </div>

        {/* Category and Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isLoading}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tags" className="text-sm font-medium">
              Tags (comma separated)
            </Label>
            <Input
              id="tags"
              placeholder="campaign, community, update"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-2"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <Label className="text-sm font-medium">Add Photo (Optional)</Label>
          <div className="mt-2 space-y-2">
            {imageUrl ? (
              <div className="relative">
                <img 
                  src={imageUrl} 
                  alt="Selected" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading || !image}
                  className="min-w-fit"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            onClick={handlePost}
            disabled={!title.trim() || !content.trim() || isLoading}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Creating Post...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={resetForm}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
