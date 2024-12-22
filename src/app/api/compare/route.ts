import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST(request: Request) {
  try {
    const { sourceDoc, caseReport } = await request.json();

    // Parse the JSON strings if they aren't already objects
    const sourceObj = typeof sourceDoc === 'string' ? JSON.parse(sourceDoc) : sourceDoc;
    const reportObj = typeof caseReport === 'string' ? JSON.parse(caseReport) : caseReport;

    const prompt = `Compare these two medical documents and identify any discrepancies. Focus on dates, values, and medical information.
    
Source Document:
${JSON.stringify(sourceObj, null, 2)}

Case Report Form:
${JSON.stringify(reportObj, null, 2)}

List all discrepancies in this JSON format:
{
  "discrepancies": [
    {
      "field": "field name",
      "source": "value in source",
      "caseReport": "value in case report",
      "type": "mismatch"
    }
  ]
}

Important: Only output valid JSON format. No other text before or after the JSON.`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a medical document verification assistant. Your task is to identify discrepancies between source documents and case report forms. Only output valid JSON. Pay special attention to dates, medical values, and clinical information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API request failed: ${errorText}`);
    }

    const data = await response.json();
    
    // Ensure we get valid JSON from GPT
    try {
      const discrepancies = JSON.parse(data.choices[0].message.content);
      return NextResponse.json(discrepancies);
    } catch (parseError) {
      console.error('Error parsing GPT response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to compare documents' },
      { status: 500 }
    );
  }
}