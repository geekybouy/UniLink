
import React, { useState } from 'react';
import { useKnowledge } from '@/contexts/KnowledgeContext';
import { Post, ContentType } from '@/types/knowledge';
import PostCard from './PostCard';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  ListFilter, 
  BookmarkIcon,
  Star,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';

type FeedTab = 'all' | 'featured' | 'bookmarks' | 'my-posts';

const KnowledgeFeed: React.FC = () => {
  const { 
    posts, 
    featuredPosts, 
    bookmarkedPosts, 
    userPosts, 
    tags, 
    isLoading, 
    searchPosts 
  } = useKnowledge();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<ContentType | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const results = await searchPosts({
        query: searchQuery,
        contentType: selectedContentType,
        tag: selectedTag
      });
      setSearchResults(results);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedContentType('all');
    setSelectedTag(undefined);
    setSearchResults([]);
    setHasSearched(false);
  };

  const getDisplayPosts = () => {
    if (hasSearched) {
      return searchResults;
    }
    
    switch (activeTab) {
      case 'featured':
        return featuredPosts;
      case 'bookmarks':
        return bookmarkedPosts;
      case 'my-posts':
        return userPosts;
      default:
        return posts;
    }
  };

  const displayPosts = getDisplayPosts();
  
  // Only show tabs that make sense for the current auth state
  const showBookmarksTab = !!user;
  const showMyPostsTab = !!user;

  return (
    <div className="w-full">
      {/* Search and Filter Bar */}
      <div className="mb-6 bg-card p-4 rounded-lg border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search knowledge hub..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select
              value={selectedContentType}
              onValueChange={(value) => setSelectedContentType(value as ContentType | 'all')}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="link">Links</SelectItem>
                <SelectItem value="file">Files</SelectItem>
                <SelectItem value="image">Images</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedTag} 
              onValueChange={setSelectedTag}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-tags">All Tags</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="flex items-center gap-2"
            >
              {isSearching ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <ListFilter className="h-4 w-4" />
              )}
              Search
            </Button>
            
            {hasSearched && (
              <Button variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </div>
        </div>
        
        {/* Search filters indicators */}
        {hasSearched && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary">
                Search: {searchQuery}
              </Badge>
            )}
            {selectedContentType !== 'all' && (
              <Badge variant="secondary">
                Type: {selectedContentType}
              </Badge>
            )}
            {selectedTag && tags.find(tag => tag.id === selectedTag) && (
              <Badge variant="secondary">
                Tag: {tags.find(tag => tag.id === selectedTag)?.name}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground ml-2">
              {searchResults.length} result(s)
            </span>
          </div>
        )}
      </div>

      {hasSearched ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
          {displayPosts.length > 0 ? (
            <div className="space-y-4">
              {displayPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No results found for your search criteria.</p>
            </div>
          )}
        </div>
      ) : (
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as FeedTab)}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-1">
              <Star className="h-4 w-4" /> Featured
            </TabsTrigger>
            
            {showBookmarksTab && (
              <TabsTrigger value="bookmarks" className="flex items-center gap-1">
                <BookmarkIcon className="h-4 w-4" /> Bookmarked
              </TabsTrigger>
            )}
            
            {showMyPostsTab && (
              <TabsTrigger value="my-posts" className="flex items-center gap-1">
                <User className="h-4 w-4" /> My Posts
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="all">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No posts available.</p>
                </div>
              ) : (
                posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="featured">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              ) : featuredPosts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No featured posts available.</p>
                </div>
              ) : (
                featuredPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="bookmarks">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              ) : !user ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Please log in to see your bookmarks.</p>
                </div>
              ) : bookmarkedPosts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">You haven't bookmarked any posts yet.</p>
                </div>
              ) : (
                bookmarkedPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="my-posts">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              ) : !user ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Please log in to see your posts.</p>
                </div>
              ) : userPosts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">You haven't created any posts yet.</p>
                </div>
              ) : (
                userPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default KnowledgeFeed;
