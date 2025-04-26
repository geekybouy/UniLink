
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";

const NewPost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("Please write something before posting");
      return;
    }
    // Here you would typically send the post to your backend
    toast.success("Post created successfully!");
    navigate("/feed");
  };

  const handleCancel = () => {
    navigate("/feed");
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/feed")}
            className="mr-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-playfair text-primary font-bold">
            UniLink
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-2xl mx-auto space-y-6">
          <Input
            type="text"
            placeholder="Add a title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg"
          />

          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] text-base"
          />

          {/* Image Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => document.getElementById("image-upload")?.click()}
                className="w-full flex items-center gap-2"
              >
                <Image className="h-5 w-5" />
                Add Image
              </Button>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            {image && (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-auto max-h-[300px] object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="w-1/3"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              className="w-2/3"
              onClick={handleSubmit}
            >
              Post
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewPost;
