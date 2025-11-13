import { MapPin, Star, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostCardProps {
  type: "offer" | "request";
  username: string;
  avatar?: string;
  rating: number;
  category: string;
  categoryImage: string;
  title: string;
  description: string;
  price?: string;
  location: string;
  distance: string;
  time: string;
}

const PostCard = ({
  type,
  username,
  avatar,
  rating,
  category,
  categoryImage,
  title,
  description,
  price,
  location,
  distance,
  time,
}: PostCardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border bg-card">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <img 
            src={categoryImage} 
            alt={category}
            className="h-16 w-16 rounded-lg object-cover border-2 border-border"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{username}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-medium text-darker-gray">{rating.toFixed(1)}</span>
              </div>
            </div>
            <Badge 
              variant={type === "offer" ? "default" : "secondary"}
              className={type === "offer" ? "bg-primary hover:bg-primary-dark" : "bg-secondary text-darker-gray"}
            >
              {type === "offer" ? "Oferece" : "Procura"}
            </Badge>
          </div>
          
          <Badge variant="outline" className="mb-3 text-xs border-primary/30 text-darker-gray">
            {category}
          </Badge>
          
          <h4 className="font-semibold text-lg mb-2 text-foreground">{title}</h4>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {description}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            {price && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="font-medium text-darker-gray">{price}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{location} • {distance}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button className="flex-1 bg-primary hover:bg-primary-dark">
              {type === "offer" ? "Contratar" : "Candidatar-se"}
            </Button>
            <Button variant="outline" className="flex-1 border-border hover:bg-secondary">
              Ver Perfil
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
