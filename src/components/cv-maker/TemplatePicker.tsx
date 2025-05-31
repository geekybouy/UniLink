
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CVTemplate } from '@/types/cvTemplate';
import Image from '@/components/OptimizedImage';

interface TemplatePickerProps {
  templates: CVTemplate[];
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
}

export function TemplatePicker({ templates, selectedTemplateId, onTemplateSelect }: TemplatePickerProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select CV Template</h3>
      <RadioGroup value={selectedTemplateId} onValueChange={onTemplateSelect}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className={`p-4 cursor-pointer ${selectedTemplateId === template.id ? 'border-2 border-primary' : ''}`}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value={template.id} id={`template-${template.id}`} />
                <div className="flex-1">
                  <Label htmlFor={`template-${template.id}`} className="font-medium">{template.name}</Label>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  <div className="mt-3 border rounded overflow-hidden">
                    <Image 
                      src={template.image_preview_url} 
                      alt={template.name} 
                      width={300}
                      height={400}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
