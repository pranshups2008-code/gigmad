import { NextResponse } from 'next/server';
import { PitchStyle } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, authorName, requiredSkills, budget, senderName, portfolioUrl } = body;

    const skillsString = (requiredSkills || []).slice(0, 3).join(', ') || 'modern stacks';
    const portfolioLink = portfolioUrl || 'https://github.com/my-portfolio';
    const myName = senderName || 'Alex';

    const pitches: PitchStyle[] = [
      {
        id: 'direct',
        label: 'Direct & Results-Focused',
        tagline: 'Best for founders & busy executives who hate boilerplate',
        content: `Hey ${authorName || 'there'}, saw your post regarding "${title}".

I specialize in ${skillsString} and have shipped similar systems with high reliability. I reviewed your requirements (${budget ? `budget: ${budget}` : ''}) and can deliver this cleanly without handholding.

Here is my verified portfolio & previous work: ${portfolioLink}

Best regards,
${myName}
(Can hop on a 10-minute sync today or dive straight into Git if you're ready to get this moving)`,
      },
      {
        id: 'portfolio',
        label: 'Proof & Metrics-Driven',
        tagline: 'Highlights exact past results and relevant case studies',
        content: `Hi ${authorName || 'there'},

Your project for "${title}" aligns directly with what I built recently. Specifically around ${skillsString}:
• Shipped production architecture handling thousands of daily users
• High code hygiene, automated tests, and daily video progress updates
• Guaranteed delivery within your milestone schedule

You can inspect my live case studies here: ${portfolioLink}

Let me know what time works best to chat!
— ${myName}`,
      },
      {
        id: 'casual',
        label: 'Casual Social DM (Twitter / Reddit)',
        tagline: 'High response rate on social platforms (sounds like a real peer)',
        content: `Hey ${authorName || 'there'}! Saw your post about "${title}" — exactly what I've been working with (${skillsString}). 

No agency middleman, just clean code/work and fast communication. Here's my work: ${portfolioLink}

DM me the repo or brief and I can share a couple ideas on how we can knock this out quickly!
Cheers,
${myName}`,
      },
    ];

    return NextResponse.json({
      success: true,
      pitches,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate pitches' }, { status: 500 });
  }
}
