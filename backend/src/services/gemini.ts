import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generatePetitionText = async (data: any) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const category = data.category || 'all';

    let focusPrompt = '';
    if (category === 'school') {
      focusPrompt = 'Focus primarily on educational infrastructure, school buildings, and learning environments.';
    } else if (category === 'bank') {
      focusPrompt = 'Focus primarily on banking accessibility, ATM density, and proximity to financial institutions.';
    } else if (category === 'finance') {
      focusPrompt = 'Focus primarily on financial empowerment zones, local micro-finance support, and economic hubs.';
    } else {
      focusPrompt = 'Focus on a balanced improvement of education, healthcare, and financial infrastructure gaps.';
    }

    const prompt = `Write a formal government petition for infrastructure investment.
      Category focus: ${category.toUpperCase()} - ${focusPrompt}
      Area: ${data.locationName}
      Population: ${data.population}
      Schools: ${data.schools?.existing || 0} existing, ${data.schools?.required || 0} required (gap: ${data.schools?.gap || 0})
      Hospitals: ${data.hospitals?.existing || 0} existing, ${data.hospitals?.required || 0} required (gap: ${data.hospitals?.gap || 0})
      Banks: ${data.banks?.existing || 0} existing, ${data.banks?.required || 0} required (gap: ${data.banks?.gap || 0})
      Tone: formal, urgent, evidence-based. Include: executive summary, current situation, domain-specific gap analysis (emphasizing ${category}), recommendations, call to action. 3-4 paragraphs.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini Petition Generation Failed:', error);
    // Professional Template Fallback
    return `To the Ministry of Urban Development,

Subject: Urgent Formal Petition for Infrastructure Reform in ${data.locationName}

Executive Summary:
I am writing to formally request immediate attention to the critical infrastructure deficits identified in ${data.locationName}. Our data-driven analysis indicates that the current services are severely insufficient to meet the needs of our population of ${data.population.toLocaleString()}.

Current Disparities:
Currently, the region operates with a significant gap in essential services. Specifically, we require ${data.schools?.gap || 'additional'} educational facilities and ${data.hospitals?.gap || 'additional'} healthcare units to meet basic service delivery standards. The lack of these foundational elements is stalling regional progress and impacting citizen well-being.

Required Action:
We demand a formal review of the local development budget and the immediate prioritization of:
1. Construction of necessary school units.
2. Deployment of advanced healthcare infrastructure.
3. Enhanced financial accessibility through banking network expansion.

We look forward to a swift response regarding the allocation of resources for these critical projects.

Sincerely,
Citizen Governance Representative
InfraLense Analytics Feed`;
  }
};

export const getAIRecommendations = async (data: any) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

  const prompt = `Analyze these infrastructure gaps and provide 3 specific, actionable recommendations for the local government.
    Gaps: ${JSON.stringify(data.gaps)}
    Format as a JSON array of objects: [{ title, description, priority }]`;

  const result = await model.generateContent(prompt);
  try {
    return JSON.parse(result.response.text());
  } catch (e) {
    return [];
  }
};

export async function generateRecommendation(stats: any) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `As an Infrastructure Intelligence AI, provide a single-sentence proactive recommendation based on these system stats: 
    Severity Index: ${stats.globalSeverity}, Hotspots: ${stats.trendingHotspots.join(', ')}. 
    Focus on urgent urban planning actions.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    return "System analysis suggests prioritizing mobile healthcare units in high-density regions showing >60% gap indexes.";
  }
}
