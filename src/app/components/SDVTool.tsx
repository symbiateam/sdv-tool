"use client";

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Discrepancy {
  field: string;
  source: string;
  caseReport: string;
  type: 'mismatch';
}

const SDVTool: React.FC = () => {
  const [sourceDoc, setSourceDoc] = useState<string | null>(null);
  const [caseReport, setCaseReport] = useState<string | null>(null);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);

  const parseFileContent = async (file: File) => {
    try {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        // Return pretty-printed JSON for display
        return JSON.stringify(parsed, null, 2);
      } else {
        return 'Please upload a JSON file';
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return 'Error parsing JSON file';
    }
  };

  const handleSourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const parsedContent = await parseFileContent(file);
        setSourceDoc(parsedContent);
      } catch (error) {
        console.error('Error handling file:', error);
        setSourceDoc('Error reading file');
      }
    }
  };

  const handleCaseReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const parsedContent = await parseFileContent(file);
        setCaseReport(parsedContent);
      } catch (error) {
        console.error('Error handling file:', error);
        setCaseReport('Error reading file');
      }
    }
  };

  const compareDocuments = async () => {
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceDoc,
          caseReport
        })
      });

      if (!response.ok) {
        throw new Error('Failed to compare documents');
      }

      const data = await response.json();
      setDiscrepancies(data.discrepancies);
    } catch (error) {
      console.error('Error comparing documents:', error);
      // Add error handling UI here if needed
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-700">3% eCRF SDV: Document Comparison</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Documentation */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Source Documentation</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {!sourceDoc ? (
              <div>
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleSourceUpload}
                  />
                  <span className="text-blue-500 hover:text-blue-600">
                    Upload source document
                  </span>
                </label>
              </div>
            ) : (
              <div className="text-left whitespace-pre-wrap text-gray-700">
                {sourceDoc}
              </div>
            )}
          </div>
        </div>

        {/* Case Report Form */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Case Report Form</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {!caseReport ? (
              <div>
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleCaseReportUpload}
                  />
                  <span className="text-blue-500 hover:text-blue-600">
                    Upload case report
                  </span>
                </label>
              </div>
            ) : (
              <div className="text-left whitespace-pre-wrap text-gray-700">
                {caseReport}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discrepancies Section */}
      {discrepancies.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Discrepancies Found</h2>
          {discrepancies.map((discrepancy, index) => (
            <div key={index} className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {discrepancy.field}: Mismatch detected
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Source: {discrepancy.source}</p>
                    <p>Case Report: {discrepancy.caseReport}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={compareDocuments}
          disabled={!sourceDoc || !caseReport}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Compare Documents
        </button>
        <button
          disabled={discrepancies.length === 0}
          className="border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded disabled:opacity-50"
        >
          Resolve All
        </button>
      </div>
    </div>
  );
};

export default SDVTool;