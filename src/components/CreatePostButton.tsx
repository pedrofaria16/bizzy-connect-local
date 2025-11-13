import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CreatePostButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      size="lg"
      onClick={() => navigate("/create-post")}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl bg-gradient-accent hover:scale-110 transition-all duration-300"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

export default CreatePostButton;
