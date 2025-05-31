
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const RecentPosts = () => {
  const posts = [
    {
      id: 1,
      title: "First day at Google!",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    },
    {
      id: 2,
      title: "Alumni Meetup 2024",
      image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Posts</h3>
      <Carousel className="w-full">
        <CarouselContent>
          {posts.map((post) => (
            <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/3">
              <Card>
                <CardContent className="p-4">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                  <h4 className="font-medium">{post.title}</h4>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default RecentPosts;
