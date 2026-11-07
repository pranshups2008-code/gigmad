import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { pitchText, targetRole } = await request.json();

    if (!pitchText || pitchText.trim().length < 15) {
      return NextResponse.json(
        { error: 'Please enter a pitch with at least 15 characters to analyze.' },
        { status: 400 }
      );
    }

    const text = pitchText.trim();
    const wordCount = text.split(/\s+/).length;

    // Smart heuristic analysis
    let score = 55;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    // Length check
    if (wordCount >= 30 && wordCount <= 90) {
      score += 15;
      strengths.push('Concise length: Founders skim messages in under 10 seconds.');
    } else if (wordCount > 130) {
      score -= 15;
      weaknesses.push('Too wordy: Busy clients rarely read paragraphs longer than 3-4 lines.');
      suggestions.push('Cut filler words and keep total length between 40-80 words.');
    } else {
      score -= 10;
      weaknesses.push('A bit too brief: Lacks tangible proof or context of what you build.');
      suggestions.push('Mention one specific project or relevant metric to establish authority.');
    }

    // Portfolio check
    const hasLink = /(https?:\/\/|github\.com|behance\.net|dribbble|portfolio)/i.test(text);
    if (hasLink) {
      score += 15;
      strengths.push('Includes a proof link / portfolio: Increases response rate by over 60%.');
    } else {
      score -= 15;
      weaknesses.push('No portfolio or demo link included: Clients will assume you have no evidence.');
      suggestions.push('Add a direct link to your best single case study or GitHub repo.');
    }

    // Call to action check
    const hasCTA = /(call|chat|sync|dm|look|mind if|free this week|available)/i.test(text);
    if (hasCTA) {
      score += 10;
      strengths.push('Clear Call-to-Action: Gives the client an effortless next step.');
    } else {
      score -= 10;
      weaknesses.push('Weak closing: Doesn’t invite a low-pressure response.');
      suggestions.push('Close with: "Mind if I send over a 2-minute demo video?" or "Free for a 5-min sync?"');
    }

    // Cliché / Fluff detector
    const hasFluff = /(hardworking|perfectionist|passionate|honest|hire me|trust me|sir|madam)/i.test(text);
    if (hasFluff) {
      score -= 10;
      weaknesses.push('Contains generic filler words ("passionate", "hardworking", etc.) which triggers spam filters.');
      suggestions.push('Replace generic traits with specific technical competencies and shipped results.');
    } else {
      score += 5;
      strengths.push('No corporate cliché fluff: Reads like a confident peer.');
    }

    // Clamp score between 25 and 98
    const finalScore = Math.min(98, Math.max(28, score));

    // Generate improved rewrite
    const role = targetRole || 'Specialist';
    const rewrite = `Hey [Client Name] — saw your post looking for a ${role}.

I recently built a similar project that [mention 1 metric or feature, e.g. handled 5k daily users / increased CTR by 30%]. Clean architecture, zero handholding, fast updates.

Here is the exact live demo: [Your Best Portfolio Link]

Available to start immediately — mind if I send over a 2-minute Loom breakdown of how I’d tackle this?`;

    return NextResponse.json({
      score: finalScore,
      rating: finalScore >= 80 ? 'Elite (High Response Rate)' : finalScore >= 60 ? 'Decent (Needs Polish)' : 'High Risk of Being Ignored',
      strengths,
      weaknesses,
      suggestions,
      optimizedRewrite: rewrite,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to evaluate pitch' }, { status: 500 });
  }
}
