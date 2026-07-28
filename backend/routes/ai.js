const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/ai/generate — Generate hero headline + about text
router.post('/generate', async (req, res) => {
  const { businessName, niche } = req.body;
  if (!businessName || !niche) {
    return res.status(400).json({ message: 'businessName and niche are required.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a professional copywriter for local businesses.
Generate content for a business called "${businessName}" in the "${niche}" industry.

Return ONLY valid JSON (no markdown, no extra text):
{
  "heroHeadline": "A punchy, catchy headline under 10 words",
  "aboutText": "A warm, professional 3-sentence About Us paragraph"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse AI response');
    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    console.error('Gemini error, using fallback:', err.message);
    // Graceful fallback
    res.json({
      heroHeadline: `${businessName} — Excellence You Can Trust`,
      aboutText: `At ${businessName}, we bring passion and expertise to every ${niche} experience. Our dedicated team is committed to quality, creativity, and customer satisfaction above all else. Come discover why our community loves us — we can't wait to serve you.`,
    });
  }
});

module.exports = router;
