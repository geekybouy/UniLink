
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { cvData, enhancementOptions } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }
    
    // Prepare data for OpenAI
    const enhancementInstructions = prepareEnhancementInstructions(enhancementOptions);
    const sectionsToEnhance = prepareEnhancementData(cvData);
    
    const enhancedData = await enhanceWithOpenAI(sectionsToEnhance, enhancementInstructions);
    
    return new Response(JSON.stringify(enhancedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in enhance-cv function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function prepareEnhancementInstructions(options) {
  let instructions = "You are a professional CV/resume expert. Enhance the following CV content while keeping the original meaning intact. ";
  
  if (options.improveLanguage) {
    instructions += "Improve the professional language and phrasing. ";
  }
  
  if (options.optimizeForATS) {
    instructions += "Optimize content for Applicant Tracking Systems by using relevant keywords naturally. ";
  }
  
  if (options.addActionVerbs) {
    instructions += "Use strong action verbs at the beginning of experience bullet points. ";
  }
  
  if (options.quantifyAchievements) {
    instructions += "Quantify achievements where possible (add metrics, percentages, numbers). ";
  }
  
  if (options.correctGrammar) {
    instructions += "Correct any grammar issues and improve overall readability. ";
  }
  
  instructions += "Keep content concise and impactful. Format the output as JSON.";
  
  return instructions;
}

function prepareEnhancementData(cvData) {
  const sectionsToEnhance = {
    workExperience: cvData.workExperience.map(exp => ({
      company: exp.company,
      position: exp.position,
      description: typeof exp.description === 'string' ? 
        exp.description.split('\n') : 
        exp.description
    })),
    projects: cvData.projects.map(project => ({
      name: project.name,
      description: project.description,
      technologies: project.technologies
    }))
  };
  
  return sectionsToEnhance;
}

async function enhanceWithOpenAI(sections, instructions) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: instructions },
          { 
            role: 'user', 
            content: `Enhance these CV sections:\n${JSON.stringify(sections, null, 2)}` 
          }
        ],
        temperature: 0.7,
      }),
    });
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }
    
    // Parse the enhanced content from OpenAI's response
    try {
      const enhancedContent = JSON.parse(data.choices[0].message.content);
      
      return {
        enhancedWorkExperience: sections.workExperience.map((original, index) => ({
          original: {
            description: original.description
          },
          enhanced: {
            description: enhancedContent.workExperience[index]?.description || original.description
          }
        })),
        enhancedProjects: sections.projects.map((original, index) => ({
          original: {
            description: original.description
          },
          enhanced: {
            description: enhancedContent.projects[index]?.description || original.description
          }
        }))
      };
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse enhanced content');
    }
    
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}
