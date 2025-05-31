
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EnhancedCVData } from '@/types/cvTemplate';
import { Card } from '@/components/ui/card';

interface EnhancedContentPreviewProps {
  enhancedData: EnhancedCVData | null;
  isLoading: boolean;
}

export function EnhancedContentPreview({ enhancedData, isLoading }: EnhancedContentPreviewProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Enhancing your content...</span>
        </div>
      </Card>
    );
  }

  if (!enhancedData?.enhancedWorkExperience?.length && !enhancedData?.enhancedProjects?.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">AI Enhanced Content</h3>
      
      {enhancedData.enhancedWorkExperience && enhancedData.enhancedWorkExperience.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Work Experience</h4>
          {enhancedData.enhancedWorkExperience.map((item, index) => (
            <Card key={index} className="p-4">
              <Tabs defaultValue="enhanced">
                <TabsList className="mb-2">
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
                </TabsList>
                <TabsContent value="original" className="space-y-1">
                  {Array.isArray(item.original.description) 
                    ? item.original.description.map((bullet, i) => (
                        <p key={i} className="text-sm">{bullet}</p>
                      ))
                    : <p className="text-sm">{item.original.description}</p>
                  }
                </TabsContent>
                <TabsContent value="enhanced" className="space-y-1">
                  {Array.isArray(item.enhanced.description) 
                    ? item.enhanced.description.map((bullet, i) => (
                        <p key={i} className="text-sm">{bullet}</p>
                      ))
                    : <p className="text-sm">{item.enhanced.description}</p>
                  }
                </TabsContent>
              </Tabs>
            </Card>
          ))}
        </div>
      )}
      
      {enhancedData.enhancedProjects && enhancedData.enhancedProjects.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Projects</h4>
          {enhancedData.enhancedProjects.map((item, index) => (
            <Card key={index} className="p-4">
              <Tabs defaultValue="enhanced">
                <TabsList className="mb-2">
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
                </TabsList>
                <TabsContent value="original" className="space-y-1">
                  <p className="text-sm">{item.original.description}</p>
                </TabsContent>
                <TabsContent value="enhanced" className="space-y-1">
                  <p className="text-sm">{item.enhanced.description}</p>
                </TabsContent>
              </Tabs>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
