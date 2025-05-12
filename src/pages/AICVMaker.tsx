
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { CVData } from '@/types/cv';
import { CVTemplate, EnhancementOptions, EnhancedCVData } from '@/types/cvTemplate';
import { fetchCVTemplates, enhanceCV } from '@/services/cvTemplateService';
import CVForm from '@/components/cv-maker/CVForm';
import { TemplatePicker } from '@/components/cv-maker/TemplatePicker';
import { EnhancementOptionsPanel } from '@/components/cv-maker/EnhancementOptions';
import { EnhancedContentPreview } from '@/components/cv-maker/EnhancedContentPreview';
import { CVPreviewPanel } from '@/components/cv-maker/CVPreviewPanel';

export default function AICVMaker() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('content');
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [cvData, setCVData] = useState<CVData | null>(null);
  const [enhancementOptions, setEnhancementOptions] = useState<EnhancementOptions>({
    improveLanguage: true,
    optimizeForATS: true,
    addActionVerbs: true,
    quantifyAchievements: true,
    correctGrammar: true
  });
  const [enhancedData, setEnhancedData] = useState<EnhancedCVData | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Get selected template object
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || null;

  useEffect(() => {
    async function loadTemplates() {
      try {
        setIsLoading(true);
        const templatesData = await fetchCVTemplates();
        setTemplates(templatesData);
        
        // Set the first template as default if available
        if (templatesData.length > 0) {
          setSelectedTemplateId(templatesData[0].id);
        }
      } catch (error) {
        console.error('Error loading CV templates:', error);
        toast.error('Failed to load CV templates');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTemplates();
  }, []);

  const handleCVSubmit = async (data: CVData) => {
    setCVData(data);
    setActiveTab('enhance');
    toast.success('CV data saved! Now you can enhance it with AI.');
  };

  const handleEnhanceCV = async () => {
    if (!cvData) {
      toast.error('Please fill in your CV data first');
      setActiveTab('content');
      return;
    }
    
    try {
      setIsEnhancing(true);
      const result = await enhanceCV(cvData, enhancementOptions);
      setEnhancedData(result);
      toast.success('CV content enhanced successfully!');
      setActiveTab('preview');
    } catch (error) {
      console.error('Error enhancing CV:', error);
      toast.error('Failed to enhance CV content');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI CV Maker</h1>
            <p className="text-muted-foreground mt-1">Create and enhance your CV with AI assistance</p>
          </div>
          <Button
            variant="outline"
            className="mt-4 md:mt-0"
            onClick={() => navigate('/cv-maker')}
          >
            Switch to Standard CV Maker
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="content">1. Fill Content</TabsTrigger>
            <TabsTrigger value="enhance">2. AI Enhance</TabsTrigger>
            <TabsTrigger value="preview">3. Preview & Export</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <>
                <CVForm onSubmit={handleCVSubmit} />
              </>
            )}
          </TabsContent>

          <TabsContent value="enhance" className="space-y-6">
            {!cvData ? (
              <div className="text-center py-12">
                <p>Please fill in your CV content first</p>
                <Button 
                  variant="secondary" 
                  onClick={() => setActiveTab('content')} 
                  className="mt-4"
                >
                  Go to Content
                </Button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <TemplatePicker 
                      templates={templates}
                      selectedTemplateId={selectedTemplateId}
                      onTemplateSelect={setSelectedTemplateId}
                    />
                  </div>
                  
                  <div>
                    <EnhancementOptionsPanel 
                      options={enhancementOptions}
                      onChange={setEnhancementOptions}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={handleEnhanceCV} 
                    disabled={isEnhancing}
                    size="lg"
                  >
                    {isEnhancing ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        <span>Enhancing Content...</span>
                      </>
                    ) : (
                      'Enhance My CV with AI'
                    )}
                  </Button>
                </div>
                
                <EnhancedContentPreview 
                  enhancedData={enhancedData}
                  isLoading={isEnhancing}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="preview">
            {!cvData ? (
              <div className="text-center py-12">
                <p>Please fill in your CV content first</p>
                <Button 
                  variant="secondary" 
                  onClick={() => setActiveTab('content')} 
                  className="mt-4"
                >
                  Go to Content
                </Button>
              </div>
            ) : (
              <CVPreviewPanel 
                cvData={enhancedData || cvData}
                selectedTemplate={selectedTemplate}
                isEnhanced={!!enhancedData}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
